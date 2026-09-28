import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@finalstudio/core"],
  // the render pipeline spawns node/npx and reads the skill from disk
  serverExternalPackages: [],
  outputFileTracingIncludes: { "/api/**": ["../../packages/motion-skill/**"] },
};

export default config;
