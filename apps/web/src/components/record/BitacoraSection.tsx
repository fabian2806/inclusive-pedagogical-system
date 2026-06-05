import { AlertCircle, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EntryTypeConfig } from "@/lib/bitacora-ui"
import type { IndicadorResponse } from "@/types/api"
import type { BitacoraEntry } from "@/types/bitacora"
import { BitacoraEntryForm, type EntryFormState } from "./BitacoraEntryForm"
import { BitacoraEntryCard } from "./BitacoraEntryCard"
import { BitacoraEmptyState } from "./BitacoraEmptyState"

const FILTROS = [
  { id: "all", label: "Todas" },
  { id: "observacion_pe", label: "Observaciones" },
  { id: "evaluacion_indicador", label: "Evaluaciones" },
  { id: "feedback_saanee", label: "SAANEE" },
  { id: "comunicacion_familiar", label: "Familia" },
]

interface Props {
  alumnoId: number
  alumnoNombre: string
  entries: BitacoraEntry[]
  filteredEntries: BitacoraEntry[]
  isLoading: boolean
  error: string | null
  submitting: boolean
  // filter
  activeFilter: string
  setActiveFilter: (id: string) => void
  // form
  tiposVisibles: EntryTypeConfig[]
  entryForm: EntryFormState
  setEntryForm: React.Dispatch<React.SetStateAction<EntryFormState>>
  selectedType: EntryTypeConfig | undefined
  indicadoresActivos: IndicadorResponse[]
  onPublish: () => void
  // reply
  replyingTo: string | null
  startReply: (id: string) => void
  cancelReply: () => void
  replyText: string
  setReplyText: (s: string) => void
  onReply: (id: string) => void
  // export
  canExport: boolean
  exporting: boolean
  onExport: () => void
}

export function BitacoraSection({
  alumnoId,
  alumnoNombre,
  entries,
  filteredEntries,
  isLoading,
  error,
  submitting,
  activeFilter,
  setActiveFilter,
  tiposVisibles,
  entryForm,
  setEntryForm,
  selectedType,
  indicadoresActivos,
  onPublish,
  replyingTo,
  startReply,
  cancelReply,
  replyText,
  setReplyText,
  onReply,
  canExport,
  exporting,
  onExport,
}: Props) {
  return (
    <Card className="border-[#E5E7EB]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg text-[#1E3A5F] flex items-center gap-2">
            <FileText size={20} className="text-[#3B82F6]" />
            Bitácora del expediente
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`text-xs px-3 h-6 rounded-md transition-colors ${
                    activeFilter === f.id
                      ? "bg-white text-[#1E3A5F] font-medium shadow-sm"
                      : "text-[#6B7280] hover:text-[#374151]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {canExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={exporting || entries.length === 0}
                className="border-[#E5E7EB] text-[#374151] gap-1.5 h-8"
                title={
                  entries.length === 0
                    ? "No hay entradas para exportar"
                    : "Descargar la bitácora visible como CSV"
                }
              >
                <Download size={14} />
                {exporting ? "Exportando…" : "Exportar CSV"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C] flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && entries.length === 0 && (
          <div className="mb-6 py-12 flex flex-col items-center text-center text-sm text-[#6B7280]">
            <div className="w-10 h-10 rounded-full border-2 border-[#E5E7EB] border-t-[#3B82F6] animate-spin mb-3" />
            Cargando bitácora…
          </div>
        )}

        <BitacoraEntryForm
          tiposVisibles={tiposVisibles}
          entryForm={entryForm}
          setEntryForm={setEntryForm}
          selectedType={selectedType}
          indicadoresActivos={indicadoresActivos}
          submitting={submitting}
          onPublish={onPublish}
        />

        {/* Entries Timeline */}
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => (
            <BitacoraEntryCard
              key={entry.id}
              entry={entry}
              alumnoId={alumnoId}
              isLast={index === filteredEntries.length - 1}
              isReplying={replyingTo === entry.id}
              replyText={replyText}
              setReplyText={setReplyText}
              startReply={startReply}
              cancelReply={cancelReply}
              onReply={onReply}
              submitting={submitting}
            />
          ))}

          {filteredEntries.length === 0 && (
            <BitacoraEmptyState
              totalEntries={entries.length}
              alumnoNombre={alumnoNombre}
              tiposVisibles={tiposVisibles}
              onTipoClick={(tipoId) => setEntryForm((f) => ({ ...f, tipo: tipoId }))}
              onResetFilter={() => setActiveFilter("all")}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
