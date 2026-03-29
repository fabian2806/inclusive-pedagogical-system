import { Button } from "@/components/ui/button";
import { Ear, GraduationCap, Plus, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { type Student } from '@/types/student'
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchFilterBar } from "@/components/admin/SearchFilterBar";
import { StudentsTable } from "@/components/admin/students/StudentsTable";
import { useNavigate } from "react-router-dom";
import { StudentFormDialog } from "@/components/admin/students/StudentsFormDialog";

// Data mock de estudiantes
const initialStudents: Student[] = [
    {
        id: "1",
        name: "Sofía Rodríguez",
        grade: "3° Primaria",
        section: "A",
        hearingLevel: "Hipoacusia severa bilateral",
        docente: "María Elena Castro",
        docenteId: "1",
        padre: "Elena Pérez",
        padreId: "3",
        status: "active",
        createdAt: "15 Ene 2025",
    },
    {
        id: "2",
        name: "Carlos Mendoza Jr.",
        grade: "4° Primaria",
        section: "B",
        hearingLevel: "Hipoacusia moderada unilateral",
        docente: "Carlos Mendoza",
        docenteId: "4",
        padre: "Juan Rodríguez",
        padreId: "6",
        status: "active",
        createdAt: "20 Ene 2025",
    },
    {
        id: "3",
        name: "Ana Torres",
        grade: "2° Primaria",
        section: "A",
        hearingLevel: "Hipoacusia profunda bilateral",
        docente: "María Elena Castro",
        docenteId: "1",
        padre: "Laura Torres",
        padreId: "7",
        status: "active",
        createdAt: "5 Feb 2025",
    },
    {
        id: "4",
        name: "Miguel Sánchez",
        grade: "5° Primaria",
        section: "A",
        hearingLevel: "Hipoacusia moderada bilateral",
        docente: "Carlos Mendoza",
        docenteId: "4",
        padre: "Pedro Sánchez",
        padreId: "8",
        status: "inactive",
        createdAt: "10 Feb 2025",
    },
]

// Mock de docentes y padres para los selects del formulario
const availableTeachers = [
    { id: "1", name: "María Elena Castro" },
    { id: "4", name: "Carlos Mendoza" },
]
const availableParents = [
    { id: "3", name: "Elena Pérez" },
    { id: "6", name: "Juan Rodríguez" },
    { id: "7", name: "Laura Torres" },
    { id: "8", name: "Pedro Sánchez" },
]

// Mock de grados y niveles auditivos para los selects del formulario
const grades = ["1° Primaria", "2° Primaria", "3° Primaria", "4° Primaria", "5° Primaria", "6° Primaria"]
const sections = ["A", "B", "C"]
const hearingLevels = [
    "Hipoacusia leve unilateral",
    "Hipoacusia leve bilateral",
    "Hipoacusia moderada unilateral",
    "Hipoacusia moderada bilateral",
    "Hipoacusia severa unilateral",
    "Hipoacusia severa bilateral",
    "Hipoacusia profunda unilateral",
    "Hipoacusia profunda bilateral",
]

const emptyStudent = {
    name: "",
    grade: "",
    section: "",
    hearingLevel: "",
    docenteId: "",
    padreId: "",
    notes: "",
}

export function AdminStudents() {

    const navigate = useNavigate()

    const [students, setStudents] = useState<Student[]>(initialStudents)
    const [search, setSearch] = useState("")
    const [gradeFilter, setGradeFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [formData, setFormData] = useState(emptyStudent)

    // Filtrar estudiantes según búsqueda, grado y estado
    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.docente.toLowerCase().includes(search.toLowerCase())
        const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter
        const matchesStatus = statusFilter === "all" || student.status === statusFilter
        return matchesSearch && matchesGrade && matchesStatus
    })

    const handleOpenCreate = () => {
        setEditingStudent(null)
        setFormData(emptyStudent)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (student: Student) => {
        setEditingStudent(student)
        setFormData({
            name: student.name,
            grade: student.grade,
            section: student.section,
            hearingLevel: student.hearingLevel,
            docenteId: student.docenteId,
            padreId: student.padreId,
            notes: "",
        })
        setIsDialogOpen(true)
    }

    const handleSave = () => {
        const docente = availableTeachers.find((d) => d.id === formData.docenteId)
        const padre = availableParents.find((p) => p.id === formData.padreId)

        if (editingStudent) {
            setStudents(students.map((s) =>
                s.id === editingStudent.id
                    ? {
                        ...s,
                        name: formData.name,
                        grade: formData.grade,
                        section: formData.section,
                        hearingLevel: formData.hearingLevel,
                        docente: docente?.name || s.docente,
                        docenteId: formData.docenteId,
                        padre: padre?.name || s.padre,
                        padreId: formData.padreId,
                    }
                    : s
            ))
        } else {
            const newStudent: Student = {
                id: String(Date.now()),
                name: formData.name,
                grade: formData.grade,
                section: formData.section,
                hearingLevel: formData.hearingLevel,
                docente: docente?.name || "",
                docenteId: formData.docenteId,
                padre: padre?.name || "",
                padreId: formData.padreId,
                status: "active",
                createdAt: new Date().toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" }),
            }
            setStudents([newStudent, ...students])
        }
        setIsDialogOpen(false)
        setFormData(emptyStudent)
    }

    const handleViewStudent = (studentId: string) => {
        navigate(`/dashboard/admin/estudiantes/${studentId}`)
    }

    const handleToggleStatus = (studentId: string) => {
        setStudents(students.map((s) =>
            s.id === studentId ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
        ))
    }

    const handleDelete = (studentId: string) => {
        setStudents(students.filter((s) => s.id !== studentId))
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
                value={students.length}
                color="yellow"
                subtitle={
                    <StatusBadge
                        active={students.filter((s) => s.status === "active").length}
                        inactive={students.filter((s) => s.status === "inactive").length}
                    />
                }
            />

            <StatsCard
                icon={GraduationCap}
                title="Grados con estudiantes"
                value={new Set(students.map((s) => s.grade)).size}
                color="blue"
            />

            <StatsCard
                icon={Ear}
                title="Hipoacusia severa/profunda"
                value={students.filter((s) => s.hearingLevel.includes("severa") || s.hearingLevel.includes("profunda")).length}
                color="purple"
            />

            <StatsCard
                icon={UserCheck}
                title="Docentes asignados"
                value={new Set(students.map((s) => s.docenteId)).size}
                color="green"
            />
        </div>

        {/* Filtros para los registros (considerar lógica al exportar a componentes) */}
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
                options: ["Activos", "Inactivos"]
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

            {/* Tabla con los registros de cada estudiante */}
            <StudentsTable
                students={filteredStudents}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onView={handleViewStudent}
            />

            {/* Create/Edit Dialog */}
            <StudentFormDialog
                open={isDialogOpen}
                isEditing={!!editingStudent}
                formData={formData}
                onChange={setFormData}
                onSave={handleSave}
                onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingStudent(null)
                    setFormData(emptyStudent)
                }}
                grades={grades}
                sections={sections}
                hearingLevels={hearingLevels}
                availableTeachers={availableTeachers}
                availableParents={availableParents}
            />
        </div>
    )
}