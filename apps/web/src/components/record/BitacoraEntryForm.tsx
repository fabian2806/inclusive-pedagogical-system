import { useRef, useState, type ChangeEvent } from "react"
import { CheckCircle2, MessageSquare, Paperclip, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { EntryTypeConfig } from "@/lib/bitacora-ui"
import type { IndicadorResponse } from "@/types/api"
import { ACCEPT_EXTENSIONS, formatTamano, validarArchivo } from "@/lib/archivos"

const MOCK_EVENTOS = [
  { id: "ev-1", label: "Evaluación trimestral · 28 Mar 2025" },
  { id: "ev-2", label: "Sesión SAANEE · 1 Abr 2025" },
]

const AREA_LABEL: Record<string, string> = {
  COMUNICACION: "Comunicación",
  MATEMATICA: "Matemática",
  ED_FISICA: "Ed. Física",
  PERSONAL_SOCIAL: "Personal Social",
  OTRO: "Otro",
}

export interface EntryFormState {
  tipo: string
  titulo: string
  contenido: string
  importancia: string
  severidad: string
  indicadorId: string
  eventoId: string
  resultado: string
  resultadoLogrado: "" | "true" | "false"
  archivos: File[]
}

interface Props {
  tiposVisibles: EntryTypeConfig[]
  entryForm: EntryFormState
  setEntryForm: React.Dispatch<React.SetStateAction<EntryFormState>>
  selectedType: EntryTypeConfig | undefined
  indicadoresActivos: IndicadorResponse[]
  submitting: boolean
  onPublish: () => void
}

function placeholderForTipo(tipo: string): string {
  switch (tipo) {
    case "observacion_pe": return "Describe la observación pedagógica..."
    case "comunicacion_familiar": return "Describe la comunicación con la familia..."
    case "incidencia": return "Describe la incidencia ocurrida..."
    case "apoyo_ajuste": return "Describe el apoyo o ajuste implementado..."
    case "evaluacion_indicador": return "Describe los resultados de la evaluación..."
    case "evento_agenda": return "Describe el evento o actividad..."
    case "documento": return "Describe el documento adjuntado..."
    case "feedback_saanee": return "Escribe la retroalimentación del equipo SAANEE..."
    default: return "Selecciona un tipo de entrada para comenzar..."
  }
}

function publishDisabled(form: EntryFormState, tipo: EntryTypeConfig | undefined): boolean {
  if (!form.tipo || !form.contenido.trim()) return true
  if (tipo?.hasIndicador && !form.indicadorId) return true
  return false
}

export function BitacoraEntryForm({
  tiposVisibles,
  entryForm,
  setEntryForm,
  selectedType,
  indicadoresActivos,
  submitting,
  onPublish,
}: Props) {
  const sinIndicadoresActivos = !!selectedType?.hasIndicador && indicadoresActivos.length === 0

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const nuevos: File[] = []
    const errores: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validarArchivo(file)
      if (error) errores.push(error)
      else nuevos.push(file)
    }

    if (nuevos.length > 0) {
      setEntryForm(form => ({ ...form, archivos: [...form.archivos, ...nuevos] }))
    }
    setFileError(errores.length > 0 ? errores.join(" · ") : null)

    // Reset del input para permitir re-seleccionar el mismo archivo.
    event.target.value = ""
  }

  const removeArchivo = (index: number) => {
    setEntryForm(form => ({
      ...form,
      archivos: form.archivos.filter((_, i) => i !== index),
    }))
    setFileError(null)
  }

  return (
    <div
      className="mb-6 rounded-lg overflow-hidden transition-all duration-300 flex"
      style={{
        border: `1px solid ${selectedType ? selectedType.color.border : "#E5E7EB"}`,
        backgroundColor: selectedType ? selectedType.color.bg : "#F9FAFB",
      }}
    >
      <div
        className="w-1 shrink-0 rounded-l-lg transition-all duration-300"
        style={{ backgroundColor: selectedType ? selectedType.color.border : "#E5E7EB" }}
      />

      <div className="flex-1 min-w-0">
        {/* Type selector */}
        <div className="px-4 pt-4 pb-3 border-b border-[#E5E7EB]/60">
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">
            Tipo de entrada
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tiposVisibles.length === 0 && (
              <p className="text-xs text-[#9CA3AF] italic">
                Tu rol no permite crear entradas en la bitácora.
              </p>
            )}
            {tiposVisibles.map((t) => {
              const isSelected = entryForm.tipo === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setEntryForm((f) => {
                    const deseleccionar = f.tipo === t.id
                    return {
                      ...f,
                      tipo: deseleccionar ? "" : t.id,
                      // Limpiar campos condicionales que no aplican al nuevo tipo
                      importancia: !deseleccionar && t.hasImportancia ? f.importancia : "",
                      severidad: !deseleccionar && t.hasSeveridad ? f.severidad : "",
                      indicadorId: !deseleccionar && t.hasIndicador ? f.indicadorId : "",
                      eventoId: !deseleccionar && t.hasEvento ? f.eventoId : "",
                      resultado: !deseleccionar && t.hasResultado ? f.resultado : "",
                      resultadoLogrado: !deseleccionar && t.hasResultadoLogrado ? f.resultadoLogrado : "",
                    }
                  })}
                  className="text-xs px-3 py-1 rounded-full border transition-all duration-150 flex items-center gap-1.5"
                  style={
                    isSelected
                      ? {
                          backgroundColor: t.color.bg,
                          borderColor: t.color.border,
                          color: t.color.text,
                          fontWeight: 600,
                          boxShadow: `0 0 0 2px ${t.color.border}`,
                        }
                      : {
                          backgroundColor: "white",
                          borderColor: "#E5E7EB",
                          color: "#6B7280",
                        }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.color.dot }}
                  />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Textarea */}
        <div className="px-4 pt-3">
          {entryForm.tipo && (
            <Input
              placeholder="Título (opcional)"
              value={entryForm.titulo}
              onChange={(e) => setEntryForm((f) => ({ ...f, titulo: e.target.value }))}
              className="mb-2 bg-white text-sm h-8 transition-colors duration-200"
              style={{ borderColor: selectedType ? selectedType.color.border : "#E5E7EB" }}
            />
          )}
          <Textarea
            placeholder={placeholderForTipo(entryForm.tipo)}
            value={entryForm.contenido}
            onChange={(e) => setEntryForm((f) => ({ ...f, contenido: e.target.value }))}
            className="min-h-[90px] resize-none text-sm bg-white transition-colors duration-200"
            style={{ borderColor: selectedType ? selectedType.color.border : "#E5E7EB" }}
            disabled={!entryForm.tipo}
          />
        </div>

        {/* Conditional fields */}
        {selectedType && (selectedType.hasImportancia || selectedType.hasSeveridad || selectedType.hasIndicador || selectedType.hasEvento || selectedType.hasResultado || selectedType.hasResultadoLogrado) && (
          <div className="px-4 pt-2 pb-3 flex flex-wrap gap-2">
            {selectedType.hasImportancia && (
              <Select value={entryForm.importancia} onValueChange={(v) => setEntryForm((f) => ({ ...f, importancia: v }))}>
                <SelectTrigger className="h-8 text-xs w-40 bg-white border-[#E5E7EB]">
                  <SelectValue placeholder="Importancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bajo">Baja</SelectItem>
                  <SelectItem value="medio">Media</SelectItem>
                  <SelectItem value="alto">Alta</SelectItem>
                </SelectContent>
              </Select>
            )}
            {selectedType.hasSeveridad && (
              <Select value={entryForm.severidad} onValueChange={(v) => setEntryForm((f) => ({ ...f, severidad: v }))}>
                <SelectTrigger className="h-8 text-xs w-40 bg-white border-[#E5E7EB]">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            )}
            {selectedType.hasIndicador && (
              <Select value={entryForm.indicadorId} onValueChange={(v) => setEntryForm((f) => ({ ...f, indicadorId: v }))}>
                <SelectTrigger className="h-8 text-xs w-72 bg-white border-[#E5E7EB]">
                  <SelectValue placeholder={sinIndicadoresActivos ? "Sin indicadores activos" : "Seleccionar indicador *"} />
                </SelectTrigger>
                <SelectContent>
                  {indicadoresActivos.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.nombre}
                      <span className="text-[#9CA3AF] ml-1">· {AREA_LABEL[i.areaCurricular] ?? i.areaCurricular}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedType.hasEvento && (
              <Select value={entryForm.eventoId} onValueChange={(v) => setEntryForm((f) => ({ ...f, eventoId: v }))}>
                <SelectTrigger className="h-8 text-xs w-60 bg-white border-[#E5E7EB]">
                  <SelectValue placeholder="Vincular a evento" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_EVENTOS.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedType.hasResultadoLogrado && (
              <div className="flex items-center gap-1.5 h-8 px-2 rounded-md border border-[#E5E7EB] bg-white">
                <span className="text-[10px] text-[#6B7280] uppercase tracking-wider mr-1">Resultado:</span>
                <button
                  type="button"
                  onClick={() => setEntryForm((f) => ({
                    ...f,
                    resultadoLogrado: f.resultadoLogrado === "true" ? "" : "true",
                  }))}
                  className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                    entryForm.resultadoLogrado === "true"
                      ? "bg-[#D1FAE5] text-[#059669] border border-[#10B981]"
                      : "text-[#6B7280] border border-transparent hover:bg-[#F3F4F6]"
                  }`}
                >
                  <CheckCircle2 size={12} /> Logrado
                </button>
                <button
                  type="button"
                  onClick={() => setEntryForm((f) => ({
                    ...f,
                    resultadoLogrado: f.resultadoLogrado === "false" ? "" : "false",
                  }))}
                  className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                    entryForm.resultadoLogrado === "false"
                      ? "bg-[#FEE2E2] text-[#DC2626] border border-[#EF4444]"
                      : "text-[#6B7280] border border-transparent hover:bg-[#F3F4F6]"
                  }`}
                >
                  <XCircle size={12} /> No logrado
                </button>
              </div>
            )}
            {selectedType.hasResultado && (
              <Input
                placeholder={selectedType.hasResultadoLogrado ? "Comentario del resultado (opcional)" : "Resultado (ej: Logrado 85%)"}
                value={entryForm.resultado}
                onChange={(e) => setEntryForm((f) => ({ ...f, resultado: e.target.value }))}
                className="h-8 text-xs w-64 bg-white border-[#E5E7EB]"
              />
            )}
          </div>
        )}

        {sinIndicadoresActivos && (
          <div className="px-4 pb-2 -mt-1">
            <p className="text-[11px] text-[#B45309] italic">
              No hay indicadores activos en el catálogo. Crea uno desde "Indicadores" antes de evaluar.
            </p>
          </div>
        )}

        {/* Archivos adjuntos seleccionados (staging antes de publicar) */}
        {(entryForm.archivos.length > 0 || fileError) && (
          <div className="px-4 pb-2 space-y-1.5">
            {entryForm.archivos.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md bg-[#F3F4F6] px-3 py-1.5 text-xs text-[#374151]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip size={12} className="text-[#6B7280] shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-[#9CA3AF] shrink-0">
                    ({formatTamano(file.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeArchivo(idx)}
                  className="text-[#9CA3AF] hover:text-[#DC2626] shrink-0"
                  aria-label={`Quitar ${file.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {fileError && (
              <p className="text-[11px] text-[#B91C1C] italic">{fileError}</p>
            )}
          </div>
        )}

        {/* Input oculto para el file picker. */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_EXTENSIONS}
          className="hidden"
          onChange={handleFilesSelected}
        />

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-[#6B7280] gap-1.5 text-xs"
          >
            <Paperclip size={13} />
            Adjuntar archivo
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs text-white transition-all duration-200"
            style={{
              backgroundColor: selectedType ? selectedType.color.dot : "#1E3A5F",
            }}
            disabled={publishDisabled(entryForm, selectedType) || submitting}
            onClick={onPublish}
          >
            <MessageSquare size={13} />
            {submitting ? "Publicando…" : "Publicar entrada"}
          </Button>
        </div>
      </div>
    </div>
  )
}
