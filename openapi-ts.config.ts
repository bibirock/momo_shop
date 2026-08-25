import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi/openapi.json",
  output: "./lib/api-client",
  plugins: ["@hey-api/client-next"],
});
