import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Ear, Edit, Eye, GraduationCap, Link, MoreHorizontal, Plus, Search, Trash2, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { type Student } from '@/types/student'

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

        {/* Cards de estadísticas (exportar a componentes) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-[#E5E7EB]">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#FEF3C7]">
                            <Users size={20} className="text-[#D97706]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1E3A5F]">{students.length}</p>
                            <p className="text-xs text-[#6B7280]">Total estudiantes</p>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-3 text-xs">
                        <span className="flex items-center gap-1 text-[#059669]">
                            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                            {students.filter((s) => s.status === "active").length} activos
                        </span>
                        <span className="flex items-center gap-1 text-[#6B7280]">
                            <span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
                            {students.filter((s) => s.status === "inactive").length} inactivos
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#EEF2FF]">
                            <GraduationCap size={20} className="text-[#3B82F6]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1E3A5F]">{new Set(students.map((s) => s.grade)).size}</p>
                            <p className="text-xs text-[#6B7280]">Grados con estudiantes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#F3E8FF]">
                            <Ear size={20} className="text-[#8B5CF6]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1E3A5F]">{students.filter((s) => s.hearingLevel.includes("severa") || s.hearingLevel.includes("profunda")).length}</p>
                            <p className="text-xs text-[#6B7280]">Hipoacusia severa/profunda</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E5E7EB]">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#ECFDF5]">
                            <UserCheck size={20} className="text-[#059669]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1E3A5F]">{new Set(students.map((s) => s.docenteId)).size}</p>
                            <p className="text-xs text-[#6B7280]">Docentes asignados</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Filtros para los registros (considerar lógica al exportar a componentes) */}
        <Card className="border-[#E5E7EB]">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <Input
                            placeholder="Buscar por nombre o docente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 border-[#E5E7EB]"
                        />
                    </div>
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                        <SelectTrigger className="w-full sm:w-45 border-[#E5E7EB]">
                            <SelectValue placeholder="Filtrar por grado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los grados</SelectItem>
                            {grades.map((grade) => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-37.5 border-[#E5E7EB]">
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

        {/* Tabla con los registros de cada estudiante */}
        <Card className="border-[#E5E7EB]">
            <CardContent className="p-0">
                <Table>
                    {/* Encabezado de la tabla */}
                    <TableHeader>
                        <TableRow className="border-[#E5E7EB]">
                            <TableHead className="text-[#6B7280]">Estudiante</TableHead>
                            <TableHead className="text-[#6B7280]">Grado</TableHead>
                            <TableHead className="text-[#6B7280]">Nivel auditivo</TableHead>
                            <TableHead className="text-[#6B7280]">Docente asignado</TableHead>
                            <TableHead className="text-[#6B7280]">Padre/Tutor</TableHead>
                            <TableHead className="text-[#6B7280]">Estado</TableHead>
                            <TableHead className="text-[#6B7280] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    {/* Contenido de la tabla */}
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-[#9CA3AF]">
                                    No se encontraron estudiantes
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => (
                                <TableRow key={student.id} className="border-[#E5E7EB]">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-[#FEF3C7] text-[#D97706] text-xs font-semibold">
                                                    {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="text-sm font-medium text-[#1E3A5F]">{student.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-[#374151]">{student.grade} - {student.section}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-[#6B7280]">{student.hearingLevel}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-[#374151]">{student.docente}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-[#374151]">{student.padre}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${student.status === "active"
                                                    ? "bg-[#ECFDF5] text-[#059669] border-transparent"
                                                    : "bg-[#F3F4F6] text-[#6B7280] border-transparent"
                                                }`}
                                        >
                                            {student.status === "active" ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal size={16} className="text-[#6B7280]" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/estudiantes/${student.id}`} className="gap-2">
                                                        <Eye size={14} />
                                                        Ver expediente
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenEdit(student)} className="gap-2">
                                                    <Edit size={14} />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(student.id)} className="gap-2">
                                                    {student.status === "active" ? "Desactivar" : "Activar"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(student.id)} className="gap-2 text-[#DC2626]">
                                                    <Trash2 size={14} />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
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
                        {editingStudent ? "Editar estudiante" : "Nuevo estudiante"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm text-[#374151]">Nombre completo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Sofía Rodríguez"
                            className="border-[#E5E7EB]"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Grado</Label>
                            <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map((grade) => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Sección</Label>
                            <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((section) => (
                                        <SelectItem key={section} value={section}>{section}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Nivel auditivo</Label>
                            <Select value={formData.hearingLevel} onValueChange={(value) => setFormData({ ...formData, hearingLevel: value })}>
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hearingLevels.map((level) => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Docente asignado</Label>
                            <Select value={formData.docenteId} onValueChange={(value) => setFormData({ ...formData, docenteId: value })}>
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar docente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTeachers.map((docente) => (
                                        <SelectItem key={docente.id} value={docente.id}>{docente.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Padre/Tutor vinculado</Label>
                            <Select value={formData.padreId} onValueChange={(value) => setFormData({ ...formData, padreId: value })}>
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar padre/tutor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableParents.map((padre) => (
                                        <SelectItem key={padre.id} value={padre.id}>{padre.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-sm text-[#374151]">Notas adicionales (opcional)</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Información adicional del estudiante..."
                            className="border-[#E5E7EB] resize-none h-20"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#E5E7EB] text-[#374151]">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
                            {editingStudent ? "Guardar cambios" : "Crear estudiante"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}