// Configuración visual y estilos de la bitácora.

export interface EntryTypeConfig {
  id: string
  label: string
  short: string
  hasImportancia: boolean
  hasSeveridad: boolean
  hasIndicador: boolean
  hasEvento: boolean
  hasResultado: boolean
  color: { bg: string; border: string; text: string; dot: string }
}

export const ENTRY_TYPES: EntryTypeConfig[] = [
  { id: "observacion_pe",        label: "Obs. Pedagógica",   short: "OBS", hasImportancia: true,  hasSeveridad: true,  hasIndicador: false, hasEvento: false, hasResultado: false, color: { bg: "#EFF6FF", border: "#93C5FD", text: "#2563EB", dot: "#3B82F6" } },
  { id: "comunicacion_familiar", label: "Comunicación Fam.", short: "COM", hasImportancia: true,  hasSeveridad: true,  hasIndicador: false, hasEvento: false, hasResultado: false, color: { bg: "#F0F9FF", border: "#7DD3FC", text: "#0284C7", dot: "#0EA5E9" } },
  { id: "incidencia",            label: "Incidencia",        short: "INC", hasImportancia: false, hasSeveridad: true,  hasIndicador: false, hasEvento: false, hasResultado: true,  color: { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626", dot: "#EF4444" } },
  { id: "apoyo_ajuste",          label: "Apoyo o Ajuste",    short: "APO", hasImportancia: false, hasSeveridad: false, hasIndicador: false, hasEvento: false, hasResultado: false, color: { bg: "#ECFDF5", border: "#6EE7B7", text: "#059669", dot: "#10B981" } },
  { id: "evaluacion_indicador",  label: "Eval. Indicador",   short: "EVA", hasImportancia: false, hasSeveridad: false, hasIndicador: true,  hasEvento: false, hasResultado: true,  color: { bg: "#F5F3FF", border: "#C4B5FD", text: "#7C3AED", dot: "#8B5CF6" } },
  { id: "evento_agenda",         label: "Evento Agenda",     short: "EVT", hasImportancia: false, hasSeveridad: false, hasIndicador: false, hasEvento: true,  hasResultado: false, color: { bg: "#FFFBEB", border: "#FCD34D", text: "#B45309", dot: "#F59E0B" } },
  { id: "documento",             label: "Documento",         short: "DOC", hasImportancia: false, hasSeveridad: false, hasIndicador: false, hasEvento: false, hasResultado: false, color: { bg: "#F9FAFB", border: "#D1D5DB", text: "#374151", dot: "#9CA3AF" } },
  { id: "feedback_saanee",       label: "Feedback SAANEE",   short: "SAA", hasImportancia: true,  hasSeveridad: true,  hasIndicador: false, hasEvento: false, hasResultado: false, color: { bg: "#FDF4FF", border: "#E879F9", text: "#A21CAF", dot: "#D946EF" } },
]

export function getEntryTypeColor(type: string) {
  switch (type) {
    case "observacion_pe":
      return { bg: "bg-[#EEF2FF]", border: "border-[#C7D2FE]", text: "text-[#3B82F6]", label: "Observación PE" }
    case "apoyo_ajuste":
      return { bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]", text: "text-[#059669]", label: "Apoyo o ajuste" }
    case "evaluacion_indicador":
      return { bg: "bg-[#F3E8FF]", border: "border-[#DDD6FE]", text: "text-[#7C3AED]", label: "Evaluación de indicador" }
    case "evento_agenda":
      return { bg: "bg-[#FEF3C7]", border: "border-[#FDE68A]", text: "text-[#D97706]", label: "Evento de agenda" }
    case "documento":
      return { bg: "bg-[#F3F4F6]", border: "border-[#E5E7EB]", text: "text-[#374151]", label: "Documento adjuntado" }
    case "feedback_saanee":
      return { bg: "bg-[#FDF2F8]", border: "border-[#FBCFE8]", text: "text-[#DB2777]", label: "Feedback SAANEE" }
    case "comunicacion_familiar":
      return { bg: "bg-[#E0F2FE]", border: "border-[#BAE6FD]", text: "text-[#0284C7]", label: "Comunicación familiar" }
    case "incidencia":
      return { bg: "bg-[#FEF2F2]", border: "border-[#FECACA]", text: "text-[#DC2626]", label: "Incidencia de comunicación" }
    default:
      return { bg: "bg-[#F3F4F6]", border: "border-[#E5E7EB]", text: "text-[#6B7280]", label: "Otro" }
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case "Docente":
      return "bg-[#3B82F6]"
    case "SAANEE":
      return "bg-[#8B5CF6]"
    case "Familia":
      return "bg-[#10B981]"
    default:
      return "bg-[#6B7280]"
  }
}
