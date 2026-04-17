import { useCallback, useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentCard } from "@/components/StudentCard"
import { useApiQuery } from "@/hooks/useApiQuery"
import { alumnosService } from "@/lib/api/alumnosService"

export default function Students() {
  const [search, setSearch] = useState("")
  const [filterGrade, setFilterGrade] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const fetchAlumnos = useCallback(() => alumnosService.listar(), [])
  const { data: alumnos, isLoading, error } = useApiQuery(fetchAlumnos)

  const filteredStudents = (alumnos ?? []).filter((alumno) => {
    const fullName = `${alumno.nombre} ${alumno.apellido}`.toLowerCase()
    const matchesSearch = fullName.includes(search.toLowerCase())
    const matchesGrade = filterGrade === "all" || alumno.grado === filterGrade
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "activo" && alumno.estado === "ACTIVO") ||
      (filterStatus === "inactivo" && alumno.estado === "INACTIVO")
    return matchesSearch && matchesGrade && matchesStatus
  })

  const grados = [...new Set((alumnos ?? []).map((a) => a.grado))].sort()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-[#6B7280]">Cargando estudiantes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-[#DC2626]">{error}</p>
      </div>
    )
  }

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
            {grados.map((grado) => (
              <SelectItem key={grado} value={grado}>{grado}</SelectItem>
            ))}
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

      {/* Grilla de Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((alumno) => (
          <StudentCard key={alumno.id} alumno={alumno} />
        ))}
      </div>
    </div>
  )
}
