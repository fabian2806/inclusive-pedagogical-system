import { useCallback, useState } from "react"
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileCheck,
  FolderOpen,
  History,
  Loader2,
  Paperclip,
  Upload,
} from "lucide-react"
import { AxiosError } from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { documentosExpedienteService, tiposDocumentoService } from "@/lib/api"
import { useApiQuery } from "@/hooks/useApiQuery"
import { toast } from "@/lib/toast"
import {
  UploadDocumentModal,
  type UploadDocumentPayload,
} from "./SubirDocumentoModal"
import type {
  DocumentoExpedienteResponse,
  TipoDocumentoResponse,
} from "@/types/api"

interface Props {
  alumnoId: number
  studentName: string
  /** Periodo a consultar. Omitirlo consulta el expediente vigente. */
  periodo?: string
  /** Expediente de un periodo cerrado: se consulta pero no se sube nada. */
  soloLectura?: boolean
}

interface GrupoDocumento {
  vigente: DocumentoExpedienteResponse
  historial: DocumentoExpedienteResponse[]
}

function esTipoOtro(tipo: TipoDocumentoResponse): boolean {
  return tipo.nombre.trim().toUpperCase() === "OTRO"
}

/**
 * Agrupa documentos por (tipoId, periodo). OTRO no se agrupa: cada upload
 * de OTRO es independiente (decisión Fase 2d para permitir múltiples
 * vigentes simultáneos sin colisión de versionado).
 */
function agruparDocumentos(docs: DocumentoExpedienteResponse[]): GrupoDocumento[] {
  const grupos = new Map<string, DocumentoExpedienteResponse[]>()
  for (const doc of docs) {
    const key = esTipoOtro(doc.tipoDocumento)
      ? `OTRO-${doc.id}`
      : `${doc.tipoDocumento.id}::${doc.periodo ?? ""}`
    const lista = grupos.get(key) ?? []
    lista.push(doc)
    grupos.set(key, lista)
  }
  const resultado = [...grupos.values()].map(versiones => {
    const ordenadas = [...versiones].sort(
      (a, b) => (b.version ?? 0) - (a.version ?? 0),
    )
    return {
      vigente: ordenadas.find(v => v.estado === "VIGENTE") ?? ordenadas[0],
      historial: ordenadas,
    }
  })
  return resultado.sort((a, b) =>
    b.vigente.fechaSubida.localeCompare(a.vigente.fechaSubida),
  )
}

function getDocTypeColor(tipoNombre: string) {
  switch (tipoNombre.trim().toUpperCase()) {
    case "PEP":
      return { bg: "bg-[#EEF2FF]", border: "border-[#C7D2FE]", text: "text-[#4F46E5]", icon: "text-[#4F46E5]" }
    case "IPP":
      return { bg: "bg-[#F3E8FF]", border: "border-[#DDD6FE]", text: "text-[#7C3AED]", icon: "text-[#7C3AED]" }
    case "IB":
      return { bg: "bg-[#ECFDF5]", border: "border-[#A7F3D0]", text: "text-[#059669]", icon: "text-[#059669]" }
    case "IS":
      return { bg: "bg-[#FEF3C7]", border: "border-[#FDE68A]", text: "text-[#D97706]", icon: "text-[#D97706]" }
    default:
      return { bg: "bg-[#F3F4F6]", border: "border-[#E5E7EB]", text: "text-[#6B7280]", icon: "text-[#6B7280]" }
  }
}

