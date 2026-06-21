"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { FileText, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "react-router-dom"
import {
  alumnosService,
  bitacoraService,
  entradaArchivosService,
  indicadoresService,
  perfilDiscapacidadService,
} from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { useApiQuery } from "@/hooks/useApiQuery"
import {
  FRONT_TO_BACK,
  TIPOS_POR_ROL,
  agruparHilos,
} from "@/lib/bitacora"
import { ENTRY_TYPES } from "@/lib/bitacora-ui"
import type { EntradaArchivoResponse, IndicadorResponse } from "@/types/api"
import type { BitacoraEntry } from "@/types/bitacora"
import { ExpedienteHeader } from "@/components/record/ExpedienteHeader"
import { PerfilCard } from "@/components/record/PerfilCard"
import { EquipoAsignadoCard } from "@/components/record/EquipoAsignadoCard"
import { ContactosFamiliaresCard } from "@/components/record/ContactosFamiliaresCard"
import { ProximosEventosCard } from "@/components/record/ProximosEventosCard"
import { BitacoraSection } from "@/components/record/BitacoraSection"
import type { EntryFormState } from "@/components/record/BitacoraEntryForm"
import { DocumentosSection } from "@/components/record/DocumentosSection"
import { AxiosError } from "axios"

export default function StudentRecord() {
  const { id } = useParams<{ id: string }>()
  const alumnoId = Number(id)
  const { user, hasPermission } = useAuth()

  const [activeMainTab, setActiveMainTab] = useState<"bitacora" | "documentos">("bitacora")

  const [activeFilter, setActiveFilter] = useState("all")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const [entries, setEntries] = useState<BitacoraEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const canExport = hasPermission("EXPEDIENTE_EXPORTAR")

  // --- Carga del alumno y perfil de discapacidad (header del expediente) ---
  const fetchAlumno = useCallback(() => alumnosService.obtener(alumnoId), [alumnoId])
  const fetchPerfil = useCallback(() => perfilDiscapacidadService.obtener(alumnoId), [alumnoId])
  const { data: alumno, isLoading: loadingAlumno } = useApiQuery(fetchAlumno)
  const { data: perfil } = useApiQuery(fetchPerfil)

  // Indicadores activos: solo el docente los necesita (es el único rol que puede crear EVALUACION_INDICADOR).
  // Para otros roles devolvemos lista vacía y evitamos el round-trip.
  const fetchIndicadoresActivos = useCallback(
    () =>
      user?.rol === "docente"
        ? indicadoresService.listar({ activo: true })
        : Promise.resolve<IndicadorResponse[]>([]),
    [user?.rol],
  )
  const { data: indicadoresActivos } = useApiQuery(fetchIndicadoresActivos)

  // New entry form state
  const [entryForm, setEntryForm] = useState<EntryFormState>({
    tipo: "",
    titulo: "",
    contenido: "",
    importancia: "",
    severidad: "",
    indicadorId: "",
    resultado: "",
    resultadoLogrado: "",
    archivos: [],
  })

  const selectedType = ENTRY_TYPES.find(t => t.id === entryForm.tipo)

  // Tipos visibles en el formulario según el rol del usuario autenticado.
  // Espejo de la matriz validada en el backend: si el rol no puede crear ese tipo,
  // no se muestra en el selector (evita un 400 al publicar).
  const tiposPermitidos = useMemo(
    () => (user ? TIPOS_POR_ROL[user.rol] ?? [] : []),
    [user],
  )
  const tiposVisibles = useMemo(
    () => ENTRY_TYPES.filter(t => tiposPermitidos.includes(t.id)),
    [tiposPermitidos],
  )

  const cargar = useCallback(async () => {
    if (!Number.isFinite(alumnoId)) {
      setError("ID de alumno inválido")
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await bitacoraService.listar(alumnoId)
      // Cargamos los adjuntos de cada raíz en paralelo. Usamos allSettled
      // para que si una request individual falla (p.ej. permisos), no
      // tumbemos el render completo de la bitácora.
      const raices = data.filter(e => e.entradaRaizId == null)
      const resultados = await Promise.allSettled(
        raices.map(r => entradaArchivosService.listar(alumnoId, r.id)),
      )
      const archivosPorEntrada = new Map<number, EntradaArchivoResponse[]>()
      resultados.forEach((res, idx) => {
        archivosPorEntrada.set(
          raices[idx].id,
          res.status === "fulfilled" ? res.value : [],
        )
      })
      setEntries(agruparHilos(data, archivosPorEntrada))
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.mensaje ?? err.message)
      } else {
        setError("Error inesperado al cargar la bitácora")
      }
    } finally {
      setIsLoading(false)
    }
  }, [alumnoId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handlePublish = async () => {
    if (!entryForm.tipo || !entryForm.contenido.trim()) return
    const tipoBackend = FRONT_TO_BACK[entryForm.tipo]
    if (!tipoBackend) return

    const esEvaluacion = entryForm.tipo === "evaluacion_indicador"
    if (esEvaluacion && !entryForm.indicadorId) return

    const resultadoLogrado = !esEvaluacion
      ? null
      : entryForm.resultadoLogrado === "true"
        ? true
        : entryForm.resultadoLogrado === "false"
          ? false
          : null

    setSubmitting(true)
    setError(null)
    try {
      const nueva = await bitacoraService.crear(alumnoId, {
        tipo: tipoBackend,
        titulo: entryForm.titulo.trim() || null,
        descripcion: entryForm.contenido,
        nivelImportancia: entryForm.importancia || null,
        severidad: entryForm.severidad || null,
        resultado: entryForm.resultado || null,
        indicadorId: esEvaluacion ? Number(entryForm.indicadorId) : null,
        resultadoLogrado,
      })

      // Sube los adjuntos secuencialmente. Si alguno falla, la entrada
      // ya existe y los anteriores también se subieron; se reporta cuáles
      // archivos fallaron sin abortar el flujo.
      const fallosArchivos: string[] = []
      for (const archivo of entryForm.archivos) {
        try {
          await entradaArchivosService.adjuntar(alumnoId, nueva.id, archivo)
        } catch {
          fallosArchivos.push(archivo.name)
        }
      }
      if (fallosArchivos.length > 0) {
        setError(
          `Entrada publicada, pero fallaron estos archivos: ${fallosArchivos.join(", ")}`,
        )
      }

      setEntryForm({
        tipo: "",
        titulo: "",
        contenido: "",
        importancia: "",
        severidad: "",
        indicadorId: "",
        resultado: "",
        resultadoLogrado: "",
        archivos: [],
      })
      await cargar()
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.mensaje ?? err.message)
      } else {
        setError("Error inesperado al publicar la entrada")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = async () => {
    if (!canExport) return
    setExporting(true)
    setError(null)
    try {
      const tipoBackend =
        activeFilter !== "all" ? FRONT_TO_BACK[activeFilter] : undefined
      const { blob, filename } = await bitacoraService.exportarCsv(alumnoId, {
        ...(tipoBackend ? { tipo: tipoBackend } : {}),
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.mensaje ?? err.message)
      } else {
        setError("Error inesperado al exportar la bitácora")
      }
    } finally {
      setExporting(false)
    }
  }

  const handleReply = async (entryId: string) => {
    if (!replyText.trim()) return
    const raiz = entries.find(e => e.id === entryId)
    if (!raiz) return
    const tipoBackend = FRONT_TO_BACK[raiz.type]
    if (!tipoBackend) return
    setSubmitting(true)
    setError(null)
    try {
      await bitacoraService.crear(alumnoId, {
        tipo: tipoBackend,
        descripcion: replyText,
        entradaRaizId: Number(entryId),
      })
      setReplyText("")
      setReplyingTo(null)
      await cargar()
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.mensaje ?? err.message)
      } else {
        setError("Error inesperado al publicar la respuesta")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filteredEntries = activeFilter === "all"
    ? entries
    : entries.filter(e => e.type === activeFilter)

  if (loadingAlumno) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-[#6B7280]">Cargando expediente del estudiante...</p>
      </div>
    )
  }
  if (!alumno) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-[#DC2626]">No se encontró el estudiante.</p>
      </div>
    )
  }

  const docentes = alumno.docentes ?? []
  const padres = alumno.padres ?? []

  return (
    <div className="p-6 space-y-6">
      <ExpedienteHeader alumno={alumno} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="space-y-4">
          <PerfilCard alumno={alumno} perfil={perfil} />
          <EquipoAsignadoCard docentes={docentes} padres={padres} />
          <ContactosFamiliaresCard padres={padres} />
          <ProximosEventosCard />
        </div>

        {/* Right Column - Bitácora & Documentos */}
        <div className="lg:col-span-2">
          {/* Main Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeMainTab === "bitacora" ? "default" : "outline"}
              onClick={() => setActiveMainTab("bitacora")}
              className={activeMainTab === "bitacora" 
                ? "bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-2" 
                : "border-[#E5E7EB] text-[#374151] gap-2"
              }
            >
              <FileText size={16} />
              Bitácora
            </Button>
            <Button
              variant={activeMainTab === "documentos" ? "default" : "outline"}
              onClick={() => setActiveMainTab("documentos")}
              className={activeMainTab === "documentos" 
                ? "bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-2" 
                : "border-[#E5E7EB] text-[#374151] gap-2"
              }
            >
              <FolderOpen size={16} />
              Documentos de Seguimiento
            </Button>
          </div>

          {/* Bitácora Tab Content */}
          {activeMainTab === "bitacora" && (
            <BitacoraSection
              alumnoId={alumnoId}
              alumnoNombre={`${alumno.nombre} ${alumno.apellido}`}
              entries={entries}
              filteredEntries={filteredEntries}
              isLoading={isLoading}
              error={error}
              submitting={submitting}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              tiposVisibles={tiposVisibles}
              entryForm={entryForm}
              setEntryForm={setEntryForm}
              selectedType={selectedType}
              indicadoresActivos={indicadoresActivos ?? []}
              onPublish={handlePublish}
              replyingTo={replyingTo}
              startReply={(id) => { setReplyingTo(id); setReplyText("") }}
              cancelReply={() => setReplyingTo(null)}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={handleReply}
              canExport={canExport}
              exporting={exporting}
              onExport={handleExport}
            />
          )}


          {/* Documentos Tab Content */}
          {activeMainTab === "documentos" && (
            <DocumentosSection
              alumnoId={alumnoId}
              studentName={`${alumno.nombre} ${alumno.apellido}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}
