// Zero-dependency headless Chrome driver.
//
// Talks the DevTools protocol over --remote-debugging-pipe (fd 3 in, fd 4 out,
// messages separated by \0), so it needs no npm package, no WebSocket and no
// open port. Serves the project folder from a local HTTP server and records
// every request, so a page that reaches the network is caught.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync, mkdtempSync, rmSync } from "node:fs";
import { join, extname, resolve, normalize } from "node:path";
import { tmpdir, homedir } from "node:os";

// ---------- find a browser ----------
function globFirst(dir, re, tail) {
  if (!existsSync(dir)) return null;
  for (const d of readdirSync(dir).filter((n) => re.test(n)).sort().reverse()) {
    const p = join(dir, d, ...tail);
    if (existsSync(p)) return p;
  }
  return null;
}

export function findChrome() {
  const env = process.env.MOTION_CHROME || process.env.HYPERFRAMES_BROWSER_PATH || process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (env && existsSync(env)) return env;
  const pw = [process.env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers", join(homedir(), ".cache/ms-playwright"), join(homedir(), "Library/Caches/ms-playwright")].filter(Boolean);
  for (const root of pw) {
    const hs =
      globFirst(root, /^chromium_headless_shell-/, ["chrome-linux", "headless_shell"]) ||
      globFirst(root, /^chromium_headless_shell-/, ["chrome-mac", "headless_shell"]) ||
      globFirst(root, /^chromium_headless_shell-/, ["chrome-headless-shell-mac-arm64", "chrome-headless-shell"]) ||
      globFirst(root, /^chromium-/, ["chrome-linux", "chrome"]);
    if (hs) return hs;
  }
  const fixed = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ];
  for (const p of fixed) if (existsSync(p)) return p;
  const pup = globFirst(join(homedir(), ".cache/puppeteer/chrome"), /./, ["chrome-linux64", "chrome"]);
  return pup;
}

// ---------- static server ----------
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".gif": "image/gif", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf",
  ".wav": "audio/wav", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".mp4": "video/mp4", ".webm": "video/webm",
};

export function serve(root) {
  root = resolve(root);
  const requests = [];
  const server = createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = normalize(join(root, url === "/" ? "/index.html" : url));
    requests.push(url);
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream", "access-control-allow-origin": "*" });
    res.end(readFileSync(file));
  });
  return new Promise((ok) =>
    server.listen(0, "127.0.0.1", () => ok({ url: `http://127.0.0.1:${server.address().port}/`, requests, close: () => server.close() }))
  );
}

