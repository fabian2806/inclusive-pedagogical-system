/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend para el build de producción. Vacío en dev (se usa el proxy /api). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
