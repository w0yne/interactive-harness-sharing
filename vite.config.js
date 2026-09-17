import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/interactive-harness-sharing/',
  build: { outDir: 'dist', assetsDir: 'assets', target: 'es2020' },
})
