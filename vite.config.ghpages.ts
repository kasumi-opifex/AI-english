/*
 * GitHub Pages 用 Vite ビルド設定
 * 
 * リポジトリ名が "english-learning-7steps" の場合:
 *   base: "/english-learning-7steps/"
 * 
 * リポジトリ名が違う場合は base を変更してください。
 * ユーザー名.github.io リポジトリの場合は base: "/" にしてください。
 */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// CHANGE THIS to your GitHub repository name
const REPO_NAME = process.env.REPO_NAME || "english-learning-7steps";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: `/${REPO_NAME}/`,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/gh-pages"),
    emptyOutDir: true,
  },
});
