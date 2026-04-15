import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { StudentCard } from "@/components/StudentCard"

// Mock data
const students = [
  {
    id: "1",
    name: "Sofía Rodríguez Pérez",
    grade: "3° Primaria",
    age: 8,
    status: "activo",
    priority: false,
    lastUpdate: "Hace 2 horas",
    entries: 24,
    initials: "SR",
    hearingLevel: "Hipoacusia severa bilateral",
  },
  {
    id: "2",
    name: "Carlos Mendoza Ruiz",
    grade: "4° Primaria",
    age: 9,
    status: "activo",
    priority: true,
    lastUpdate: "Hace 1 día",
    entries: 31,
    initials: "CM",
    hearingLevel: "Hipoacusia profunda",
  },
  {
    id: "3",
    name: "Ana García Torres",
    grade: "2° Primaria",
    age: 7,
    status: "activo",
    priority: false,
    lastUpdate: "Hace 3 días",
    entries: 18,
    initials: "AG",
    hearingLevel: "Hipoacusia moderada",
  },
  {
    id: "4",
    name: "Luis Fernández Díaz",
    grade: "5° Primaria",
    age: 10,
    status: "activo",
    priority: false,
    lastUpdate: "Hace 4 días",
    entries: 42,
    initials: "LF",
    hearingLevel: "Hipoacusia severa unilateral",
  },
  {
    id: "5",
    name: "María López Sánchez",
    grade: "3° Primaria",
    age: 8,
    status: "inactivo",
    priority: false,
    lastUpdate: "Hace 2 semanas",
    entries: 15,
    initials: "ML",
    hearingLevel: "Hipoacusia profunda bilateral",
  },
  {
    id: "6",
    name: "Pedro Ramírez Vega",
    grade: "1° Primaria",
    age: 6,
    status: "activo",
    priority: true,
    lastUpdate: "Hace 5 horas",
    entries: 8,
    initials: "PR",
    hearingLevel: "Hipoacusia severa",
  },
]

//TODO: Reemplazar el mock por datos de la API
//TODO: Agregar renderizado condicional para los roles restantes (SAANEE y Padre)

export default function Students() {
  const [search, setSearch] = useState("")
  const [filterGrade, setFilterGrade] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase())
    const matchesGrade = filterGrade === "all" || student.grade === filterGrade
    const matchesStatus = filterStatus === "all" || student.status === filterStatus
    return matchesSearch && matchesGrade && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Estudiantes</h1>
          <p className="text-sm text-[#6B7280]">
            Gestiona los expedientes de tus estudiantes asignados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-[#E5E7EB] focus-visible:ring-[#3B82F6]"
          />
        </div>
        <Select value={filterGrade} onValueChange={setFilterGrade}>
          <SelectTrigger className="w-40 bg-white border-[#E5E7EB]">
            <SelectValue placeholder="Grado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grados</SelectItem>
            <SelectItem value="1° Primaria">1° Primaria</SelectItem>
            <SelectItem value="2° Primaria">2° Primaria</SelectItem>
            <SelectItem value="3° Primaria">3° Primaria</SelectItem>
            <SelectItem value="4° Primaria">4° Primaria</SelectItem>
            <SelectItem value="5° Primaria">5° Primaria</SelectItem>
            <SelectItem value="6° Primaria">6° Primaria</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-35 bg-white border-[#E5E7EB]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conteo de resultados */}
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <Filter size={14} />
        <span>{filteredStudents.length} estudiantes encontrados</span>
      </div>

      {/* Grilla del Card de Estudiantes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <StudentCard key={student.id} {...student} />
        ))}
      </div>
    </div>
  )
}
