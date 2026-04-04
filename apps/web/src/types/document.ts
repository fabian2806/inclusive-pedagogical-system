export interface TipoDocumento {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  esObligatorio: boolean
  esVersionable: boolean
  esPeriodico: boolean
  periodicidad: string | null
  esPredefinido: boolean
  activo: boolean
  creadoPor: string
  fechaCreacion: string
}

export interface TipoDocumentoFormData {
  nombre: string
  codigo: string
  descripcion: string
  esObligatorio: boolean
  esVersionable: boolean
  esPeriodico: boolean
  periodicidad: string
}
