"use client"

import { useCallback, useState } from "react"
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  Heart,
  FileText,
  GraduationCap,
  Ear,
  MessageSquare,
  ShieldAlert,
  HandHelping,
  Star,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Pencil,
  X,
  Check,
  Trash2,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link, useParams } from "react-router-dom"
import { useApiQuery } from "@/hooks/useApiQuery"
import { useAuth } from "@/hooks/useAuth"
import { alumnosService } from "@/lib/api/alumnosService"
import { perfilDiscapacidadService } from "@/lib/api/perfilDiscapacidadService"
import type {
  BarreraResponse, FortalezaResponse, ApoyoResponse,
  BarreraRequest, FortalezaRequest, ApoyoRequest,
  ErrorResponse,
} from "@/types/api"
import { AxiosError } from "axios"

// --- Mapeo de enums ---

const LABEL_TIPO_BARRERA: Record<string, string> = {
  FISICA: "Física",
  ACTITUDINAL_SOCIAL: "Actitudinal/Social",
  PEDAGOGICA: "Pedagógica",
  ORGANIZATIVA: "Organizativa",
}

const LABEL_DIMENSION: Record<string, string> = {
  MOTIVACIONES: "Motivaciones",
  ACCESO_INFORMACION: "Acceso a información",
  EXPRESIONES: "Expresiones",
  ACT_DIARIAS: "Actividades diarias",
  INTERACCION_ENTORNO: "Interacción con el entorno",
}

const LABEL_INTENSIDAD: Record<string, string> = {
  GENERALIZADO: "Generalizado",
  EXTENSO: "Extenso",
  LIMITADO: "Limitado",
  INTERMITENTE: "Intermitente",
}

const LABEL_FUNCION: Record<string, string> = {
  ROL_COMPORTAMIENTO: "Rol/Comportamiento",
  ACCESO_INFORMACION: "Acceso a información",
  ADQ_CONOCIMIENTO: "Adq. conocimiento",
  APRENDIZAJE_DIARIO: "Aprendizaje diario",
}

const LABEL_FUENTE: Record<string, string> = {
  ESTUDIANTE: "Estudiante",
  PERSONAS: "Personas",
  SAAC: "SAAC",
  SERVICIOS: "Servicios",
}

