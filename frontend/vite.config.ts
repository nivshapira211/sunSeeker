/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sslDir = path.join(__dirname, '..', 'ssl')
const keyPath = path.join(sslDir, 'server.key')
const certPath = path.join(sslDir, 'server.crt')

let httpsOptions: any = undefined
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    ...(httpsOptions ? { https: httpsOptions } : {}),
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
