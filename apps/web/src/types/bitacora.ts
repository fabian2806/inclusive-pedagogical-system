// Tipos UI de la bitácora.
// Forma local del frontend; el shape del backend vive en `types/api.ts`.

export type Attachment = {
  name: string
  size: string
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
}
