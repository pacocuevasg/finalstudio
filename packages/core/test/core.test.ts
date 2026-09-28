import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { compileTimeline, parseSay, sceneScripts, Storyboard, verifyStoryboard } from "../src/index.ts";
import { wavDuration, wordsFromAlignment } from "../src/voice/index.ts";
import { estimateVoice } from "../src/voice/estimate.ts";

const example = Storyboard.parse(JSON.parse(readFileSync(new URL("../../../examples/ecuacion-lineal.v2.json", import.meta.url), "utf8")));

test("parseSay finds anchors and bubble breaks", () => {
  const p = parseSay("{{op}} Resta tres || en {{mk}} ambos lados");
  assert.deepEqual(p.words, ["Resta", "tres", "en", "ambos", "lados"]);
  assert.deepEqual(p.anchors, { op: 0, mk: 3 });
  assert.deepEqual(p.breaks, [0, 2]);
});

test("verify accepts the example and rejects a wrong line", () => {
  assert.deepEqual(verifyStoryboard(example), { ok: true });
  const bad = structuredClone(example);
  bad.scenes[2].board[1].text = "2x = 9";
  const r = verifyStoryboard(bad);
  assert.equal(r.ok, false);
});

test("timeline: anchors land 2 frames before their word, scenes never overlap", async () => {
  const clips = await Promise.all(sceneScripts(example).map((t) => estimateVoice.synthesize(t, { language: "es-MX" })));
  const { builder, chapters } = compileTimeline(example, clips, () => null);
  const s = 2; // scene "03 — paso 1"
  const words = clips[s].words;
  const mkWord = parseSay(example.scenes[s].say).anchors.mk;
  const line = builder.board.find((b) => b.text.startsWith("2x + 3 ["))!;
  assert.ok(Math.abs(line.markAt! - (chapters[s].start + 0.35 + words[mkWord].start - 2 / 30)) < 1e-3);
  for (let i = 1; i < chapters.length; i++) assert.ok(chapters[i].start >= chapters[i - 1].end - 1e-9);
  assert.equal(builder.outro.at, chapters.at(-1)!.start);
  assert.ok(builder.duration > chapters.at(-1)!.end);
  // every board event happens inside its own scene
  for (const b of builder.board) assert.ok(b.at < builder.outro.at);
});

test("ElevenLabs character alignment becomes words", () => {
  const chars = [..."hola mundo"];
  const w = wordsFromAlignment({
    characters: chars,
    character_start_times_seconds: chars.map((_, i) => i * 0.1),
    character_end_times_seconds: chars.map((_, i) => i * 0.1 + 0.1),
  });
  assert.deepEqual(w.map((x) => x.word), ["hola", "mundo"]);
  assert.equal(w[1].start, 0.5);
});

test("wavDuration reads the data chunk", () => {
  const sr = 24000, secs = 1.5, data = sr * 2 * secs;
  const b = Buffer.alloc(44 + data);
  b.write("RIFF", 0); b.writeUInt32LE(36 + data, 4); b.write("WAVE", 8);
  b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(data, 40);
  assert.equal(wavDuration(b), 1.5);
});
