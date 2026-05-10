// Tipos UI de la bitácora.
// Forma local del frontend; el shape del backend vive en `types/api.ts`.

import type { IndicadorBitacoraResponse } from "./api"

// Adjunto persistido en backend (EntradaArchivo + ArchivoAdjunto).
// El id es de EntradaArchivo (envoltura) y se usa para descargar.
export type Attachment = {
  id: number
  name: string
  size: number  // bytes
  mimeType: string
  descripcion?: string | null
}

export type Reply = {
  author: string
  role: string
  date: string
  time: string
  content: string
  attachments: Attachment[]
}

export type BitacoraEntry = {
  id: string
  date: string
  time: string
  author: string
  role: string
  type: string
  title: string
  content: string
  attachments: Attachment[]
  replies?: Reply[]
  importancia?: string
  severidad?: string
  resultado?: string
  indicador?: IndicadorBitacoraResponse
  resultadoLogrado?: boolean | null
}
