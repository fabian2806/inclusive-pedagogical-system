import { useMemo, useRef, useState, type DragEvent } from "react"
import { AlertCircle, CheckCircle, FileCheck, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TipoDocumentoResponse } from "@/types/api"

type UploadFormState = {
  tipoDocumentoId: number | null
  titulo: string
  periodo: string
  fechaEmision: string  // yyyy-mm-dd
  file: File | null
  dragging: boolean
}

export type UploadDocumentPayload = {
  tipoDocumentoId: number
  titulo: string
  periodo: string | null
  fechaEmision: string
  file: File
}

type UploadDocumentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tiposDocumento: TipoDocumentoResponse[]
  studentName: string
  onSubmit: (payload: UploadDocumentPayload) => Promise<void>
  uploading?: boolean
  uploadError?: string | null
}

const initialUploadForm: UploadFormState = {
  tipoDocumentoId: null,
  titulo: "",
  periodo: "",
  fechaEmision: "",
  file: null,
  dragging: false,
}

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const ACCEPT_EXTENSIONS = ".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
const ACCEPT_HINT = "PDF, DOCX, XLSX, PNG, JPG — máx. 10 MB"

/**
 * Periodos hardcoded por periodicidad. Si la periodicidad del tipo no está
 * en el mapa (ANUAL, SEMANAL, QUINCENAL o cualquier custom), el campo cae
 * a input libre como fallback.
 */
const PERIODOS_POR_PERIODICIDAD: Record<string, string[]> = {
  BIMESTRAL: ["I Bimestre", "II Bimestre", "III Bimestre", "IV Bimestre"],
  TRIMESTRAL: ["I Trimestre", "II Trimestre", "III Trimestre"],
  SEMESTRAL: ["I Semestre", "II Semestre"],
  MENSUAL: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ],
}

function obtenerOpcionesPeriodo(periodicidad: string | null | undefined): string[] | null {
  if (!periodicidad) return null
  return PERIODOS_POR_PERIODICIDAD[periodicidad.trim().toUpperCase()] ?? null
}

