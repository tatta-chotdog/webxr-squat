import { defineConfig } from "vite";
import restart from "vite-plugin-restart";
import glsl from "vite-plugin-glsl";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  server: {
    host: true,
    https: true,
    port: 8081,
  },
  build: {
    outDir: "dist",
  },
  plugins: [
    restart({ restart: ["../public/**"] }),
    glsl(),
    basicSsl({
      name: "webxr-squat",
    }),
  ],
});
