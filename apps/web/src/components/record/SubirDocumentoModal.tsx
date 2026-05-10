import { useMemo, useRef, useState, type DragEvent } from "react"
import { CheckCircle, FileCheck, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type TipoDocumento = {
  id: string
  nombre: string
  esObligatorio?: boolean
  esVersionable?: boolean
  esPeriodico?: boolean
  periodicidad?: string
}

type UploadFormState = {
  tipoDocumentoId: string
  titulo: string
  periodo: string
  descripcion: string
  file: File | null
  dragging: boolean
}

type UploadDocumentPayload = {
  tipoDocumentoId: string
  titulo: string
  periodo?: string
  descripcion?: string
  file: File
}

type UploadDocumentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tiposDocumento: TipoDocumento[]
  studentName: string
  onSubmit: (payload: UploadDocumentPayload) => void | Promise<void>
}

const initialUploadForm: UploadFormState = {
  tipoDocumentoId: "",
  titulo: "",
  periodo: "",
  descripcion: "",
  file: null,
  dragging: false,
}

const MAX_FILE_SIZE_MB = 20
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function UploadDocumentModal({
  open,
  onOpenChange,
  tiposDocumento,
  studentName,
  onSubmit,
}: UploadDocumentModalProps) {
  const [uploadForm, setUploadForm] =
    useState<UploadFormState>(initialUploadForm)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedTipoDoc = useMemo(
    () => tiposDocumento.find(tipo => tipo.id === uploadForm.tipoDocumentoId),
    [tiposDocumento, uploadForm.tipoDocumentoId],
  )

  const isSubmitDisabled =
    !uploadForm.tipoDocumentoId ||
    !uploadForm.file ||
    (uploadForm.tipoDocumentoId === "IB" && !uploadForm.periodo.trim())

  const handleFileSelected = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`El archivo no debe superar los ${MAX_FILE_SIZE_MB} MB.`)
      return
    }

    setUploadForm(form => ({
      ...form,
      file,
      dragging: false,
    }))
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
    onOpenChange(false)
  }

  const handleUploadSubmit = async () => {
    if (!uploadForm.tipoDocumentoId || !uploadForm.file) return

    await onSubmit({
      tipoDocumentoId: uploadForm.tipoDocumentoId,
      titulo: uploadForm.titulo.trim(),
      periodo: uploadForm.periodo.trim() || undefined,
      descripcion: uploadForm.descripcion.trim() || undefined,
      file: uploadForm.file,
    })

    setUploadForm(initialUploadForm)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#1E3A5F]">
            <Upload size={16} className="text-[#3B82F6]" />
            Subir documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
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
                      }))
                    }
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? "border-[#3B82F6] bg-[#EFF6FF] ring-1 ring-[#93C5FD]"
                        : "border-[#E5E7EB] bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFF]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold ${
                          isSelected
                            ? "bg-[#3B82F6] text-white"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        {tipo.id}
                      </div>

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
                    </div>

                    {isSelected && (
                      <CheckCircle
                        size={16}
                        className="shrink-0 text-[#3B82F6]"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {uploadForm.tipoDocumentoId && (
            <>
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                  Título del documento
                </label>

                <Input
                  placeholder={`Ej: ${selectedTipoDoc?.nombre ?? "Documento"} — ${studentName}`}
                  value={uploadForm.titulo}
                  onChange={event =>
                    setUploadForm(form => ({
                      ...form,
                      titulo: event.target.value,
                    }))
                  }
                  className="h-9 border-[#E5E7EB] text-sm"
                />
              </div>

              {uploadForm.tipoDocumentoId === "IB" && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                    Periodo <span className="text-[#DC2626]">*</span>
                  </label>

                  <Input
                    placeholder="Ej: I Bimestre 2025"
                    value={uploadForm.periodo}
                    onChange={event =>
                      setUploadForm(form => ({
                        ...form,
                        periodo: event.target.value,
                      }))
                    }
                    className="h-9 border-[#E5E7EB] text-sm"
                  />

                  <p className="mt-1 text-[11px] text-[#9CA3AF]">
                    Indica el bimestre y año al que corresponde este informe.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                  Descripción opcional
                </label>

                <Textarea
                  placeholder="Añade una nota sobre este documento..."
                  value={uploadForm.descripcion}
                  onChange={event =>
                    setUploadForm(form => ({
                      ...form,
                      descripcion: event.target.value,
                    }))
                  }
                  className="h-16 resize-none border-[#E5E7EB] text-sm"
                />
              </div>

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
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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
                        {(uploadForm.file.size / 1024).toFixed(0)} KB · Haz clic
                        para cambiar
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

                      <p className="text-xs text-[#9CA3AF]">
                        PDF, DOC, DOCX, PNG, JPG — máx. 20 MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="border-[#E5E7EB] text-xs text-[#374151]"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleUploadSubmit}
              disabled={isSubmitDisabled}
              className="gap-1.5 bg-[#1E3A5F] text-xs text-white hover:bg-[#2D4A6F]"
            >
              <Upload size={13} />
              Subir documento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}