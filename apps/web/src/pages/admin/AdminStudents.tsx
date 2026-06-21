import { Button } from "@/components/ui/button"
import { GraduationCap, Plus, UserCheck, Users, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"
import type { Student, StudentFormData } from '@/types/student'
import type { UsuarioSimpleResponse } from '@/types/api'
import { StatsCard } from "@/components/admin/StatsCard"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { SearchFilterBar } from "@/components/admin/SearchFilterBar"
import { StudentsTable } from "@/components/admin/students/StudentsTable"
import { StudentFormDialog } from "@/components/admin/students/StudentsFormDialog"
import { alumnosService, usuariosService } from "@/lib/api"
import { useApiQuery } from "@/hooks/useApiQuery"
import { AxiosError } from "axios"

const grades = ["1° Primaria", "2° Primaria", "3° Primaria", "4° Primaria", "5° Primaria", "6° Primaria"]
const sections = ["A", "B", "C"]

const emptyStudent: StudentFormData = {
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    grado: "",
    seccion: "",
    docenteId: "",
    padreId: "",
}

export function AdminStudents() {

    const fetchAlumnos = useCallback(() => alumnosService.listar(), [])
    const fetchDocentes = useCallback(() => usuariosService.listar("DOCENTE"), [])
    const fetchPadres = useCallback(() => usuariosService.listar("PADRE"), [])

    const { data: students, isLoading, error, refetch } = useApiQuery(fetchAlumnos)
    const { data: docentesData } = useApiQuery(fetchDocentes)
    const { data: padresData } = useApiQuery(fetchPadres)

    const allStudents = (students ?? []) as Student[]
    const availableTeachers: UsuarioSimpleResponse[] = (docentesData ?? []).map((d) => ({
        id: d.id, nombre: d.nombre, apellido: d.apellido, correo: d.correo, telefono: d.telefono,
    }))
    const availableParents: UsuarioSimpleResponse[] = (padresData ?? []).map((p) => ({
        id: p.id, nombre: p.nombre, apellido: p.apellido, correo: p.correo, telefono: p.telefono,
    }))

    const [search, setSearch] = useState("")
    const [gradeFilter, setGradeFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [formData, setFormData] = useState<StudentFormData>(emptyStudent)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Filtrar estudiantes
    const filteredStudents = allStudents.filter((student) => {
        const nombreCompleto = `${student.nombre} ${student.apellido}`.toLowerCase()
        const docenteNombre = student.docentes[0]
            ? `${student.docentes[0].nombre} ${student.docentes[0].apellido}`.toLowerCase()
            : ""
        const matchesSearch =
            nombreCompleto.includes(search.toLowerCase()) ||
            docenteNombre.includes(search.toLowerCase())
        const matchesGrade = gradeFilter === "all" || student.grado === gradeFilter
        const matchesStatus = statusFilter === "all" || student.estado === statusFilter
        return matchesSearch && matchesGrade && matchesStatus
    })

    const handleOpenCreate = () => {
        setEditingStudent(null)
        setFormData(emptyStudent)
        setSaveError(null)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (student: Student) => {
        setEditingStudent(student)
        setFormData({
            nombre: student.nombre,
            apellido: student.apellido,
            fechaNacimiento: student.fechaNacimiento,
            grado: student.grado,
            seccion: student.seccion,
            docenteId: student.docentes[0] ? String(student.docentes[0].id) : "",
            padreId: student.padres[0] ? String(student.padres[0].id) : "",
        })
        setSaveError(null)
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setSaving(true)
        setSaveError(null)
        try {
            if (editingStudent) {
                // Actualizar datos básicos
                await alumnosService.actualizar(editingStudent.id, {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    fechaNacimiento: formData.fechaNacimiento,
                    grado: formData.grado,
                    seccion: formData.seccion,
                })

                // Gestionar asignación de docente
                const docenteActualId = editingStudent.docentes[0]?.id
                const nuevoDocenteId = formData.docenteId ? Number(formData.docenteId) : null

                if (docenteActualId !== nuevoDocenteId) {
                    if (docenteActualId) {
                        await alumnosService.removerDocente(editingStudent.id, docenteActualId)
                    }
                    if (nuevoDocenteId) {
                        await alumnosService.asignarDocente(editingStudent.id, nuevoDocenteId)
                    }
                }

                // Gestionar asignación de padre
                const padreActualId = editingStudent.padres[0]?.id
                const nuevoPadreId = formData.padreId ? Number(formData.padreId) : null

                if (padreActualId !== nuevoPadreId) {
                    if (padreActualId) {
                        await alumnosService.removerPadre(editingStudent.id, padreActualId)
                    }
                    if (nuevoPadreId) {
                        await alumnosService.asignarPadre(editingStudent.id, nuevoPadreId)
                    }
                }
            } else {
                // Crear alumno
                const nuevoAlumno = await alumnosService.crear({
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    fechaNacimiento: formData.fechaNacimiento,
                    grado: formData.grado,
                    seccion: formData.seccion,
                })

                // Asignar docente si fue seleccionado
                if (formData.docenteId) {
                    await alumnosService.asignarDocente(nuevoAlumno.id, Number(formData.docenteId))
                }

                // Asignar padre si fue seleccionado
                if (formData.padreId) {
                    await alumnosService.asignarPadre(nuevoAlumno.id, Number(formData.padreId))
                }
            }

            setIsDialogOpen(false)
            setFormData(emptyStudent)
            refetch()
        } catch (err) {
            if (err instanceof AxiosError) {
                setSaveError(err.response?.data?.mensaje ?? "Error al guardar estudiante")
            } else {
                setSaveError("Error inesperado")
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDesactivar = async (studentId: number) => {
        try {
            await alumnosService.desactivar(studentId)
            refetch()
        } catch (err) {
            console.error("Error al desactivar estudiante:", err)
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
        {/* Encabezado inicial */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-[#1E3A5F]">Gestión de Estudiantes</h1>
                <p className="text-sm text-[#6B7280]">
                    Administra estudiantes, asigna docentes y vincula con familias.
                </p>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
                <Plus size={16} />
                Nuevo estudiante
            </Button>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard
                icon={Users}
                title="Total estudiantes"
                value={allStudents.length}
                color="yellow"
                subtitle={
                    <StatusBadge
                        active={allStudents.filter((s) => s.estado === "ACTIVO").length}
                        inactive={allStudents.filter((s) => s.estado === "INACTIVO").length}
                    />
                }
            />

            <StatsCard
                icon={GraduationCap}
                title="Grados con estudiantes"
                value={new Set(allStudents.map((s) => s.grado)).size}
                color="blue"
            />

            <StatsCard
                icon={UserCheck}
                title="Con docente asignado"
                value={allStudents.filter((s) => s.docentes.length > 0).length}
                color="green"
            />

            <StatsCard
                icon={UserCheck}
                title="Con padre/tutor"
                value={allStudents.filter((s) => s.padres.length > 0).length}
                color="purple"
            />
        </div>

        {/* Filtros */}
        <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            filterOptions={[
            {
                label: "Filtrar por grado",
                value: "grade",
                selectItem: "Todos los grados",
                options: grades
            },
            {
                label: "Estado",
                value: "status",
                selectItem: "Todos",
                options: ["ACTIVO", "INACTIVO"]
            }
            ]}
            filterValues={{
                grade: gradeFilter,
                status: statusFilter
            }}
            onFilterChange={(filterName, value) => {
                if (filterName === "grade") setGradeFilter(value)
                if (filterName === "status") setStatusFilter(value)
            }}
        />

            {/* Tabla */}
            <StudentsTable
                students={filteredStudents}
                onEdit={handleOpenEdit}
                onDesactivar={handleDesactivar}
            />

            {/* Create/Edit Dialog */}
            <StudentFormDialog
                open={isDialogOpen}
                isEditing={!!editingStudent}
                formData={formData}
                onChange={setFormData}
                onSave={handleSave}
                saving={saving}
                saveError={saveError}
                onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingStudent(null)
                    setFormData(emptyStudent)
                    setSaveError(null)
                }}
                grades={grades}
                sections={sections}
                availableTeachers={availableTeachers}
                availableParents={availableParents}
            />
        </div>
    )
}
