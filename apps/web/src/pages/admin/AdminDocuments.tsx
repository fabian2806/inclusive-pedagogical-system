import { useState, useCallback } from "react"
import { Plus, Lock, FolderCog, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TipoDocumento, TipoDocumentoFormData } from "@/types/document"
import { StatsCard } from "@/components/admin/StatsCard"
import { SearchFilterBar } from "@/components/admin/SearchFilterBar"
import { DocumentsTable } from "@/components/admin/documents/DocumentsTable"
import { DocumentsFormDialog } from "@/components/admin/documents/DocumentsFormDialog"
import { tiposDocumentoService } from "@/lib/api"
import { useApiQuery } from "@/hooks/useApiQuery"
import { AxiosError } from "axios"

const emptyFormData: TipoDocumentoFormData = {
  nombre: "",
  esObligatorio: false,
  esVersionable: false,
  esPeriodico: false,
  periodicidad: "",
}

export default function AdminDocuments() {
  const fetchTipos = useCallback(() => tiposDocumentoService.listar(), [])
  const { data: tiposDocumento, isLoading, error, refetch } = useApiQuery(fetchTipos)

  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoDocumento | null>(null)
  const [formData, setFormData] = useState<TipoDocumentoFormData>(emptyFormData)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const allTipos = (tiposDocumento ?? []) as TipoDocumento[]

  // Filtrado
  const filteredTipos = allTipos.filter((tipo) => {
    const matchesSearch = tipo.nombre.toLowerCase().includes(search.toLowerCase())

    if (filterType === "predefinidos") return matchesSearch && tipo.esPredefinido
    if (filterType === "personalizados") return matchesSearch && !tipo.esPredefinido
    if (filterType === "obligatorios") return matchesSearch && tipo.esObligatorio
    if (filterType === "periodicos") return matchesSearch && tipo.esPeriodico
    return matchesSearch
  })

  const handleOpenCreate = () => {
    setEditingTipo(null)
    setFormData(emptyFormData)
    setSaveError(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (tipo: TipoDocumento) => {
    if (tipo.esPredefinido) return
    setEditingTipo(tipo)
    setFormData({
      nombre: tipo.nombre,
      esObligatorio: tipo.esObligatorio,
      esVersionable: tipo.esVersionable,
      esPeriodico: tipo.esPeriodico,
      periodicidad: tipo.periodicidad || "",
    })
    setSaveError(null)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nombre) return
    setSaving(true)
    setSaveError(null)
    try {
      const request = {
        nombre: formData.nombre,
        esObligatorio: formData.esObligatorio,
        esVersionable: formData.esVersionable,
        esPeriodico: formData.esPeriodico,
        periodicidad: formData.esPeriodico ? formData.periodicidad || undefined : undefined,
      }

      if (editingTipo) {
        await tiposDocumentoService.actualizar(editingTipo.id, request)
      } else {
        await tiposDocumentoService.crear(request)
      }

      setIsDialogOpen(false)
      setFormData(emptyFormData)
      refetch()
    } catch (err) {
      if (err instanceof AxiosError) {
        setSaveError(err.response?.data?.mensaje ?? "Error al guardar tipo de documento")
      } else {
        setSaveError("Error inesperado")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await tiposDocumentoService.eliminar(id)
      refetch()
    } catch (err) {
      console.error("Error al eliminar tipo de documento:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E3A5F]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
          <Button variant="link" onClick={refetch} className="ml-2 text-red-700 underline p-0 h-auto">
            Reintentar
          </Button>
        </div>
      </div>
    )
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
          value={allTipos.length}
          color="blue"
        />
        <StatsCard
          icon={Lock}
          title="Predefinidos"
          value={allTipos.filter((t) => t.esPredefinido).length}
          color="purple"
        />
        <StatsCard
          icon={FolderCog}
          title="Obligatorios"
          value={allTipos.filter((t) => t.esObligatorio).length}
          color="green"
        />
        <StatsCard
          icon={FolderCog}
          title="Periódicos"
          value={allTipos.filter((t) => t.esPeriodico).length}
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

      {/* Tabla */}
      <DocumentsTable
        documentos={filteredTipos}
        onEdit={handleOpenEdit}
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
              Esto garantiza la integridad del expediente del estudiante.
            </p>
          </div>
        </div>
      </div>

      {/* Diálogo */}
      <DocumentsFormDialog
        open={isDialogOpen}
        isEditing={!!editingTipo}
        formData={formData}
        onChange={setFormData}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
        onCancel={() => {
          setIsDialogOpen(false)
          setEditingTipo(null)
          setFormData(emptyFormData)
          setSaveError(null)
        }}
      />
    </div>
  )
}
