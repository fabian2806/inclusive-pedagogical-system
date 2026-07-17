import '@testing-library/jest-dom/vitest'

// Polyfill para APIs del navegador no disponibles en jsdom
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Pointer Capture y scrollIntoView: jsdom no las implementa y Radix las usa
// al abrir un Select. Sin esto, cualquier test que despliegue un Select
// revienta con "target.hasPointerCapture is not a function".
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// matchMedia es usado por hooks responsive (use-mobile) y componentes shadcn.
// Mock minimo sin depender de `vi` para mantener setupFiles libre de imports
// desde 'vitest' (vitest 4 marca esto como posible causa de "failed to find
// the runner" si la dependencia se procesa antes de inicializar el runner).
const noop = () => {}
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  }),
})
