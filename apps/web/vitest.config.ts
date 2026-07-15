import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // Los 5s por defecto son para tests unitarios. Aqui se renderizan
    // componentes completos con jsdom y Radix, y al correr la suite en
    // paralelo los mas pesados se pasaban de ese margen de forma
    // intermitente. El fallo era por reloj, no por logica.
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
