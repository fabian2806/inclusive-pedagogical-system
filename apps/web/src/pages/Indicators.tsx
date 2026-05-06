import { useCallback, useState } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Target,
  BookOpen,
  CheckCircle,
  XCircle,
  User,
  Loader2,
} from "lucide-react"
import { AxiosError } from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { useApiQuery } from "@/hooks/useApiQuery"
import { indicadoresService } from "@/lib/api"
import type {
  AreaCurricular,
  IndicadorCreateRequest,
  IndicadorResponse,
} from "@/types/api"

const AREA_OPTIONS: { value: AreaCurricular; label: string }[] = [
  { value: "COMUNICACION", label: "Comunicación" },
  { value: "MATEMATICA", label: "Matemática" },
  { value: "ED_FISICA", label: "Ed. Física" },
  { value: "PERSONAL_SOCIAL", label: "Personal Social" },
  { value: "OTRO", label: "Otro" },
]

function getAreaLabel(area: AreaCurricular): string {
  return AREA_OPTIONS.find((a) => a.value === area)?.label ?? area
}

function getAreaColor(area: AreaCurricular) {
  switch (area) {
    case "COMUNICACION":
      return { bg: "bg-[#EEF2FF]", text: "text-[#3B82F6]", border: "border-[#3B82F6]" }
    case "MATEMATICA":
      return { bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]", border: "border-[#7C3AED]" }
    case "ED_FISICA":
      return { bg: "bg-[#ECFDF5]", text: "text-[#059669]", border: "border-[#059669]" }
    case "PERSONAL_SOCIAL":
      return { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", border: "border-[#D97706]" }
    case "OTRO":
    default:
      return { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", border: "border-[#6B7280]" }
  }
}

interface IndicadorFormData {
  nombre: string
  descripcion: string
  categoria: string
  areaCurricular: AreaCurricular | ""
}

const emptyFormData: IndicadorFormData = {
  nombre: "",
  descripcion: "",
  categoria: "",
  areaCurricular: "",
}

export default function Indicators() {
  const { user } = useAuth()

  const fetchIndicadores = useCallback(() => indicadoresService.listar(), [])
  const { data: indicadores, isLoading, error, refetch } = useApiQuery(fetchIndicadores)

  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<"all" | AreaCurricular>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<IndicadorResponse | null>(null)
  const [formData, setFormData] = useState<IndicadorFormData>(emptyFormData)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const all = indicadores ?? []

  const filtered = all.filter((indicador) => {
    const term = search.toLowerCase()
    const matchesSearch =
      !term ||
      indicador.nombre.toLowerCase().includes(term) ||
      (indicador.descripcion?.toLowerCase().includes(term) ?? false) ||
      (indicador.categoria?.toLowerCase().includes(term) ?? false)
    const matchesArea = areaFilter === "all" || indicador.areaCurricular === areaFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && indicador.activo) ||
      (statusFilter === "inactive" && !indicador.activo)
    return matchesSearch && matchesArea && matchesStatus
  })

  const totalActivos = all.filter((i) => i.activo).length
  const totalInactivos = all.length - totalActivos
  const areasCubiertas = new Set(all.map((i) => i.areaCurricular)).size
  const misIndicadores = user ? all.filter((i) => i.usuarioCreador.id === user.id).length : 0

  const isOwner = (indicador: IndicadorResponse): boolean =>
    !!user && indicador.usuarioCreador.id === user.id

  const handleOpenCreate = () => {
    setEditing(null)
    setFormData(emptyFormData)
    setSaveError(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (indicador: IndicadorResponse) => {
    if (!isOwner(indicador)) return
    setEditing(indicador)
    setFormData({
      nombre: indicador.nombre,
      descripcion: indicador.descripcion ?? "",
      categoria: indicador.categoria ?? "",
      areaCurricular: indicador.areaCurricular,
    })
    setSaveError(null)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.areaCurricular) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload: IndicadorCreateRequest = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        categoria: formData.categoria.trim() || null,
        areaCurricular: formData.areaCurricular,
      }
      if (editing) {
        await indicadoresService.actualizar(editing.id, payload)
      } else {
        await indicadoresService.crear(payload)
      }
      setIsDialogOpen(false)
      setEditing(null)
      setFormData(emptyFormData)
      refetch()
    } catch (err) {
      if (err instanceof AxiosError) {
        setSaveError(err.response?.data?.mensaje ?? "Error al guardar el indicador")
      } else {
        setSaveError("Error inesperado")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (indicador: IndicadorResponse) => {
    if (!isOwner(indicador)) return
    try {
      if (indicador.activo) {
        await indicadoresService.desactivar(indicador.id)
      } else {
        await indicadoresService.activar(indicador.id)
      }
      refetch()
    } catch (err) {
      console.error("Error al cambiar estado del indicador:", err)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Indicadores</h1>
          <p className="text-sm text-[#6B7280]">
            Gestiona los indicadores de evaluación para el seguimiento de estudiantes
          </p>
        </div>
        <Button
          className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          Nuevo indicador
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#EEF2FF]">
                <Target size={20} className="text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{all.length}</p>
                <p className="text-xs text-[#6B7280]">Total indicadores</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#059669]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                {totalActivos} activos
              </span>
              <span className="flex items-center gap-1 text-[#6B7280]">
                <span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
                {totalInactivos} inactivos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#ECFDF5]">
                <BookOpen size={20} className="text-[#059669]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{areasCubiertas}</p>
                <p className="text-xs text-[#6B7280]">Áreas curriculares cubiertas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FEF3C7]">
                <User size={20} className="text-[#D97706]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{misIndicadores}</p>
                <p className="text-xs text-[#6B7280]">Creados por mí</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <Input
                placeholder="Buscar por nombre, descripción o categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-[#E5E7EB]"
              />
            </div>
            <Select
              value={areaFilter}
              onValueChange={(value) => setAreaFilter(value as "all" | AreaCurricular)}
            >
              <SelectTrigger className="w-full sm:w-50 border-[#E5E7EB]">
                <SelectValue placeholder="Área curricular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {AREA_OPTIONS.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="w-full sm:w-32.5 border-[#E5E7EB]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                <TableHead className="text-xs font-semibold text-[#6B7280] w-[35%]">Indicador</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Área curricular</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Categoría</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Creador</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Estado</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-[#6B7280] py-8">
                    No se encontraron indicadores con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((indicador) => {
                  const areaColor = getAreaColor(indicador.areaCurricular)
                  const owner = isOwner(indicador)
                  return (
                    <TableRow key={indicador.id} className="hover:bg-[#F9FAFB]">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-[#1E3A5F]">{indicador.nombre}</p>
                          {indicador.descripcion && (
                            <p className="text-xs text-[#6B7280] line-clamp-2 mt-0.5">
                              {indicador.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${areaColor.bg} ${areaColor.text} ${areaColor.border}`}
                        >
                          {getAreaLabel(indicador.areaCurricular)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-[#374151]">
                          {indicador.categoria ?? <span className="text-[#9CA3AF]">—</span>}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-[#374151]">
                          {indicador.usuarioCreador.nombre} {indicador.usuarioCreador.apellido}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            indicador.activo
                              ? "bg-[#D1FAE5] text-[#059669] border-[#059669]"
                              : "bg-[#F3F4F6] text-[#6B7280] border-[#9CA3AF]"
                          }`}
                        >
                          {indicador.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {owner ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} className="text-[#6B7280]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(indicador)}>
                                <Edit size={14} className="mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(indicador)}>
                                {indicador.activo ? (
                                  <>
                                    <XCircle size={14} className="mr-2" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={14} className="mr-2" />
                                    Activar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-[#9CA3AF] italic">solo lectura</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-137.5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">
              {editing ? "Editar indicador" : "Nuevo indicador"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-sm text-[#374151]">Nombre del indicador *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Expresión de necesidades básicas en LSP"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="border-[#E5E7EB]"
                maxLength={150}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-sm text-[#374151]">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe qué evalúa este indicador y cómo se evidencia..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="border-[#E5E7EB] resize-none h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="categoria" className="text-sm text-[#374151]">Categoría</Label>
                <Input
                  id="categoria"
                  placeholder="Ej: Comunicación, Autonomía..."
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="border-[#E5E7EB]"
                  maxLength={50}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-[#374151]">Área curricular *</Label>
                <Select
                  value={formData.areaCurricular}
                  onValueChange={(value) =>
                    setFormData({ ...formData, areaCurricular: value as AreaCurricular })
                  }
                >
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {saveError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#E5E7EB] text-[#374151]"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
                onClick={handleSave}
                disabled={!formData.nombre.trim() || !formData.areaCurricular || saving}
              >
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear indicador"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