// ---------- browser + CDP over pipe ----------
export async function launch({ exe = findChrome(), extraArgs = [] } = {}) {
  if (!exe) throw new Error("No Chrome/Chromium found. Set MOTION_CHROME=/path/to/chrome (see scripts/doctor.mjs).");
  const userDir = mkdtempSync(join(tmpdir(), "motion-chrome-"));
  const args = [
    "--headless=new", "--remote-debugging-pipe", "--no-first-run", "--no-default-browser-check", "--mute-audio",
    "--hide-scrollbars", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "--disable-extensions",
    "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    "--force-color-profile=srgb", "--font-render-hinting=none", "--autoplay-policy=no-user-gesture-required",
    `--user-data-dir=${userDir}`, ...extraArgs, "about:blank",
  ];
  const proc = spawn(exe, args, { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] });
  let stderr = "";
  proc.stderr.on("data", (d) => (stderr = (stderr + d).slice(-4000)));
  const out = proc.stdio[3];
  const inp = proc.stdio[4];
  let buf = Buffer.alloc(0);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Set();
  inp.on("data", (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    let z;
    while ((z = buf.indexOf(0)) !== -1) {
      const msg = JSON.parse(buf.subarray(0, z).toString("utf8"));
      buf = buf.subarray(z + 1);
      if (msg.id && pending.has(msg.id)) {
        const { ok, fail, method } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? fail(new Error(`${method}: ${msg.error.message}`)) : ok(msg.result);
      } else for (const l of listeners) l(msg);
    }
  });
  const exited = new Promise((r) => proc.on("exit", r));
  exited.then(() => {
    for (const { fail } of pending.values()) fail(new Error("Chrome exited.\n" + stderr));
    pending.clear();
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((ok, fail) => {
      const id = nextId++;
      pending.set(id, { ok, fail, method });
      out.write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + "\0");
    });
  await send("Browser.getVersion");

  const browser = {
    send,
    on: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    async newPage({ width, height }) {
      const { targetId } = await send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
      const s = (m, p) => send(m, p, sessionId);
      const events = { console: [], exceptions: [], failed: [], requests: [] };
      browser.on((msg) => {
        if (msg.sessionId !== sessionId) return;
        const p = msg.params || {};
        if (msg.method === "Runtime.consoleAPICalled" && (p.type === "error" || p.type === "assert"))
          events.console.push(p.args.map((a) => a.value ?? a.description ?? "").join(" "));
        if (msg.method === "Runtime.exceptionThrown") events.exceptions.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text);
        if (msg.method === "Network.requestWillBeSent") events.requests.push(p.request.url);
        if (msg.method === "Network.loadingFailed" && !/ERR_ABORTED/.test(p.errorText)) events.failed.push(p.errorText);
      });
      await s("Page.enable");
      await s("Runtime.enable");
      await s("Network.enable");
      await s("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
      const page = {
        events,
        send: s,
        async goto(url) {
          const loaded = new Promise((ok) => {
            const off = browser.on((m) => m.sessionId === sessionId && m.method === "Page.loadEventFired" && (off(), ok()));
          });
          await s("Page.navigate", { url });
          await loaded;
        },
        async eval(expr) {
          const r = await s("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
          if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
          return r.result.value;
        },
        async shot({ format = "png", quality } = {}) {
          const r = await s("Page.captureScreenshot", { format, ...(quality ? { quality } : {}), optimizeForSpeed: true, captureBeyondViewport: false, fromSurface: true });
          return Buffer.from(r.data, "base64");
        },
        close: () => send("Target.closeTarget", { targetId }),
      };
      return page;
    },
    async close() {
      try {
        await Promise.race([send("Browser.close"), new Promise((r) => setTimeout(r, 1500))]);
      } catch {}
      proc.kill("SIGKILL");
      await exited;
      try { rmSync(userDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
    },
  };
  return browser;
}

// ---------- the composition contract ----------
// Reads size/fps/duration from #root[data-composition-id] and installs
// window.__motionSeek(t), which seeks the registered GSAP timeline(s).
export const PREPARE = `(async () => {
  await document.fonts.ready;
  const root = document.querySelector('[data-composition-id]');
  if (!root) throw new Error('no [data-composition-id] root');
  const tls = window.__timelines || {};
  const names = Object.keys(tls);
  if (!names.length) throw new Error('no timeline registered on window.__timelines');
  // Clip windows: an element with class "clip" and data-start/data-duration is
  // on screen only inside [start, start + duration), as in HyperFrames.
  const st = document.createElement('style');
  st.textContent = '.__motion-off{visibility:hidden!important}';
  document.head.appendChild(st);
  const clips = [...document.querySelectorAll('.clip[data-start]')].filter((e) => !/^(AUDIO|VIDEO)$/.test(e.tagName) && e !== root)
    .map((e) => ({ e, a: +e.dataset.start || 0, b: e.dataset.duration ? (+e.dataset.start || 0) + +e.dataset.duration : Infinity }));
  window.__motionSeek = (t) => {
    for (const c of clips) c.e.classList.toggle('__motion-off', !(t >= c.a - 1e-6 && t < c.b - 1e-6));
    // +0.1 ms: a zero-duration set placed exactly on this frame counts as done
    // whichever direction the playhead came from (GSAP skips it when landing on 0).
    for (const n of names) tls[n].seek(Math.min(t + 1e-4, tls[n].duration()), true);
    return true;
  };
  // Warm every font face and every image before frame 0 is drawn.
  await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  window.__motionSeek(0);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const d = root.dataset;
  const tlDur = Math.max(...names.map((n) => tls[n].duration()));
  return { width: +d.width || root.offsetWidth, height: +d.height || root.offsetHeight, fps: +d.fps || 30,
           duration: +d.duration || tlDur, timelineDuration: tlDur,
           fontsFailed: [...document.fonts].filter((f) => f.status === 'error').map((f) => f.family) };
})()`;

export async function readSize(projectDir) {
  const html = readFileSync(join(projectDir, "index.html"), "utf8");
  const m = (k) => Number((html.match(new RegExp(`data-${k}="([\\d.]+)"`)) || [])[1]);
  return { width: m("width") || 1920, height: m("height") || 1080, fps: m("fps") || 30, duration: m("duration") };
}

export async function openComposition(browser, projectDir, url) {
  const size = await readSize(projectDir);
  const page = await browser.newPage(size);
  await page.goto(url);
  const info = await page.eval(PREPARE);
  return { page, info };
}

// Two animation frames after the seek: the second one only fires after the
// compositor has painted the new state, so the screenshot never shows a stale layer.
export const seek = (page, t) => page.eval(`window.__motionSeek(${t}); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))`);

export const tc = (t, fps = 30) => {
  const f = Math.round(t * fps);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(f / fps / 60))}:${p(Math.floor(f / fps) % 60)}:${p(f % fps)}`;
};
