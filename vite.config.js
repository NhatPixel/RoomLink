import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'onnx-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.endsWith('.onnx')) {
            res.setHeader('Content-Type', 'application/octet-stream')
            res.setHeader('Access-Control-Allow-Origin', '*')
          }
          next()
        })
      }
    }
  ],
  publicDir: 'public',
  assetsInclude: ['**/*.onnx'],
  server: {
    fs: {
      strict: false
    }
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.onnx')) {
            return 'plate-api-models/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
