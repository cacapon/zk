import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "md-raw",
      transform(code, id) {
        if (id.endsWith(".md")) {
          return `export default ${JSON.stringify(code)}`;
        }
      },
    },
  ],
});