const COLOR_BARRERA: Record<string, { bg: string; border: string; text: string }> = {
  FISICA: { bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  ACTITUDINAL_SOCIAL: { bg: "#F3E8FF", border: "#DDD6FE", text: "#7C3AED" },
  PEDAGOGICA: { bg: "#FEF3C7", border: "#FDE68A", text: "#D97706" },
  ORGANIZATIVA: { bg: "#FFF7ED", border: "#FED7AA", text: "#EA580C" },
}

const COLOR_FORTALEZA: Record<string, { bg: string; border: string; text: string }> = {
  MOTIVACIONES: { bg: "#ECFDF5", border: "#A7F3D0", text: "#059669" },
  ACCESO_INFORMACION: { bg: "#EEF2FF", border: "#C7D2FE", text: "#4F46E5" },
  EXPRESIONES: { bg: "#FFF7ED", border: "#FED7AA", text: "#EA580C" },
  ACT_DIARIAS: { bg: "#FDF2F8", border: "#FBCFE8", text: "#DB2777" },
  INTERACCION_ENTORNO: { bg: "#F3E8FF", border: "#DDD6FE", text: "#7C3AED" },
}

const COLOR_APOYO: Record<string, { bg: string; border: string; text: string }> = {
  ESTUDIANTE: { bg: "#ECFDF5", border: "#A7F3D0", text: "#059669" },
  PERSONAS: { bg: "#EEF2FF", border: "#C7D2FE", text: "#4F46E5" },
  SAAC: { bg: "#FEF3C7", border: "#FDE68A", text: "#D97706" },
  SERVICIOS: { bg: "#FDF2F8", border: "#FBCFE8", text: "#DB2777" },
}

const DEFAULT_COLOR = { bg: "#F9FAFB", border: "#E5E7EB", text: "#6B7280" }

export default function StudentProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const alumnoId = Number(id)
  const esDocente = user?.rol === "docente"

  // --- Data fetching ---
  const fetchAlumno = useCallback(() => alumnosService.obtener(alumnoId), [alumnoId])
  const fetchPerfil = useCallback(() => perfilDiscapacidadService.obtener(alumnoId), [alumnoId])
  const { data: alumno, isLoading: loadingAlumno } = useApiQuery(fetchAlumno)
  const { data: perfil, isLoading: loadingPerfil, error: errorPerfil, refetch: refetchPerfil } = useApiQuery(fetchPerfil)

  // --- Expand/collapse ---
  const [showAllBarreras, setShowAllBarreras] = useState(false)
  const [showAllApoyos, setShowAllApoyos] = useState(false)
  const [showAllFortalezas, setShowAllFortalezas] = useState(false)

  // --- Edit modes ---
  const [editingPerfil, setEditingPerfil] = useState(false)
  const [editingBarreras, setEditingBarreras] = useState(false)
  const [editingFortalezas, setEditingFortalezas] = useState(false)
  const [editingApoyos, setEditingApoyos] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // --- Form state ---
  const [formModoComunicacion, setFormModoComunicacion] = useState("")
  const [formObservaciones, setFormObservaciones] = useState("")
  const [formBarreras, setFormBarreras] = useState<BarreraRequest[]>([])
  const [formFortalezas, setFormFortalezas] = useState<FortalezaRequest[]>([])
  const [formApoyos, setFormApoyos] = useState<ApoyoRequest[]>([])

  // --- Derived data ---
  const barreras = perfil?.barreras ?? []
  const fortalezas = perfil?.fortalezas ?? []
  const apoyos = perfil?.apoyos ?? []
  const visibleBarreras = showAllBarreras ? barreras : barreras.slice(0, 2)
  const visibleApoyos = showAllApoyos ? apoyos : apoyos.slice(0, 2)
  const visibleFortalezas = showAllFortalezas ? fortalezas : fortalezas.slice(0, 2)

  // --- Helpers ---
  const currentBarrerasAsRequest = (): BarreraRequest[] =>
    barreras.map((b) => ({ tipo: b.tipo, descripcion: b.descripcion }))
  const currentFortalezasAsRequest = (): FortalezaRequest[] =>
    fortalezas.map((f) => ({ dimension: f.dimension, descripcion: f.descripcion }))
  const currentApoyosAsRequest = (): ApoyoRequest[] =>
    apoyos.map((a) => ({ intensidad: a.intensidad, funcion: a.funcion, descripcion: a.descripcion, fuente: a.fuente }))

  const extraerError = (err: unknown): string => {
    if (err instanceof AxiosError) {
      const apiError = err.response?.data as ErrorResponse | undefined
      return apiError?.mensaje ?? err.message
    }
    return "Error inesperado"
  }

  // --- Save handler (sends full profile) ---
  const guardarPerfil = async (overrides: {
    modoComunicacionPreferido?: string
    observacionesGenerales?: string
    barreras?: BarreraRequest[]
    fortalezas?: FortalezaRequest[]
    apoyos?: ApoyoRequest[]
  }) => {
    setSaving(true)
    setSaveError(null)
    try {
      await perfilDiscapacidadService.guardar(alumnoId, {
        modoComunicacionPreferido: overrides.modoComunicacionPreferido ?? perfil?.modoComunicacionPreferido ?? "",
        observacionesGenerales: overrides.observacionesGenerales ?? perfil?.observacionesGenerales ?? "",
        barreras: overrides.barreras ?? currentBarrerasAsRequest(),
        fortalezas: overrides.fortalezas ?? currentFortalezasAsRequest(),
        apoyos: overrides.apoyos ?? currentApoyosAsRequest(),
      })
      refetchPerfil()
      return true
    } catch (err) {
      setSaveError(extraerError(err))
      return false
    } finally {
      setSaving(false)
    }
  }

  // --- Section handlers ---
  const startEditPerfil = () => {
    setFormModoComunicacion(perfil?.modoComunicacionPreferido ?? "")
    setFormObservaciones(perfil?.observacionesGenerales ?? "")
    setEditingPerfil(true)
  }
  const cancelEditPerfil = () => { setEditingPerfil(false); setSaveError(null) }
  const savePerfil = async () => {
    const ok = await guardarPerfil({ modoComunicacionPreferido: formModoComunicacion, observacionesGenerales: formObservaciones })
    if (ok) setEditingPerfil(false)
  }

  const startEditBarreras = () => {
    setFormBarreras(barreras.length > 0 ? currentBarrerasAsRequest() : [])
    setEditingBarreras(true)
  }
  const cancelEditBarreras = () => { setEditingBarreras(false); setSaveError(null) }
  const saveBarreras = async () => {
    const ok = await guardarPerfil({ barreras: formBarreras })
    if (ok) setEditingBarreras(false)
  }

  const startEditFortalezas = () => {
    setFormFortalezas(fortalezas.length > 0 ? currentFortalezasAsRequest() : [])
    setEditingFortalezas(true)
  }
  const cancelEditFortalezas = () => { setEditingFortalezas(false); setSaveError(null) }
  const saveFortalezas = async () => {
    const ok = await guardarPerfil({ fortalezas: formFortalezas })
    if (ok) setEditingFortalezas(false)
  }

  const startEditApoyos = () => {
    setFormApoyos(apoyos.length > 0 ? currentApoyosAsRequest() : [])
    setEditingApoyos(true)
  }
  const cancelEditApoyos = () => { setEditingApoyos(false); setSaveError(null) }
  const saveApoyos = async () => {
    const ok = await guardarPerfil({ apoyos: formApoyos })
    if (ok) setEditingApoyos(false)
  }

  // --- Loading/error states ---
  if (loadingAlumno) {
    return <div className="p-6 flex items-center justify-center"><p className="text-[#6B7280]">Cargando perfil del estudiante...</p></div>
  }
  if (!alumno) {
    return <div className="p-6 flex items-center justify-center"><p className="text-[#DC2626]">No se encontró el estudiante.</p></div>
  }

  const initials = `${alumno.nombre.charAt(0)}${alumno.apellido.charAt(0)}`
  const perfilExiste = !!perfil && !errorPerfil

  return (
    <div className="p-6 space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/estudiantes">
          <Button variant="ghost" size="icon" className="text-[#6B7280] hover:text-[#1E3A5F]"><ArrowLeft size={20} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Perfil del estudiante</h1>
          <p className="text-sm text-[#6B7280]">Información personal y datos del estudiante</p>
        </div>
        <Link to={`/dashboard/estudiantes/${id}/expediente`}>
          <Button className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"><FileText size={16} />Ver expediente</Button>
        </Link>
      </div>

      {/* Error global */}
      {saveError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5]">
          <AlertTriangle size={15} className="text-[#DC2626] mt-0.5 shrink-0" />
          <p className="text-xs text-[#991B1B]">{saveError}</p>
        </div>
      )}

      {/* Profile Header Card */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarFallback className="bg-[#EEF2FF] text-[#3B82F6] text-3xl font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 className="text-xl font-bold text-[#1E3A5F]">{alumno.nombre} {alumno.apellido}</h2>
                <Badge variant="outline" className={`w-fit text-xs ${alumno.estado === "ACTIVO" ? "border-[#10B981] text-[#059669] bg-[#D1FAE5]" : "border-[#D1D5DB] text-[#6B7280] bg-[#F3F4F6]"}`}>
                  {alumno.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6B7280]">
                <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-[#3B82F6]" />{alumno.grado} - Sección {alumno.seccion}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#3B82F6]" />{alumno.fechaNacimiento}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* ============ PERFIL DISCAPACIDAD AUDITIVA ============ */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <Ear size={18} className="text-[#8B5CF6]" />
                  Perfil de discapacidad auditiva
                </CardTitle>
                {esDocente && !editingPerfil && (
                  <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1.5" onClick={startEditPerfil}>
                    <Pencil size={14} /> Editar
                  </Button>
                )}
                {editingPerfil && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1" onClick={cancelEditPerfil} disabled={saving}>
                      <X size={14} /> Cancelar
                    </Button>
                    <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-1" onClick={savePerfil} disabled={saving}>
                      <Check size={14} /> {saving ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPerfil ? (
                <p className="text-sm text-[#6B7280]">Cargando perfil...</p>
              ) : editingPerfil ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Modo de comunicación preferido</label>
                    <Input value={formModoComunicacion} onChange={(e) => setFormModoComunicacion(e.target.value)} placeholder="Ej: LSP + lectura labial" className="border-[#E5E7EB]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Observaciones generales</label>
                    <Textarea value={formObservaciones} onChange={(e) => setFormObservaciones(e.target.value)} placeholder="Observaciones sobre el perfil auditivo..." className="border-[#E5E7EB] min-h-[80px]" />
                  </div>
                </div>
              ) : !perfilExiste ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
                  <AlertTriangle size={15} className="text-[#D97706] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#92400E]">Aún no se ha registrado un perfil de discapacidad para este estudiante.{esDocente && " Haz clic en Editar para comenzar."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#F9FAFB]">
                    <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">Modo de comunicación preferido</p>
                    <p className="text-sm text-[#374151] font-medium">{perfil.modoComunicacionPreferido || "No registrado"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F9FAFB]">
                    <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">Observaciones generales</p>
                    <p className="text-sm text-[#374151]">{perfil.observacionesGenerales || "Sin observaciones"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipo asignado */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2"><User size={18} className="text-[#3B82F6]" />Equipo asignado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alumno.docentes.length === 0 && alumno.padres.length === 0 ? (
                <p className="text-sm text-[#6B7280]">Sin asignaciones aún.</p>
              ) : (
                <>
                  {alumno.docentes.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#F9FAFB]">
                      <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center">
                        <span className="text-sm text-white font-semibold">{doc.nombre.charAt(0)}{doc.apellido.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#374151]">{doc.nombre} {doc.apellido}</p>
                        <p className="text-xs text-[#6B7280]">Docente</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#3B82F6]"><MessageSquare size={16} /></Button>
                    </div>
                  ))}
                  {alumno.padres.map((padre) => (
                    <div key={padre.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#F9FAFB]">
                      <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                        <span className="text-sm text-white font-semibold">{padre.nombre.charAt(0)}{padre.apellido.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#374151]">{padre.nombre} {padre.apellido}</p>
                        <p className="text-xs text-[#6B7280]">Padre/Apoderado</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#8B5CF6]"><MessageSquare size={16} /></Button>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contactos familiares */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2"><Heart size={18} className="text-[#EF4444]" />Contactos familiares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alumno.padres.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Sin padres/apoderados asignados.</p>
              ) : (
                alumno.padres.map((padre) => (
                  <div key={padre.id} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-[#1E3A5F]">{padre.nombre} {padre.apellido}</p>
                      <p className="text-xs text-[#6B7280]">Padre/Apoderado</p>
                    </div>
                    <div className="space-y-2 text-sm text-[#6B7280]">
                      {padre.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-[#9CA3AF]" />
                          <span>{padre.telefono.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-[#9CA3AF]" />
                        <span>{padre.correo}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ============ BARRERAS ============ */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <ShieldAlert size={18} className="text-[#DC2626]" />
                  Barreras identificadas
                  <span className="text-xs font-normal text-[#9CA3AF]">{editingBarreras ? formBarreras.length : barreras.length}</span>
                </CardTitle>
                {esDocente && !editingBarreras && (
                  <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1.5" onClick={startEditBarreras}>
                    <Pencil size={14} /> Editar
                  </Button>
                )}
                {editingBarreras && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1" onClick={cancelEditBarreras} disabled={saving}><X size={14} /> Cancelar</Button>
                    <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-1" onClick={saveBarreras} disabled={saving}><Check size={14} /> {saving ? "Guardando..." : "Guardar"}</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingBarreras ? (
                <>
                  {formBarreras.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center gap-2">
                        <Select value={b.tipo} onValueChange={(val) => { const copy = [...formBarreras]; copy[idx] = { ...copy[idx], tipo: val }; setFormBarreras(copy) }}>
                          <SelectTrigger className="w-48 border-[#E5E7EB]"><SelectValue placeholder="Tipo de barrera" /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(LABEL_TIPO_BARRERA).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon" className="text-[#DC2626] h-8 w-8" onClick={() => setFormBarreras(formBarreras.filter((_, i) => i !== idx))}><Trash2 size={16} /></Button>
                      </div>
                      <Textarea value={b.descripcion} onChange={(e) => { const copy = [...formBarreras]; copy[idx] = { ...copy[idx], descripcion: e.target.value }; setFormBarreras(copy) }} placeholder="Descripción de la barrera..." className="border-[#E5E7EB] min-h-[60px]" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-[#6B7280] border-dashed border-[#D1D5DB] gap-1.5" onClick={() => setFormBarreras([...formBarreras, { tipo: "", descripcion: "" }])}><Plus size={14} /> Agregar barrera</Button>
                </>
              ) : barreras.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Sin barreras registradas.</p>
              ) : (
                <>
                  {visibleBarreras.map((item: BarreraResponse) => {
                    const color = COLOR_BARRERA[item.tipo] ?? DEFAULT_COLOR
                    return (
                      <div key={item.id} className="p-3 rounded-lg border" style={{ backgroundColor: color.bg, borderColor: color.border }}>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="text-[10px] font-semibold shrink-0" style={{ borderColor: color.text, color: color.text, backgroundColor: "white" }}>{LABEL_TIPO_BARRERA[item.tipo] ?? item.tipo}</Badge>
                          <p className="text-sm text-[#374151]">{item.descripcion}</p>
                        </div>
                      </div>
                    )
                  })}
                  {barreras.length > 2 && (
                    <Button variant="ghost" size="sm" className="w-full text-[#6B7280] hover:text-[#1E3A5F]" onClick={() => setShowAllBarreras(!showAllBarreras)}>
                      {showAllBarreras ? <><ChevronUp size={14} className="mr-1" /> Ver menos</> : <><ChevronDown size={14} className="mr-1" /> Ver más ({barreras.length - 2})</>}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ============ APOYOS ============ */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <HandHelping size={18} className="text-[#059669]" />
                  Apoyos disponibles
                  <span className="text-xs font-normal text-[#9CA3AF]">{editingApoyos ? formApoyos.length : apoyos.length}</span>
                </CardTitle>
                {esDocente && !editingApoyos && (
                  <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1.5" onClick={startEditApoyos}><Pencil size={14} /> Editar</Button>
                )}
                {editingApoyos && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1" onClick={cancelEditApoyos} disabled={saving}><X size={14} /> Cancelar</Button>
                    <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-1" onClick={saveApoyos} disabled={saving}><Check size={14} /> {saving ? "Guardando..." : "Guardar"}</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingApoyos ? (
                <>
                  {formApoyos.map((a, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select value={a.fuente} onValueChange={(val) => { const copy = [...formApoyos]; copy[idx] = { ...copy[idx], fuente: val }; setFormApoyos(copy) }}>
                          <SelectTrigger className="w-36 border-[#E5E7EB]"><SelectValue placeholder="Fuente" /></SelectTrigger>
                          <SelectContent>{Object.entries(LABEL_FUENTE).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={a.funcion} onValueChange={(val) => { const copy = [...formApoyos]; copy[idx] = { ...copy[idx], funcion: val }; setFormApoyos(copy) }}>
                          <SelectTrigger className="w-48 border-[#E5E7EB]"><SelectValue placeholder="Función" /></SelectTrigger>
                          <SelectContent>{Object.entries(LABEL_FUNCION).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={a.intensidad} onValueChange={(val) => { const copy = [...formApoyos]; copy[idx] = { ...copy[idx], intensidad: val }; setFormApoyos(copy) }}>
                          <SelectTrigger className="w-40 border-[#E5E7EB]"><SelectValue placeholder="Intensidad" /></SelectTrigger>
                          <SelectContent>{Object.entries(LABEL_INTENSIDAD).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon" className="text-[#DC2626] h-8 w-8" onClick={() => setFormApoyos(formApoyos.filter((_, i) => i !== idx))}><Trash2 size={16} /></Button>
                      </div>
                      <Textarea value={a.descripcion} onChange={(e) => { const copy = [...formApoyos]; copy[idx] = { ...copy[idx], descripcion: e.target.value }; setFormApoyos(copy) }} placeholder="Descripción del apoyo..." className="border-[#E5E7EB] min-h-[60px]" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-[#6B7280] border-dashed border-[#D1D5DB] gap-1.5" onClick={() => setFormApoyos([...formApoyos, { fuente: "", funcion: "", intensidad: "", descripcion: "" }])}><Plus size={14} /> Agregar apoyo</Button>
                </>
              ) : apoyos.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Sin apoyos registrados.</p>
              ) : (
                <>
                  {visibleApoyos.map((item: ApoyoResponse) => {
                    const color = COLOR_APOYO[item.fuente] ?? DEFAULT_COLOR
                    return (
                      <div key={item.id} className="p-3 rounded-lg border" style={{ backgroundColor: color.bg, borderColor: color.border }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] font-semibold shrink-0" style={{ borderColor: color.text, color: color.text, backgroundColor: "white" }}>{LABEL_FUENTE[item.fuente] ?? item.fuente}</Badge>
                          <div className="flex gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#6B7280] border border-[#E5E7EB]">{LABEL_FUNCION[item.funcion] ?? item.funcion}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: color.text }}>{LABEL_INTENSIDAD[item.intensidad] ?? item.intensidad}</span>
                          </div>
                        </div>
                        <p className="text-sm text-[#374151]">{item.descripcion}</p>
                      </div>
                    )
                  })}
                  {apoyos.length > 2 && (
                    <Button variant="ghost" size="sm" className="w-full text-[#6B7280] hover:text-[#1E3A5F]" onClick={() => setShowAllApoyos(!showAllApoyos)}>
                      {showAllApoyos ? <><ChevronUp size={14} className="mr-1" /> Ver menos</> : <><ChevronDown size={14} className="mr-1" /> Ver más ({apoyos.length - 2})</>}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ============ FORTALEZAS ============ */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-[#1E3A5F] flex items-center gap-2">
                  <Star size={18} className="text-[#F59E0B]" />
                  Fortalezas
                  <span className="text-xs font-normal text-[#9CA3AF]">{editingFortalezas ? formFortalezas.length : fortalezas.length}</span>
                </CardTitle>
                {esDocente && !editingFortalezas && (
                  <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1.5" onClick={startEditFortalezas}><Pencil size={14} /> Editar</Button>
                )}
                {editingFortalezas && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-[#6B7280] gap-1" onClick={cancelEditFortalezas} disabled={saving}><X size={14} /> Cancelar</Button>
                    <Button size="sm" className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white gap-1" onClick={saveFortalezas} disabled={saving}><Check size={14} /> {saving ? "Guardando..." : "Guardar"}</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingFortalezas ? (
                <>
                  {formFortalezas.map((f, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-[#E5E7EB] space-y-2">
                      <div className="flex items-center gap-2">
                        <Select value={f.dimension} onValueChange={(val) => { const copy = [...formFortalezas]; copy[idx] = { ...copy[idx], dimension: val }; setFormFortalezas(copy) }}>
                          <SelectTrigger className="w-52 border-[#E5E7EB]"><SelectValue placeholder="Dimensión" /></SelectTrigger>
                          <SelectContent>{Object.entries(LABEL_DIMENSION).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon" className="text-[#DC2626] h-8 w-8" onClick={() => setFormFortalezas(formFortalezas.filter((_, i) => i !== idx))}><Trash2 size={16} /></Button>
                      </div>
                      <Textarea value={f.descripcion} onChange={(e) => { const copy = [...formFortalezas]; copy[idx] = { ...copy[idx], descripcion: e.target.value }; setFormFortalezas(copy) }} placeholder="Descripción de la fortaleza..." className="border-[#E5E7EB] min-h-[60px]" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-[#6B7280] border-dashed border-[#D1D5DB] gap-1.5" onClick={() => setFormFortalezas([...formFortalezas, { dimension: "", descripcion: "" }])}><Plus size={14} /> Agregar fortaleza</Button>
                </>
              ) : fortalezas.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Sin fortalezas registradas.</p>
              ) : (
                <>
                  {visibleFortalezas.map((item: FortalezaResponse) => {
                    const color = COLOR_FORTALEZA[item.dimension] ?? DEFAULT_COLOR
                    return (
                      <div key={item.id} className="p-3 rounded-lg border" style={{ backgroundColor: color.bg, borderColor: color.border }}>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="text-[10px] font-semibold shrink-0" style={{ borderColor: color.text, color: color.text, backgroundColor: "white" }}>{LABEL_DIMENSION[item.dimension] ?? item.dimension}</Badge>
                          <p className="text-sm text-[#374151]">{item.descripcion}</p>
                        </div>
                      </div>
                    )
                  })}
                  {fortalezas.length > 2 && (
                    <Button variant="ghost" size="sm" className="w-full text-[#6B7280] hover:text-[#1E3A5F]" onClick={() => setShowAllFortalezas(!showAllFortalezas)}>
                      {showAllFortalezas ? <><ChevronUp size={14} className="mr-1" /> Ver menos</> : <><ChevronDown size={14} className="mr-1" /> Ver más ({fortalezas.length - 2})</>}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
