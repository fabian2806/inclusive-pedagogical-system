import type { EntradaExpedienteResponse, TipoEntrada, TipoRol } from "@/types/api"
import type { BitacoraEntry, Reply } from "@/types/bitacora"
import type { UserRole } from "@/types/auth"

// --- Traducción entre IDs visuales del frontend y el enum TipoEntrada del backend ---
export const FRONT_TO_BACK: Record<string, TipoEntrada> = {
  observacion_pe: "OBSERVACION_PEDAGOGICA",
  comunicacion_familiar: "COMUNICACION_FAMILIAR",
  incidencia: "INCIDENCIA_COMUNICACION",
  apoyo_ajuste: "APOYO_O_AJUSTE",
  evaluacion_indicador: "EVALUACION_INDICADOR",
  evento_agenda: "EVENTO_AGENDA",
  documento: "DOCUMENTO_ADJUNTADO",
  feedback_saanee: "FEEDBACK_SAANEE",
}

export const BACK_TO_FRONT: Record<TipoEntrada, string> = {
  OBSERVACION_PEDAGOGICA: "observacion_pe",
  COMUNICACION_FAMILIAR: "comunicacion_familiar",
  INCIDENCIA_COMUNICACION: "incidencia",
  APOYO_O_AJUSTE: "apoyo_ajuste",
  EVALUACION_INDICADOR: "evaluacion_indicador",
  EVENTO_AGENDA: "evento_agenda",
  DOCUMENTO_ADJUNTADO: "documento",
  FEEDBACK_SAANEE: "feedback_saanee",
}

// Matriz rol → tipos creables (espejo de la del backend en BitacoraService).
export const TIPOS_POR_ROL: Record<UserRole, string[]> = {
  docente: ["observacion_pe", "incidencia", "apoyo_ajuste"],
  padre: ["comunicacion_familiar"],
  saanee: ["feedback_saanee"],
  admin: [],
}

// Etiqueta visible del rol del autor de una entrada.
export const LABEL_ROL: Record<TipoRol, string> = {
  ADMIN: "Admin",
  DOCENTE: "Docente",
  PADRE: "Familia",
  SAANEE: "SAANEE",
}

export function formatearFecha(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
  }
}

// Fallback cuando una entrada no tiene título: primera línea de la descripción truncada.
export function tituloFallback(descripcion: string): string {
  const primeraLinea = descripcion.split("\n")[0]
  return primeraLinea.length > 80 ? primeraLinea.slice(0, 77) + "…" : primeraLinea
}

export function toReply(e: EntradaExpedienteResponse): Reply {
  const { date, time } = formatearFecha(e.fecha)
  return {
    author: `${e.autor.nombre} ${e.autor.apellido}`,
    role: LABEL_ROL[e.autor.rol] ?? "Usuario",
    date,
    time,
    content: e.descripcion,
    attachments: [],
  }
}

export function toUiEntry(
  e: EntradaExpedienteResponse,
  replies: EntradaExpedienteResponse[] = [],
): BitacoraEntry {
  const { date, time } = formatearFecha(e.fecha)
  return {
    id: String(e.id),
    date,
    time,
    author: `${e.autor.nombre} ${e.autor.apellido}`,
    role: LABEL_ROL[e.autor.rol] ?? "Usuario",
    type: BACK_TO_FRONT[e.tipo],
    title: e.titulo ?? tituloFallback(e.descripcion),
    content: e.descripcion,
    attachments: [],
    replies: replies
      .slice()
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map(toReply),
    importancia: e.nivelImportancia ?? undefined,
    severidad: e.severidad ?? undefined,
    resultado: e.resultado ?? undefined,
  }
}

// Convierte la lista plana del backend (raíces + respuestas) en hilos para la UI.
export function agruparHilos(items: EntradaExpedienteResponse[]): BitacoraEntry[] {
  const respuestasPorRaiz = new Map<number, EntradaExpedienteResponse[]>()
  const raices: EntradaExpedienteResponse[] = []
  for (const item of items) {
    if (item.entradaRaizId == null) {
      raices.push(item)
    } else {
      const lista = respuestasPorRaiz.get(item.entradaRaizId) ?? []
      lista.push(item)
      respuestasPorRaiz.set(item.entradaRaizId, lista)
    }
  }
  return raices.map((r) => toUiEntry(r, respuestasPorRaiz.get(r.id) ?? []))
}
