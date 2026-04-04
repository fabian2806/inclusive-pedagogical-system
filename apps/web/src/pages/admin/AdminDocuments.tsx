import { useState } from "react"
import { Plus, Lock, FolderCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import type { TipoDocumento, TipoDocumentoFormData } from "@/types/document"
import { StatsCard } from "@/components/admin/StatsCard"
import { SearchFilterBar } from "@/components/admin/SearchFilterBar"
import { DocumentsTable } from "@/components/admin/documents/DocumentsTable"
import { DocumentsFormDialog } from "@/components/admin/documents/DocumentsFormDialog"

// Tipos de documento mock
const initialTiposDocumento: TipoDocumento[] = [
  {
    id: "PEP",
    nombre: "Plan Educativo Personalizado",
    codigo: "PEP",
    descripcion: "Plan individualizado de objetivos y estrategias educativas para el estudiante",
    esObligatorio: true,
    esVersionable: true,
    esPeriodico: false,
    periodicidad: null,
    esPredefinido: true,
    activo: true,
    creadoPor: "Sistema",
    fechaCreacion: "01/01/2024",
  },
  {
    id: "IPP",
    nombre: "Informe Psicopedagógico",
    codigo: "IPP",
    descripcion: "Evaluación integral del desarrollo cognitivo, emocional y social del estudiante",
    esObligatorio: true,
    esVersionable: true,
    esPeriodico: false,
    periodicidad: null,
    esPredefinido: true,
    activo: true,
    creadoPor: "Sistema",
    fechaCreacion: "01/01/2024",
  },
  {
    id: "IB",
    nombre: "Informe Bimestral",
    codigo: "IB",
    descripcion: "Reporte periódico del progreso del estudiante en cada bimestre",
    esObligatorio: true,
    esVersionable: false,
    esPeriodico: true,
    periodicidad: "Bimestral",
    esPredefinido: true,
    activo: true,
    creadoPor: "Sistema",
    fechaCreacion: "01/01/2024",
  },
  {
    id: "IS",
    nombre: "Informe de Salida",
    codigo: "IS",
    descripcion: "Documento de cierre cuando el estudiante egresa o se traslada",
    esObligatorio: false,
    esVersionable: false,
    esPeriodico: false,
    periodicidad: null,
    esPredefinido: true,
    activo: true,
    creadoPor: "Sistema",
    fechaCreacion: "01/01/2024",
  },
  {
    id: "OTRO",
    nombre: "Otro",
    codigo: "OTRO",
    descripcion: "Documentos adicionales no categorizados",
    esObligatorio: false,
    esVersionable: false,
    esPeriodico: false,
    periodicidad: null,
    esPredefinido: true,
    activo: true,
    creadoPor: "Sistema",
    fechaCreacion: "01/01/2024",
  },
  {
    id: "CERT_MED",
    nombre: "Certificado Médico Audiológico",
    codigo: "CERT_MED",
    descripcion: "Certificado médico que acredita el diagnóstico audiológico del estudiante",
    esObligatorio: false,
    esVersionable: true,
    esPeriodico: false,
    periodicidad: null,
    esPredefinido: false,
    activo: true,
    creadoPor: "Admin Sistema",
    fechaCreacion: "15/02/2024",
  },
]

const emptyFormData: TipoDocumentoFormData = {
  nombre: "",
  codigo: "",
  descripcion: "",
  esObligatorio: false,
  esVersionable: false,
  esPeriodico: false,
  periodicidad: "",
}

export default function AdminDocuments() {
  const { user } = useAuth()
  const [tiposDocumento, setTiposDocumento] = useState(initialTiposDocumento)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoDocumento | null>(null)
  const [formData, setFormData] = useState<TipoDocumentoFormData>(emptyFormData)

  // Lógica de filtrado
  const filteredTipos = tiposDocumento.filter((tipo) => {
    const matchesSearch =
      tipo.nombre.toLowerCase().includes(search.toLowerCase()) ||
      tipo.codigo.toLowerCase().includes(search.toLowerCase())

    if (filterType === "predefinidos") return matchesSearch && tipo.esPredefinido
    if (filterType === "personalizados") return matchesSearch && !tipo.esPredefinido
    if (filterType === "obligatorios") return matchesSearch && tipo.esObligatorio
    if (filterType === "periodicos") return matchesSearch && tipo.esPeriodico
    return matchesSearch
  })

  const handleOpenCreate = () => {
    setEditingTipo(null)
    setFormData(emptyFormData)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (tipo: TipoDocumento) => {
    if (tipo.esPredefinido) return
    setEditingTipo(tipo)
    setFormData({
      nombre: tipo.nombre,
      codigo: tipo.codigo,
      descripcion: tipo.descripcion,
      esObligatorio: tipo.esObligatorio,
      esVersionable: tipo.esVersionable,
      esPeriodico: tipo.esPeriodico,
      periodicidad: tipo.periodicidad || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.nombre || !formData.codigo) return

    if (editingTipo) {
      setTiposDocumento(tiposDocumento.map((t) =>
        t.id === editingTipo.id
          ? {
              ...t,
              ...formData,
              periodicidad: formData.esPeriodico ? formData.periodicidad : null,
            }
          : t
      ))
    } else {
      const newTipo: TipoDocumento = {
        id: formData.codigo.toUpperCase().replace(/\s+/g, "_"),
        ...formData,
        periodicidad: formData.esPeriodico ? formData.periodicidad : null,
        esPredefinido: false,
        activo: true,
        creadoPor: user?.nombre || "Admin",
        fechaCreacion: new Date().toLocaleDateString("es-PE"),
      }
      setTiposDocumento([...tiposDocumento, newTipo])
    }

    setIsDialogOpen(false)
    setEditingTipo(null)
  }

  const handleDelete = (id: string) => {
    const tipo = tiposDocumento.find((t) => t.id === id)
    if (tipo?.esPredefinido) return
    setTiposDocumento(tiposDocumento.filter((t) => t.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setTiposDocumento(tiposDocumento.map((t) =>
      t.id === id ? { ...t, activo: !t.activo } : t
    ))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Tipos de Documento</h1>
          <p className="text-sm text-[#6B7280]">
            Gestiona las plantillas de documentos del sistema
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
          <Plus size={16} />
          Nuevo tipo
        </Button>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          icon={FolderCog}
          title="Total tipos"
          value={tiposDocumento.length}
          color="blue"
        />
        <StatsCard
          icon={Lock}
          title="Predefinidos"
          value={tiposDocumento.filter((t) => t.esPredefinido).length}
          color="purple"
        />
        <StatsCard
          icon={FolderCog}
          title="Obligatorios"
          value={tiposDocumento.filter((t) => t.esObligatorio).length}
          color="green"
        />
        <StatsCard
          icon={FolderCog}
          title="Periódicos"
          value={tiposDocumento.filter((t) => t.esPeriodico).length}
          color="yellow"
        />
      </div>

      {/* Filtros */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filterOptions={[
          {
            label: "Filtrar por tipo",
            value: "type",
            selectItem: "Todos",
            options: ["predefinidos", "personalizados", "obligatorios", "periodicos"],
          },
        ]}
        filterValues={{ type: filterType }}
        onFilterChange={(_filterName, value) => setFilterType(value)}
      />

      {/* Tabla de tipos de documento */}
      <DocumentsTable
        documentos={filteredTipos}
        onEdit={handleOpenEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      {/* Nota informativa */}
      <div className="p-4 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
        <div className="flex gap-3">
          <Lock size={18} className="text-[#D97706] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#92400E]">Tipos predefinidos</p>
            <p className="text-xs text-[#B45309] mt-1">
              Los tipos de documento marcados como &quot;Sistema&quot; vienen precargados y no pueden ser editados ni eliminados.
              Esto garantiza la integridad del expediente del estudiante. Solo puedes crear nuevos tipos personalizados o activar/desactivar los existentes.
            </p>
          </div>
        </div>
      </div>

      {/* Diálogo de creación/edición */}
      <DocumentsFormDialog
        open={isDialogOpen}
        isEditing={!!editingTipo}
        formData={formData}
        onChange={setFormData}
        onSave={handleSave}
        onCancel={() => {
          setIsDialogOpen(false)
          setEditingTipo(null)
          setFormData(emptyFormData)
        }}
      />
    </div>
  )
}
