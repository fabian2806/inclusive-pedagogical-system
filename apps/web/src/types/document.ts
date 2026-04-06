export interface TipoDocumento {
  id: number
  nombre: string
  esObligatorio: boolean
  esVersionable: boolean
  esPeriodico: boolean
  periodicidad: string | null
  esPredefinido: boolean
}

export interface TipoDocumentoFormData {
  nombre: string
  esObligatorio: boolean
  esVersionable: boolean
  esPeriodico: boolean
  periodicidad: string
}