function formatFecha(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentosSection({
  alumnoId,
  studentName,
  periodo,
  soloLectura = false,
}: Props) {
  const fetchDocumentos = useCallback(
    () => documentosExpedienteService.listar(alumnoId, periodo),
    [alumnoId, periodo],
  )
  const fetchTipos = useCallback(() => tiposDocumentoService.listarCatalogo(), [])

  const {
    data: documentos,
    isLoading: loadingDocs,
    error: errorDocs,
    refetch,
  } = useApiQuery(fetchDocumentos)
  const {
    data: tipos,
    isLoading: loadingTipos,
    error: errorTipos,
  } = useApiQuery(fetchTipos)

  const [showVersionHistory, setShowVersionHistory] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const docs = documentos ?? []
  const tiposLista = tipos ?? []
  const grupos = agruparDocumentos(docs)

  const totalVigentes = docs.filter(d => d.estado === "VIGENTE").length
  const totalDocs = docs.length
  const totalObligatorios = tiposLista.filter(t => t.esObligatorio).length
  const totalConVersiones = grupos.filter(g => g.historial.length > 1).length

  const handleSubmit = async (payload: UploadDocumentPayload) => {
    setUploading(true)
    setUploadError(null)
    try {
      await documentosExpedienteService.subir(
        alumnoId,
        {
          tipoDocumentoId: payload.tipoDocumentoId,
          titulo: payload.titulo,
          periodo: payload.periodo,
          fechaEmision: payload.fechaEmision,
        },
        payload.file,
      )
      toast.success("Documento subido")
      refetch()
    } catch (err) {
      if (err instanceof AxiosError) {
        setUploadError(err.response?.data?.mensaje ?? err.message)
      } else {
        setUploadError("Error inesperado al subir documento")
      }
      throw err  // mantiene el modal abierto
    } finally {
      setUploading(false)
    }
  }

  const handleDescargar = async (doc: DocumentoExpedienteResponse) => {
    setActionError(null)
    try {
      await documentosExpedienteService.descargar(alumnoId, doc.id)
    } catch (err) {
      if (err instanceof AxiosError) {
        setActionError(err.response?.data?.mensaje ?? "Error al descargar documento")
      } else {
        setActionError("Error inesperado al descargar documento")
      }
    }
  }

  if (loadingDocs || loadingTipos) {
    return (
      <Card className="border-[#E5E7EB]">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E3A5F]" />
        </CardContent>
      </Card>
    )
  }

  if (errorDocs || errorTipos) {
    return (
      <Card className="border-[#E5E7EB]">
        <CardContent className="py-6">
          <div className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{errorDocs ?? errorTipos}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-[#1E3A5F] flex items-center gap-2">
              <FolderOpen size={20} className="text-[#3B82F6]" />
              Documentos de Seguimiento
            </CardTitle>
            {!soloLectura && (
              <Button
                className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
                size="sm"
                onClick={() => {
                  setUploadError(null)
                  setShowModal(true)
                }}
              >
                <Upload size={14} />
                Subir documento
              </Button>
            )}
          </div>
          <p className="text-sm text-[#6B7280] mt-1">
            Documentos oficiales del expediente con control de versiones
          </p>
        </CardHeader>
        <CardContent>
          {actionError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Stats summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
              <p className="text-2xl font-bold text-[#1E3A5F]">{totalVigentes}</p>
              <p className="text-xs text-[#6B7280]">Vigentes</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
              <p className="text-2xl font-bold text-[#1E3A5F]">{totalDocs}</p>
              <p className="text-xs text-[#6B7280]">Total</p>
            </div>
            <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-center">
              <p className="text-2xl font-bold text-[#059669]">{totalObligatorios}</p>
              <p className="text-xs text-[#059669]">Obligatorios</p>
            </div>
            <div className="p-3 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-center">
              <p className="text-2xl font-bold text-[#4F46E5]">{totalConVersiones}</p>
              <p className="text-xs text-[#4F46E5]">Con versiones</p>
            </div>
          </div>

          {/* Documents list */}
          <div className="space-y-3">
            {grupos.length === 0 && (
              <p className="text-sm text-center text-[#9CA3AF] py-8">
                No hay documentos en el expediente.
              </p>
            )}
            {grupos.map(grupo => {
              const doc = grupo.vigente
              const tipo = doc.tipoDocumento
              const colors = getDocTypeColor(tipo.nombre)
              const isExpanded = showVersionHistory === doc.id
              const tieneHistorial = grupo.historial.length > 1

              return (
                <div
                  key={doc.id}
                  className={`border rounded-lg ${colors.border} overflow-hidden`}
                >
                  <div className={`p-4 ${colors.bg}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg bg-white ${colors.border} border`}>
                          <FileCheck size={20} className={colors.icon} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-[#1E3A5F]">{doc.titulo}</h4>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${colors.bg} ${colors.text} border-transparent`}
                            >
                              {tipo.nombre}
                            </Badge>
                            {doc.estado === "VIGENTE" ? (
                              <Badge className="text-[10px] bg-[#10B981] text-white border-transparent gap-1">
                                <CheckCircle size={10} />
                                Vigente
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-[#6B7280] border-[#D1D5DB]">
                                Archivado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                            <span>Emitido: {formatFecha(doc.fechaEmision)}</span>
                            <span>·</span>
                            <span>
                              Subido por: {doc.usuarioSubido.nombre} {doc.usuarioSubido.apellido}
                            </span>
                            {doc.version != null && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1 text-[#4F46E5]">
                                  <History size={12} />
                                  Versión {doc.version}
                                </span>
                              </>
                            )}
                            {doc.periodo && (
                              <>
                                <span>·</span>
                                <span>{doc.periodo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tieneHistorial && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowVersionHistory(isExpanded ? null : doc.id)
                            }
                            className="text-xs text-[#6B7280] hover:text-[#4F46E5] gap-1"
                          >
                            <History size={14} />
                            {isExpanded ? "Ocultar" : "Historial"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDescargar(doc)}
                          className="text-xs text-[#6B7280] hover:text-[#059669] gap-1"
                        >
                          <Download size={14} />
                          Descargar
                        </Button>
                      </div>
                    </div>

                    {/* File info */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#6B7280]">
                      <Paperclip size={12} />
                      <span>{doc.archivo.nombreOriginal}</span>
                      <span className="text-[#9CA3AF]">
                        ({formatTamano(doc.archivo.tamano)})
                      </span>
                    </div>
                  </div>

                  {/* Version history */}
                  {isExpanded && tieneHistorial && (
                    <div className="border-t border-[#E5E7EB] bg-white p-4">
                      <p className="text-xs font-medium text-[#374151] mb-3">
                        Historial de versiones
                      </p>
                      <div className="space-y-2">
                        {grupo.historial.map(ver => (
                          <div
                            key={ver.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              ver.estado === "VIGENTE"
                                ? "bg-[#EEF2FF]"
                                : "bg-[#F9FAFB]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  ver.estado === "VIGENTE"
                                    ? "bg-[#4F46E5] text-white border-transparent"
                                    : "text-[#6B7280]"
                                }`}
                              >
                                v{ver.version ?? 1}
                              </Badge>
                              <span className="text-xs text-[#374151]">
                                {ver.archivo.nombreOriginal}
                              </span>
                              <span className="text-xs text-[#6B7280]">
                                {formatFecha(ver.fechaSubida)} · {ver.usuarioSubido.nombre}{" "}
                                {ver.usuarioSubido.apellido}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDescargar(ver)}
                              className="text-xs text-[#6B7280] hover:text-[#059669] gap-1 h-7"
                            >
                              <Download size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Required documents status */}
          {tiposLista.some(t => t.esObligatorio) && (
            <div className="mt-6 p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <p className="text-sm font-medium text-[#1E3A5F] mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-[#F59E0B]" />
                Documentos obligatorios
              </p>
              <div className="grid grid-cols-3 gap-3">
                {tiposLista
                  .filter(t => t.esObligatorio)
                  .map(tipo => {
                    const hasVigente = docs.some(
                      d => d.tipoDocumento.id === tipo.id && d.estado === "VIGENTE",
                    )
                    return (
                      <div
                        key={tipo.id}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          hasVigente ? "bg-[#ECFDF5]" : "bg-[#FEF3C7]"
                        }`}
                      >
                        {hasVigente ? (
                          <CheckCircle size={14} className="text-[#059669]" />
                        ) : (
                          <AlertCircle size={14} className="text-[#D97706]" />
                        )}
                        <span
                          className={`text-xs ${hasVigente ? "text-[#059669]" : "text-[#D97706]"}`}
                        >
                          {tipo.nombre}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UploadDocumentModal
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open)
          if (!open) setUploadError(null)
        }}
        tiposDocumento={tiposLista}
        studentName={studentName}
        onSubmit={handleSubmit}
        uploading={uploading}
        uploadError={uploadError}
      />
    </>
  )
}
