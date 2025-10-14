import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import path from "path";

export default defineConfig({
  plugins: [react(), cesium()],
  server: { port: 5173 },
  resolve: {
    alias: {
      // Force all dependencies to use the same THREE
      three: path.resolve(__dirname, "node_modules/three"),
    },
  },
});