export function UploadDocumentModal({
  open,
  onOpenChange,
  tiposDocumento,
  studentName,
  onSubmit,
  uploading = false,
  uploadError = null,
}: UploadDocumentModalProps) {
  const [uploadForm, setUploadForm] = useState<UploadFormState>(initialUploadForm)
  const [validationError, setValidationError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedTipoDoc = useMemo(
    () => tiposDocumento.find(tipo => tipo.id === uploadForm.tipoDocumentoId),
    [tiposDocumento, uploadForm.tipoDocumentoId],
  )

  const opcionesPeriodo = obtenerOpcionesPeriodo(selectedTipoDoc?.periodicidad)
  const requierePeriodo = selectedTipoDoc?.esPeriodico === true

  const isSubmitDisabled =
    !uploadForm.tipoDocumentoId ||
    !uploadForm.titulo.trim() ||
    !uploadForm.fechaEmision ||
    !uploadForm.file ||
    (requierePeriodo && !uploadForm.periodo.trim())

  const handleFileSelected = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`El archivo no debe superar los ${MAX_FILE_SIZE_MB} MB.`)
      return
    }
    setValidationError(null)
    setUploadForm(form => ({ ...form, file, dragging: false }))
  }

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file) {
      setUploadForm(form => ({ ...form, dragging: false }))
      return
    }
    handleFileSelected(file)
  }

  const handleClose = () => {
    if (uploading) return
    onOpenChange(false)
  }

  const handleUploadSubmit = async () => {
    if (
      isSubmitDisabled ||
      !uploadForm.tipoDocumentoId ||
      !uploadForm.file
    ) return

    try {
      await onSubmit({
        tipoDocumentoId: uploadForm.tipoDocumentoId,
        titulo: uploadForm.titulo.trim(),
        periodo: requierePeriodo ? uploadForm.periodo.trim() : null,
        fechaEmision: uploadForm.fechaEmision,
        file: uploadForm.file,
      })
      // Solo si el submit no lanzó: reset y cierre.
      setUploadForm(initialUploadForm)
      setValidationError(null)
      onOpenChange(false)
    } catch {
      // El padre setea uploadError; el modal queda abierto con la data del usuario.
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#1E3A5F]">
            <Upload size={16} className="text-[#3B82F6]" />
            Subir documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Tipo de documento */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
              Tipo de documento <span className="text-[#DC2626]">*</span>
            </label>

            <div className="grid grid-cols-1 gap-1.5">
              {tiposDocumento.map(tipo => {
                const isSelected = uploadForm.tipoDocumentoId === tipo.id

                return (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() =>
                      setUploadForm(form => ({
                        ...form,
                        tipoDocumentoId: tipo.id,
                        // Reset del periodo al cambiar de tipo (evita arrastrar
                        // un valor que ya no aplica).
                        periodo: "",
                      }))
                    }
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? "border-[#3B82F6] bg-[#EFF6FF] ring-1 ring-[#93C5FD]"
                        : "border-[#E5E7EB] bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFF]"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? "text-[#1E3A5F]" : "text-[#374151]"
                        }`}
                      >
                        {tipo.nombre}
                      </p>

                      <div className="mt-0.5 flex items-center gap-2">
                        {tipo.esObligatorio && (
                          <span className="text-[10px] font-medium text-[#DC2626]">
                            Obligatorio
                          </span>
                        )}
                        {tipo.esVersionable && (
                          <span className="text-[10px] text-[#6B7280]">
                            · Versionable
                          </span>
                        )}
                        {tipo.esPeriodico && tipo.periodicidad && (
                          <span className="text-[10px] text-[#6B7280]">
                            · {tipo.periodicidad}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle size={16} className="shrink-0 text-[#3B82F6]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {uploadForm.tipoDocumentoId !== null && (
            <>
              {/* Titulo (obligatorio) */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                  Título del documento <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  placeholder={`Ej: ${selectedTipoDoc?.nombre ?? "Documento"} — ${studentName}`}
                  value={uploadForm.titulo}
                  onChange={event =>
                    setUploadForm(form => ({ ...form, titulo: event.target.value }))
                  }
                  className="h-9 border-[#E5E7EB] text-sm"
                />
              </div>

              {/* Fecha de emisión (obligatoria) */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                  Fecha de emisión <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  type="date"
                  value={uploadForm.fechaEmision}
                  onChange={event =>
                    setUploadForm(form => ({ ...form, fechaEmision: event.target.value }))
                  }
                  className="h-9 border-[#E5E7EB] text-sm"
                />
              </div>

              {/* Periodo (condicional) */}
              {requierePeriodo && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                    Periodo <span className="text-[#DC2626]">*</span>
                  </label>

                  {opcionesPeriodo ? (
                    <Select
                      value={uploadForm.periodo}
                      onValueChange={(value) =>
                        setUploadForm(form => ({ ...form, periodo: value }))
                      }
                    >
                      <SelectTrigger className="h-9 border-[#E5E7EB] text-sm">
                        <SelectValue placeholder="Seleccionar periodo" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcionesPeriodo.map(opcion => (
                          <SelectItem key={opcion} value={opcion}>
                            {opcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder={`Ej: ${selectedTipoDoc?.periodicidad ?? "Periodo"}`}
                      value={uploadForm.periodo}
                      onChange={event =>
                        setUploadForm(form => ({ ...form, periodo: event.target.value }))
                      }
                      className="h-9 border-[#E5E7EB] text-sm"
                    />
                  )}

                  <p className="mt-1 text-[11px] text-[#9CA3AF]">
                    Periodicidad: {selectedTipoDoc?.periodicidad ?? "—"}
                  </p>
                </div>
              )}

              {/* Archivo */}
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                  Archivo <span className="text-[#DC2626]">*</span>
                </label>

                <div
                  onDragOver={event => {
                    event.preventDefault()
                    setUploadForm(form => ({ ...form, dragging: true }))
                  }}
                  onDragLeave={() =>
                    setUploadForm(form => ({ ...form, dragging: false }))
                  }
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 transition-colors ${
                    uploadForm.dragging
                      ? "border-[#3B82F6] bg-[#EFF6FF]"
                      : uploadForm.file
                        ? "border-[#6EE7B7] bg-[#ECFDF5]"
                        : "border-[#E5E7EB] bg-[#F9FAFB] hover:border-[#93C5FD] hover:bg-[#F0F9FF]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_EXTENSIONS}
                    className="hidden"
                    onChange={event => {
                      const file = event.target.files?.[0]
                      if (file) handleFileSelected(file)
                    }}
                  />

                  {uploadForm.file ? (
                    <>
                      <FileCheck size={22} className="text-[#059669]" />
                      <p className="text-sm font-medium text-[#059669]">
                        {uploadForm.file.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {(uploadForm.file.size / 1024).toFixed(0)} KB · Haz clic para cambiar
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={22} className="text-[#9CA3AF]" />
                      <p className="text-sm text-[#374151]">
                        Arrastra el archivo aquí o{" "}
                        <span className="font-medium text-[#3B82F6]">
                          busca en tu equipo
                        </span>
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{ACCEPT_HINT}</p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {(validationError || uploadError) && (
            <div className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{validationError ?? uploadError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={uploading}
              className="border-[#E5E7EB] text-xs text-[#374151]"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleUploadSubmit}
              disabled={isSubmitDisabled || uploading}
              className="gap-1.5 bg-[#1E3A5F] text-xs text-white hover:bg-[#2D4A6F]"
            >
              <Upload size={13} />
              {uploading ? "Subiendo…" : "Subir documento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
