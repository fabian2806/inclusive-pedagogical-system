"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Target, BookOpen, Layers, CheckCircle, XCircle } from "lucide-react"
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

// Categories for indicators
const categories = [
  "Comunicación",
  "Socialización",
  "Autonomía",
  "Cognitivo",
  "Motor",
  "Emocional",
]

// Curricular areas
const curricularAreas = [
  "Comunicación",
  "Matemática",
  "Personal Social",
  "Ciencia y Tecnología",
  "Arte y Cultura",
  "Educación Física",
  "Transversal",
]

// Mock data for indicators
const initialIndicators = [
  {
    id: "1",
    name: "Expresión de necesidades básicas en LSP",
    description: "El estudiante es capaz de comunicar sus necesidades básicas (hambre, sed, ir al baño, ayuda) utilizando lengua de señas peruana de manera clara y espontánea.",
    category: "Comunicación",
    curricularArea: "Comunicación",
    status: "active" as const,
  },
  {
    id: "2",
    name: "Participación en actividades grupales",
    description: "El estudiante participa activamente en actividades grupales, respetando turnos y colaborando con sus compañeros.",
    category: "Socialización",
    curricularArea: "Personal Social",
    status: "active" as const,
  },
  {
    id: "3",
    name: "Resolución de problemas con material concreto",
    description: "El estudiante resuelve problemas matemáticos simples utilizando material concreto como apoyo visual.",
    category: "Cognitivo",
    curricularArea: "Matemática",
    status: "active" as const,
  },
  {
    id: "4",
    name: "Autonomía en rutinas diarias",
    description: "El estudiante realiza de manera autónoma las rutinas diarias del aula: guardar materiales, prepararse para el recreo, etc.",
    category: "Autonomía",
    curricularArea: "Transversal",
    status: "active" as const,
  },
  {
    id: "5",
    name: "Identificación de emociones propias",
    description: "El estudiante identifica y nombra sus propias emociones básicas (alegría, tristeza, enojo, miedo) usando señas o imágenes.",
    category: "Emocional",
    curricularArea: "Personal Social",
    status: "inactive" as const,
  },
  {
    id: "6",
    name: "Coordinación motora fina en escritura",
    description: "El estudiante demuestra coordinación motora fina adecuada para actividades de escritura y trazado.",
    category: "Motor",
    curricularArea: "Comunicación",
    status: "active" as const,
  },
]

type Indicator = typeof initialIndicators[0]

