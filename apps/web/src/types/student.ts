export interface Student {
  id: string
  name: string
  grade: string
  section: string
  hearingLevel: string
  docente: string
  docenteId: string
  padre: string
  padreId: string
  status: "active" | "inactive"
  createdAt: string
}