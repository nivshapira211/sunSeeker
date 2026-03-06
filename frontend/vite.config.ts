import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sslDir = path.join(__dirname, '..', 'ssl')
const httpsOptions = {
  key: fs.readFileSync(path.join(sslDir, 'server.key')),
  cert: fs.readFileSync(path.join(sslDir, 'server.crt')),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsOptions,
    port: 5173,
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
