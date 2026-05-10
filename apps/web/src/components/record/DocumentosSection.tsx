import { useState } from "react"
import { AlertCircle, CheckCircle, Download, Eye, FileCheck, FolderOpen, History, Paperclip, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadDocumentModal } from "@/components/record/SubirDocumentoModal"

// Mock — la integración real con documentos llega en la fase 2d.
const tiposDocumento = [
  { id: "PEP", nombre: "Plan Educativo Personalizado", esObligatorio: true, esVersionable: true, esPeriodico: false },
  { id: "IPP", nombre: "Informe Psicopedagógico", esObligatorio: true, esVersionable: true, esPeriodico: false },
  { id: "IB", nombre: "Informe Bimestral", esObligatorio: true, esVersionable: false, esPeriodico: true, periodicidad: "Bimestral" },
  { id: "IS", nombre: "Informe de Salida", esObligatorio: false, esVersionable: false, esPeriodico: false },
  { id: "OTRO", nombre: "Otro", esObligatorio: false, esVersionable: false, esPeriodico: false },
]

const documentosExpediente = [
  {
    id: "1",
    tipoDocumentoId: "PEP",
    titulo: "Plan Educativo Personalizado 2025",
    version: 2,
    estado: "vigente",
    fechaEmision: "15/01/2025",
    fechaSubida: "16/01/2025",
    usuarioSubido: "Esp. Roberto Quispe",
    archivo: { nombreOriginal: "PEP_Sofia_Rodriguez_2025_v2.pdf", mimeType: "application/pdf", tamano: "1.2 MB", url: "#" },
    versiones: [
      { version: 1, fecha: "10/01/2024", usuario: "Esp. Roberto Quispe", archivo: "PEP_Sofia_Rodriguez_2024_v1.pdf" },
      { version: 2, fecha: "16/01/2025", usuario: "Esp. Roberto Quispe", archivo: "PEP_Sofia_Rodriguez_2025_v2.pdf" },
    ],
  },
  {
    id: "2",
    tipoDocumentoId: "IPP",
    titulo: "Informe Psicopedagógico Inicial",
    version: 1,
    estado: "vigente",
    fechaEmision: "20/03/2023",
    fechaSubida: "22/03/2023",
    usuarioSubido: "Esp. Roberto Quispe",
    archivo: { nombreOriginal: "IPP_Sofia_Rodriguez_Inicial.pdf", mimeType: "application/pdf", tamano: "2.8 MB", url: "#" },
    versiones: [
      { version: 1, fecha: "22/03/2023", usuario: "Esp. Roberto Quispe", archivo: "IPP_Sofia_Rodriguez_Inicial.pdf" },
    ],
  },
  {
    id: "3",
    tipoDocumentoId: "IB",
    titulo: "Informe Bimestral - I Bimestre 2025",
    periodo: "I Bimestre 2025",
    version: null as number | null,
    estado: "vigente",
    fechaEmision: "28/02/2025",
    fechaSubida: "01/03/2025",
    usuarioSubido: "Prof. María Castro",
    archivo: { nombreOriginal: "IB_Sofia_Rodriguez_I_Bim_2025.pdf", mimeType: "application/pdf", tamano: "856 KB", url: "#" },
    versiones: [] as { version: number; fecha: string; usuario: string; archivo: string }[],
  },
  {
    id: "4",
    tipoDocumentoId: "IB",
    titulo: "Informe Bimestral - IV Bimestre 2024",
    periodo: "IV Bimestre 2024",
    version: null as number | null,
    estado: "archivado",
    fechaEmision: "15/12/2024",
    fechaSubida: "16/12/2024",
    usuarioSubido: "Prof. María Castro",
    archivo: { nombreOriginal: "IB_Sofia_Rodriguez_IV_Bim_2024.pdf", mimeType: "application/pdf", tamano: "920 KB", url: "#" },
    versiones: [] as { version: number; fecha: string; usuario: string; archivo: string }[],
  },
  {
    id: "5",
    tipoDocumentoId: "OTRO",
    titulo: "Constancia de Matrícula 2025",
    version: null as number | null,
    estado: "vigente",
    fechaEmision: "05/01/2025",
    fechaSubida: "05/01/2025",
    usuarioSubido: "Admin Sistema",
    archivo: { nombreOriginal: "Constancia_Matricula_2025.pdf", mimeType: "application/pdf", tamano: "125 KB", url: "#" },
    versiones: [] as { version: number; fecha: string; usuario: string; archivo: string }[],
  },
]

function getTipoDocumento(tipoId: string) {
  return tiposDocumento.find((t) => t.id === tipoId) || tiposDocumento[4]
}

