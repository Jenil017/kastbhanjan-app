import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Dev-only: proxy /api to the local FastAPI server so the frontend uses the
  // same relative "/api" base URL in development as it does in production
  // (where Vercel serves the API same-origin under /api). Run the backend with:
  //   cd server && uvicorn main:app --reload --port 8000
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
