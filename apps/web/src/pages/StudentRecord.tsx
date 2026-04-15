"use client"

import { useState } from "react"
import { ArrowLeft, User, Calendar, FileText, Upload, Plus, MessageSquare, Paperclip,
  Clock, Phone, Mail, Heart, FolderOpen, Download, Eye, History, CheckCircle,
  AlertCircle, FileCheck} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"

// Mock student data
const student = {
  id: "1",
  name: "Sofía Rodríguez Pérez",
  grade: "3° Primaria",
  age: 8,
  birthDate: "15/03/2017",
  status: "activo",
  priority: false,
  initials: "SR",
  hearingLevel: "Hipoacusia severa bilateral",
  hearingAid: "Audífono bilateral",
  communicationMethod: "Lengua de Señas Peruana (LSP) + lectura labial",
  school: "IE San Miguel",
  teacher: "Prof. María Castro",
  saanee: "Esp. Roberto Quispe",
}

const familyContacts = [
  {
    name: "Elena Pérez de Rodríguez",
    relation: "Madre",
    phone: "+51 999 888 777",
    email: "elena.perez@email.com",
    primary: true,
  },
  {
    name: "Juan Rodríguez Torres",
    relation: "Padre",
    phone: "+51 999 777 666",
    email: "juan.rodriguez@email.com",
    primary: false,
  },
]

const bitacoraEntries = [
  {
    id: "1",
    date: "22 Mar 2025",
    time: "10:30 AM",
    author: "Prof. María Castro",
    role: "Docente",
    type: "observacion_pe",
    title: "Avance en lectoescritura",
    content:
      "Sofía mostró mejora significativa en la identificación de palabras nuevas. Logró leer correctamente 8 de 10 palabras del ejercicio. Se recomienda continuar con ejercicios de reconocimiento visual.",
    attachments: [],
  },
  {
    id: "2",
    date: "21 Mar 2025",
    time: "2:00 PM",
    author: "Prof. María Castro",
    role: "Docente",
    type: "apoyo_ajuste",
    title: "Ajuste de ubicación en el aula",
    content:
      "Se reubicó a Sofía en la primera fila, cerca de la ventana para mejor iluminación. Se implementó el uso de tarjetas visuales para instrucciones. Mejora notoria en la atención durante clase.",
    attachments: [],
  },
  {
    id: "3",
    date: "20 Mar 2025",
    time: "3:15 PM",
    author: "Esp. Roberto Quispe",
    role: "SAANEE",
    type: "evaluacion_indicador",
    title: "Evaluación de indicador: Comunicación expresiva",
    content:
      "Se evaluó el indicador COM-03: Expresión de necesidades básicas en LSP. Resultado: Logrado (85%). Sofía demuestra dominio de 45 señas nuevas este mes. Área de oportunidad: expresión de emociones complejas.",
    attachments: [{ name: "Evaluacion_COM03_Marzo.pdf", size: "245 KB" }],
  },
  {
    id: "4",
    date: "18 Mar 2025",
    time: "9:00 AM",
    author: "Sistema",
    role: "Sistema",
    type: "evento_agenda",
    title: "Reunión trimestral con familia",
    content:
      "Evento programado completado. Asistentes: Elena Pérez (madre), Juan Rodríguez (padre), Prof. María Castro, Esp. Roberto Quispe. Se compartieron avances del trimestre y se establecieron metas.",
    attachments: [{ name: "Acta_Reunion_18Mar.pdf", size: "120 KB" }],
  },
  {
    id: "5",
    date: "15 Mar 2025",
    time: "11:30 AM",
    author: "Prof. María Castro",
    role: "Docente",
    type: "documento",
    title: "Informe de progreso mensual adjuntado",
    content:
      "Se adjunta el informe de progreso del mes de febrero 2025. Incluye evaluación de áreas: comunicación, matemáticas, socialización y autonomía.",
    attachments: [
      { name: "Informe_Progreso_Feb2025.pdf", size: "380 KB" },
      { name: "Anexo_Evidencias.pdf", size: "1.2 MB" },
    ],
  },
  {
    id: "6",
    date: "12 Mar 2025",
    time: "4:00 PM",
    author: "Esp. Roberto Quispe",
    role: "SAANEE",
    type: "feedback_saanee",
    title: "Retroalimentación sobre estrategias de aula",
    content:
      "Excelente trabajo con las adaptaciones visuales implementadas. Recomiendo incorporar pausas activas con señas cada 20 minutos. Adjunto guía de actividades kinestésicas para complementar.",
    attachments: [{ name: "Guia_Actividades_Kinestesicas.pdf", size: "290 KB" }],
    replies: [
      {
        author: "Prof. María Castro",
        role: "Docente",
        date: "13 Mar 2025",
        time: "8:30 AM",
        content:
          "Gracias por la retroalimentación. Implementaré las pausas activas a partir de hoy. ¿Podríamos coordinar una observación de aula la próxima semana?",
        attachments: [],
      },
    ],
  },
  {
    id: "7",
    date: "10 Mar 2025",
    time: "6:45 PM",
    author: "Elena Pérez",
    role: "Familia",
    type: "comunicacion_familiar",
    title: "Consulta sobre tarea de comunicación",
    content:
      "Buenas tardes, Sofía tuvo dificultad con la tarea de lectura de labios. En casa practicamos pero quisiera saber si hay algún material adicional que podamos usar. Gracias.",
    attachments: [],
    replies: [
      {
        author: "Prof. María Castro",
        role: "Docente",
        date: "11 Mar 2025",
        time: "9:00 AM",
        content:
          "Estimada Elena, le comparto un video tutorial con ejercicios de lectura labial. Puede practicar 10 minutos diarios. Sofía responde muy bien cuando se combina con señas.",
        attachments: [{ name: "Tutorial_Lectura_Labial.mp4", size: "45 MB" }],
      },
    ],
  },
  {
    id: "8",
    date: "8 Mar 2025",
    time: "11:20 AM",
    author: "Prof. María Castro",
    role: "Docente",
    type: "incidencia",
    title: "Dificultad de comunicación en actividad grupal",
    content:
      "Durante la actividad grupal de ciencias, Sofía tuvo dificultad para seguir las instrucciones debido a que sus compañeros hablaban simultáneamente. Se generó frustración momentánea. Se intervino reubicando al grupo y usando señas de apoyo. Se recomienda reforzar protocolo de turnos de habla con el grupo.",
    attachments: [],
  },
]