function getDocTypeColor(tipoId: string) {
  switch (tipoId) {
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

export function DocumentosSection() {
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  return (
    <>
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-[#1E3A5F] flex items-center gap-2">
              <FolderOpen size={20} className="text-[#3B82F6]" />
              Documentos de Seguimiento
            </CardTitle>
            <Button className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white" size="sm" onClick={() => setUploadModalOpen(true)}>
              <Upload size={14} />
              Subir documento
            </Button>
          </div>
          <p className="text-sm text-[#6B7280] mt-1">
            Documentos oficiales del expediente con control de versiones
          </p>
        </CardHeader>
        <CardContent>
          {/* Stats summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
              <p className="text-2xl font-bold text-[#1E3A5F]">
                {documentosExpediente.filter((d) => d.estado === "vigente").length}
              </p>
              <p className="text-xs text-[#6B7280]">Vigentes</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
              <p className="text-2xl font-bold text-[#1E3A5F]">{documentosExpediente.length}</p>
              <p className="text-xs text-[#6B7280]">Total</p>
            </div>
            <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-center">
              <p className="text-2xl font-bold text-[#059669]">
                {tiposDocumento.filter((t) => t.esObligatorio).length}
              </p>
              <p className="text-xs text-[#059669]">Obligatorios</p>
            </div>
            <div className="p-3 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-center">
              <p className="text-2xl font-bold text-[#4F46E5]">
                {documentosExpediente.filter((d) => (d.version || 0) > 1).length}
              </p>
              <p className="text-xs text-[#4F46E5]">Con versiones</p>
            </div>
          </div>

          {/* Documents list */}
          <div className="space-y-3">
            {documentosExpediente.map((doc) => {
              const tipo = getTipoDocumento(doc.tipoDocumentoId)
              const colors = getDocTypeColor(doc.tipoDocumentoId)
              const isExpanded = showVersionHistory === doc.id

              return (
                <div key={doc.id} className={`border rounded-lg ${colors.border} overflow-hidden`}>
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
                            {doc.estado === "vigente" ? (
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
                            <span>Emitido: {doc.fechaEmision}</span>
                            <span>·</span>
                            <span>Subido por: {doc.usuarioSubido}</span>
                            {doc.version && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1 text-[#4F46E5]">
                                  <History size={12} />
                                  Versión {doc.version}
                                </span>
                              </>
                            )}
                            {"periodo" in doc && doc.periodo && (
                              <>
                                <span>·</span>
                                <span>{doc.periodo}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.versiones && doc.versiones.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowVersionHistory(isExpanded ? null : doc.id)}
                            className="text-xs text-[#6B7280] hover:text-[#4F46E5] gap-1"
                          >
                            <History size={14} />
                            {isExpanded ? "Ocultar" : "Historial"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#6B7280] hover:text-[#3B82F6] gap-1"
                        >
                          <Eye size={14} />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
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
                      <span className="text-[#9CA3AF]">({doc.archivo.tamano})</span>
                    </div>
                  </div>

                  {/* Version history */}
                  {isExpanded && doc.versiones && doc.versiones.length > 0 && (
                    <div className="border-t border-[#E5E7EB] bg-white p-4">
                      <p className="text-xs font-medium text-[#374151] mb-3">Historial de versiones</p>
                      <div className="space-y-2">
                        {doc.versiones.map((ver, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              idx === doc.versiones.length - 1 ? "bg-[#EEF2FF]" : "bg-[#F9FAFB]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  idx === doc.versiones.length - 1
                                    ? "bg-[#4F46E5] text-white border-transparent"
                                    : "text-[#6B7280]"
                                }`}
                              >
                                v{ver.version}
                              </Badge>
                              <span className="text-xs text-[#374151]">{ver.archivo}</span>
                              <span className="text-xs text-[#6B7280]">
                                {ver.fecha} · {ver.usuario}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
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
          <div className="mt-6 p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
            <p className="text-sm font-medium text-[#1E3A5F] mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#F59E0B]" />
              Documentos obligatorios
            </p>
            <div className="grid grid-cols-3 gap-3">
              {tiposDocumento.filter((t) => t.esObligatorio).map((tipo) => {
                const hasDoc = documentosExpediente.some(
                  (d) => d.tipoDocumentoId === tipo.id && d.estado === "vigente",
                )
                return (
                  <div
                    key={tipo.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      hasDoc ? "bg-[#ECFDF5]" : "bg-[#FEF3C7]"
                    }`}
                  >
                    {hasDoc ? (
                      <CheckCircle size={14} className="text-[#059669]" />
                    ) : (
                      <AlertCircle size={14} className="text-[#D97706]" />
                    )}
                    <span className={`text-xs ${hasDoc ? "text-[#059669]" : "text-[#D97706]"}`}>
                      {tipo.nombre}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        tiposDocumento={tiposDocumento}
        studentName="Sofía Rodríguez"
        onSubmit={async (payload) => {
          console.log("Documento a subir:", payload)
        }}
      />
  </>
  )
}
