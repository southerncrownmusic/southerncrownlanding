import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: "/", // если сайт будет в подпапке, раскомментируй и укажи путь, напр. "/music/"
});