const upcomingEvents = [
  {
    id: "1",
    title: "Evaluación trimestral",
    date: "28 Mar 2025",
    time: "2:00 PM",
    type: "evaluacion",
  },
  {
    id: "2",
    title: "Sesión SAANEE",
    date: "1 Abr 2025",
    time: "10:00 AM",
    type: "saanee",
  },
]

// Tipos de documentos (configurados por admin)
const tiposDocumento = [
  { id: "PEP", nombre: "Plan Educativo Personalizado", esObligatorio: true, esVersionable: true, esPeriodico: false },
  { id: "IPP", nombre: "Informe Psicopedagógico", esObligatorio: true, esVersionable: true, esPeriodico: false },
  { id: "IB", nombre: "Informe Bimestral", esObligatorio: true, esVersionable: false, esPeriodico: true, periodicidad: "Bimestral" },
  { id: "IS", nombre: "Informe de Salida", esObligatorio: false, esVersionable: false, esPeriodico: false },
  { id: "OTRO", nombre: "Otro", esObligatorio: false, esVersionable: false, esPeriodico: false },
]

// Documentos del expediente (instancias concretas)
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
    archivo: {
      nombreOriginal: "PEP_Sofia_Rodriguez_2025_v2.pdf",
      mimeType: "application/pdf",
      tamano: "1.2 MB",
      url: "#",
    },
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
    archivo: {
      nombreOriginal: "IPP_Sofia_Rodriguez_Inicial.pdf",
      mimeType: "application/pdf",
      tamano: "2.8 MB",
      url: "#",
    },
    versiones: [
      { version: 1, fecha: "22/03/2023", usuario: "Esp. Roberto Quispe", archivo: "IPP_Sofia_Rodriguez_Inicial.pdf" },
    ],
  },
  {
    id: "3",
    tipoDocumentoId: "IB",
    titulo: "Informe Bimestral - I Bimestre 2025",
    periodo: "I Bimestre 2025",
    version: null,
    estado: "vigente",
    fechaEmision: "28/02/2025",
    fechaSubida: "01/03/2025",
    usuarioSubido: "Prof. María Castro",
    archivo: {
      nombreOriginal: "IB_Sofia_Rodriguez_I_Bim_2025.pdf",
      mimeType: "application/pdf",
      tamano: "856 KB",
      url: "#",
    },
    versiones: [],
  },
  {
    id: "4",
    tipoDocumentoId: "IB",
    titulo: "Informe Bimestral - IV Bimestre 2024",
    periodo: "IV Bimestre 2024",
    version: null,
    estado: "archivado",
    fechaEmision: "15/12/2024",
    fechaSubida: "16/12/2024",
    usuarioSubido: "Prof. María Castro",
    archivo: {
      nombreOriginal: "IB_Sofia_Rodriguez_IV_Bim_2024.pdf",
      mimeType: "application/pdf",
      tamano: "920 KB",
      url: "#",
    },
    versiones: [],
  },
  {
    id: "5",
    tipoDocumentoId: "OTRO",
    titulo: "Constancia de Matrícula 2025",
    version: null,
    estado: "vigente",
    fechaEmision: "05/01/2025",
    fechaSubida: "05/01/2025",
    usuarioSubido: "Admin Sistema",
    archivo: {
      nombreOriginal: "Constancia_Matricula_2025.pdf",
      mimeType: "application/pdf",
      tamano: "125 KB",
      url: "#",
    },
    versiones: [],
  },
]