function getCategoryColor(category: string) {
  switch (category) {
    case "Comunicación":
      return { bg: "bg-[#EEF2FF]", text: "text-[#3B82F6]", border: "border-[#3B82F6]" }
    case "Socialización":
      return { bg: "bg-[#ECFDF5]", text: "text-[#059669]", border: "border-[#059669]" }
    case "Autonomía":
      return { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", border: "border-[#D97706]" }
    case "Cognitivo":
      return { bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]", border: "border-[#7C3AED]" }
    case "Motor":
      return { bg: "bg-[#FDF2F8]", text: "text-[#DB2777]", border: "border-[#DB2777]" }
    case "Emocional":
      return { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", border: "border-[#DC2626]" }
    default:
      return { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", border: "border-[#6B7280]" }
  }
}

export default function Indicators() {
  const [indicators, setIndicators] = useState<Indicator[]>(initialIndicators)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    curricularArea: "",
    status: "active" as "active" | "inactive",
  })

  const filteredIndicators = indicators.filter((indicator) => {
    const matchesSearch =
      indicator.name.toLowerCase().includes(search.toLowerCase()) ||
      indicator.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || indicator.category === categoryFilter
    const matchesArea = areaFilter === "all" || indicator.curricularArea === areaFilter
    const matchesStatus = statusFilter === "all" || indicator.status === statusFilter
    return matchesSearch && matchesCategory && matchesArea && matchesStatus
  })

  const handleOpenCreate = () => {
    setEditingIndicator(null)
    setFormData({
      name: "",
      description: "",
      category: "",
      curricularArea: "",
      status: "active",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator)
    setFormData({
      name: indicator.name,
      description: indicator.description,
      category: indicator.category,
      curricularArea: indicator.curricularArea,
      status: indicator.status,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingIndicator) {
      setIndicators(
        indicators.map((i) =>
          i.id === editingIndicator.id ? { ...i, ...formData } : i
        )
      )
    } else {
      const newIndicator: Indicator = {
        id: String(Date.now()),
        ...formData,
      }
      setIndicators([...indicators, newIndicator])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setIndicators(indicators.filter((i) => i.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setIndicators(
      indicators.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "active" ? "inactive" : "active" }
          : i
      )
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#EEF2FF]">
                <Target size={20} className="text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{indicators.length}</p>
                <p className="text-xs text-[#6B7280]">Total indicadores</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#059669]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                {indicators.filter((i) => i.status === "active").length} activos
              </span>
              <span className="flex items-center gap-1 text-[#6B7280]">
                <span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
                {indicators.filter((i) => i.status === "inactive").length} inactivos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#F3E8FF]">
                <Layers size={20} className="text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{new Set(indicators.map((i) => i.category)).size}</p>
                <p className="text-xs text-[#6B7280]">Categorías</p>
              </div>
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
                <p className="text-2xl font-bold text-[#1E3A5F]">{new Set(indicators.map((i) => i.curricularArea)).size}</p>
                <p className="text-xs text-[#6B7280]">Áreas curriculares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FEF3C7]">
                <CheckCircle size={20} className="text-[#D97706]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">
                  {Math.round((indicators.filter((i) => i.status === "active").length / indicators.length) * 100)}%
                </p>
                <p className="text-xs text-[#6B7280]">Tasa de activos</p>
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
                placeholder="Buscar por nombre o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-[#E5E7EB]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-45 border-[#E5E7EB]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full sm:w-45 border-[#E5E7EB]">
                <SelectValue placeholder="Área curricular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {curricularAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <TableHead className="text-xs font-semibold text-[#6B7280] w-[30%]">Indicador</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Categoría</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Área curricular</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280]">Estado</TableHead>
                <TableHead className="text-xs font-semibold text-[#6B7280] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIndicators.map((indicator) => {
                const categoryColor = getCategoryColor(indicator.category)
                return (
                  <TableRow key={indicator.id} className="hover:bg-[#F9FAFB]">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[#1E3A5F]">{indicator.name}</p>
                        <p className="text-xs text-[#6B7280] line-clamp-2 mt-0.5">{indicator.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
                      >
                        {indicator.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[#374151]">{indicator.curricularArea}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          indicator.status === "active"
                            ? "bg-[#D1FAE5] text-[#059669] border-[#059669]"
                            : "bg-[#F3F4F6] text-[#6B7280] border-[#9CA3AF]"
                        }`}
                      >
                        {indicator.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={16} className="text-[#6B7280]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(indicator)}>
                            <Edit size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(indicator.id)}>
                            {indicator.status === "active" ? (
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
                          <DropdownMenuItem
                            onClick={() => handleDelete(indicator.id)}
                            className="text-[#DC2626] focus:text-[#DC2626]"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-137.5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">
              {editingIndicator ? "Editar indicador" : "Nuevo indicador"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-[#374151]">Nombre del indicador</Label>
              <Input
                id="name"
                placeholder="Ej: Expresión de necesidades básicas en LSP"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-[#E5E7EB]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm text-[#374151]">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe qué evalúa este indicador y cómo se evidencia..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-[#E5E7EB] resize-none h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-[#374151]">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-[#374151]">Área curricular</Label>
                <Select
                  value={formData.curricularArea}
                  onValueChange={(value) => setFormData({ ...formData, curricularArea: value })}
                >
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {curricularAreas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-[#374151]">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#E5E7EB] text-[#374151]"
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
                onClick={handleSave}
                disabled={!formData.name || !formData.category || !formData.curricularArea}
              >
                {editingIndicator ? "Guardar cambios" : "Crear indicador"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
