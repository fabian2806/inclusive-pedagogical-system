import '@testing-library/jest-dom/vitest'

// Polyfill para APIs del navegador no disponibles en jsdom
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