// Helper para obtener el tipo de documento
function getTipoDocumento(tipoId: string) {
  return tiposDocumento.find(t => t.id === tipoId) || tiposDocumento[4]
}

// Helper para colores por tipo de documento
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

function getEntryTypeColor(type: string) {
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

function getRoleColor(role: string) {
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

export default function StudentRecord() {
  const [newEntry, setNewEntry] = useState("")
  const [activeMainTab, setActiveMainTab] = useState<"bitacora" | "documentos">("bitacora")
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null)

  return (
    <div className="p-6 space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/estudiantes">
          <Button variant="ghost" size="icon" className="text-[#6B7280] hover:text-[#1E3A5F]">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E3A5F]">{student.name}</h1>
            <Badge
              variant="outline"
              className="text-xs border-[#10B981] text-[#059669] bg-[#D1FAE5]"
            >
              Activo
            </Badge>
          </div>
          <p className="text-sm text-[#6B7280]">
            {student.grade} · {student.school}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/estudiantes/${student.id}/perfil`}>
            <Button variant="ghost" className="gap-2 text-[#6B7280] hover:text-[#1E3A5F]">
              <User size={16} />
              Ver perfil
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 border-[#E5E7EB] text-[#374151]">
            <Calendar size={16} />
            Programar evento
          </Button>
          <Button className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
            <Plus size={16} />
            Nueva entrada
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="space-y-4">
          {/* Profile Card */}
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[#EEF2FF] text-[#3B82F6] text-xl font-semibold">
                    {student.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#1E3A5F]">{student.name}</p>
                  <p className="text-sm text-[#6B7280]">{student.age} años · {student.birthDate}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
                    Nivel auditivo
                  </p>
                  <p className="text-sm text-[#374151]">{student.hearingLevel}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
                    Dispositivo
                  </p>
                  <p className="text-sm text-[#374151]">{student.hearingAid}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
                    Comunicación
                  </p>
                  <p className="text-sm text-[#374151]">{student.communicationMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Card */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#1E3A5F] flex items-center gap-2">
                <User size={16} className="text-[#3B82F6]" />
                Equipo asignado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">MC</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#374151]">{student.teacher}</p>
                  <p className="text-xs text-[#6B7280]">Docente</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">RQ</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#374151]">{student.saanee}</p>
                  <p className="text-xs text-[#6B7280]">Especialista SAANEE</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Contacts */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#1E3A5F] flex items-center gap-2">
                <Heart size={16} className="text-[#EF4444]" />
                Contactos familiares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {familyContacts.map((contact, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#374151]">{contact.name}</p>
                    {contact.primary && (
                      <Badge variant="outline" className="text-[10px] border-[#3B82F6] text-[#3B82F6]">
                        Principal
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280]">{contact.relation}</p>
                  <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Phone size={12} />
                      {contact.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Mail size={12} />
                    {contact.email}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#1E3A5F] flex items-center gap-2">
                <Calendar size={16} className="text-[#F59E0B]" />
                Próximos eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-[#F9FAFB]">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      event.type === "evaluacion" ? "bg-[#8B5CF6]" : "bg-[#10B981]"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#374151]">{event.title}</p>
                    <p className="text-xs text-[#6B7280]">
                      {event.date} · {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#1E3A5F] flex items-center gap-2">
                  <FileText size={20} className="text-[#3B82F6]" />
                  Bitácora del expediente
                </CardTitle>
                <Tabs defaultValue="all" className="w-auto">
                  <TabsList className="bg-[#F3F4F6] h-8">
                    <TabsTrigger value="all" className="text-xs h-6 px-3">Todas</TabsTrigger>
                    <TabsTrigger value="observacion_pe" className="text-xs h-6 px-3">Observaciones</TabsTrigger>
                    <TabsTrigger value="evaluacion_indicador" className="text-xs h-6 px-3">Evaluaciones</TabsTrigger>
                    <TabsTrigger value="feedback_saanee" className="text-xs h-6 px-3">SAANEE</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {/* New Entry Form */}
              <div className="mb-6 p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <Textarea
                  placeholder="Escribe una nueva entrada en la bitácora..."
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="mb-3 bg-white border-[#E5E7EB] min-h-20 resize-none"
                />
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-[#6B7280] gap-2">
                    <Upload size={14} />
                    Adjuntar archivo
                  </Button>
                  <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2">
                    <MessageSquare size={14} />
                    Publicar entrada
                  </Button>
                </div>
              </div>

              {/* Entries Timeline */}
              <div className="space-y-4">
                {bitacoraEntries.map((entry, index) => {
                  const typeStyle = getEntryTypeColor(entry.type)
                  const roleColor = getRoleColor(entry.role)

                  return (
                    <div key={entry.id} className="relative">
                      {/* Timeline connector */}
                      {index < bitacoraEntries.length - 1 && (
                        <div className="absolute left-4 top-12 bottom-0 w-px bg-[#E5E7EB]" />
                      )}

                      <div className="flex gap-4">
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-full ${roleColor} flex items-center justify-center shrink-0 z-10`}
                        >
                          <span className="text-xs text-white font-semibold">
                            {entry.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <div className={`p-4 rounded-lg border-l-4 border ${typeStyle.border} ${typeStyle.bg} bg-opacity-30`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-[#1E3A5F]">
                                    {entry.title}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${typeStyle.bg} ${typeStyle.text} border-transparent`}
                                  >
                                    {typeStyle.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                                  <span className="font-medium">{entry.author}</span>
                                  <span>·</span>
                                  <span>{entry.role}</span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {entry.date}, {entry.time}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="text-sm text-[#374151] leading-relaxed mb-3">
                              {entry.content}
                            </p>

                            {/* Attachments */}
                            {entry.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {entry.attachments.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F3F4F6] text-xs text-[#374151]"
                                  >
                                    <Paperclip size={12} className="text-[#6B7280]" />
                                    <span>{file.name}</span>
                                    <span className="text-[#9CA3AF]">({file.size})</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Replies */}
                            {entry.replies && entry.replies.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-[#E5E7EB] space-y-3">
                                {entry.replies.map((reply, replyIdx) => (
                                  <div key={replyIdx} className="pl-4 border-l-2 border-[#3B82F6]">
                                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-1">
                                      <span className="font-medium text-[#374151]">
                                        {reply.author}
                                      </span>
                                      <span>·</span>
                                      <span>{reply.role}</span>
                                      <span>·</span>
                                      <span>
                                        {reply.date}, {reply.time}
                                      </span>
                                    </div>
                                    <p className="text-sm text-[#374151]">{reply.content}</p>
                                    {reply.attachments && reply.attachments.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {reply.attachments.map((file, fIdx) => (
                                          <div
                                            key={fIdx}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F3F4F6] text-xs text-[#374151]"
                                          >
                                            <Paperclip size={12} className="text-[#6B7280]" />
                                            <span>{file.name}</span>
                                            <span className="text-[#9CA3AF]">({file.size})</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-xs text-[#6B7280] hover:text-[#3B82F6] gap-1 -ml-2"
                            >
                              <MessageSquare size={12} />
                              Responder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

          {/* Documentos Tab Content */}
          {activeMainTab === "documentos" && (
          <Card className="border-[#E5E7EB]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#1E3A5F] flex items-center gap-2">
                  <FolderOpen size={20} className="text-[#3B82F6]" />
                  Documentos de Seguimiento
                </CardTitle>
                <Button className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white" size="sm">
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
                    {documentosExpediente.filter(d => d.estado === "vigente").length}
                  </p>
                  <p className="text-xs text-[#6B7280]">Vigentes</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-center">
                  <p className="text-2xl font-bold text-[#1E3A5F]">{documentosExpediente.length}</p>
                  <p className="text-xs text-[#6B7280]">Total</p>
                </div>
                <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-center">
                  <p className="text-2xl font-bold text-[#059669]">
                    {tiposDocumento.filter(t => t.esObligatorio).length}
                  </p>
                  <p className="text-xs text-[#059669]">Obligatorios</p>
                </div>
                <div className="p-3 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] text-center">
                  <p className="text-2xl font-bold text-[#4F46E5]">
                    {documentosExpediente.filter(d => (d.version || 0) > 1).length}
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
                  {tiposDocumento.filter(t => t.esObligatorio).map((tipo) => {
                    const hasDoc = documentosExpediente.some(
                      d => d.tipoDocumentoId === tipo.id && d.estado === "vigente"
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
        )}
        </div>
      </div>
    </div>
  )
}
