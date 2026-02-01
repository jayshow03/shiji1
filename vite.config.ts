import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 改回相对路径 './'，这样无论部署在 Cloudflare Pages 还是 GitHub Pages 子目录都能正常加载资源
  base: './', 
  build: {
    outDir: 'dist',
  }
})