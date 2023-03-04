import { defineConfig } from "astro/config";
import { astroAWSFunctions } from "@astro-aws/adapter";
// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: astroAWSFunctions(),
  vite: { esbuild: { exclude: ["@aws-sdk/*"] } },
});
