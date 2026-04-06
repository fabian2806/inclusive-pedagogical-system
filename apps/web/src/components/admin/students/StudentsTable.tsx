import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, MoreHorizontal, UserX } from "lucide-react"
import type { Student } from "@/types/student"

interface StudentsTableProps {
  students: Student[]
  onEdit: (student: Student) => void
  onDesactivar: (studentId: number) => void
}

export function StudentsTable({
  students,
  onEdit,
  onDesactivar,
}: StudentsTableProps) {
  return (
    <Card className="border-[#E5E7EB]">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-[#E5E7EB]">
                            <TableHead className="text-[#6B7280]">Estudiante</TableHead>
                            <TableHead className="text-[#6B7280]">Grado</TableHead>
                            <TableHead className="text-[#6B7280]">Docente asignado</TableHead>
                            <TableHead className="text-[#6B7280]">Padre/Tutor</TableHead>
                            <TableHead className="text-[#6B7280]">Estado</TableHead>
                            <TableHead className="text-[#6B7280] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-[#9CA3AF]">
                                    No se encontraron estudiantes
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => {
                                const docente = student.docentes[0]
                                const padre = student.padres[0]
                                return (
                                    <TableRow key={student.id} className="border-[#E5E7EB]">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-[#FEF3C7] text-[#D97706] text-xs font-semibold">
                                                        {(student.nombre[0] + student.apellido[0]).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="text-sm font-medium text-[#1E3A5F]">
                                                    {student.nombre} {student.apellido}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-[#374151]">
                                                {student.grado} - {student.seccion}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-[#374151]">
                                                {docente
                                                    ? `${docente.nombre} ${docente.apellido}`
                                                    : <span className="text-[#9CA3AF]">Sin asignar</span>
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-[#374151]">
                                                {padre
                                                    ? `${padre.nombre} ${padre.apellido}`
                                                    : <span className="text-[#9CA3AF]">Sin asignar</span>
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${student.estado === "ACTIVO"
                                                        ? "bg-[#ECFDF5] text-[#059669] border-transparent"
                                                        : "bg-[#F3F4F6] text-[#6B7280] border-transparent"
                                                    }`}
                                            >
                                                {student.estado === "ACTIVO" ? "Activo" : "Inactivo"}
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
                                                    <DropdownMenuItem onClick={() => onEdit(student)} className="gap-2">
                                                        <Edit size={14} />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {student.estado === "ACTIVO" && (
                                                        <DropdownMenuItem
                                                            onClick={() => onDesactivar(student.id)}
                                                            className="gap-2 text-[#DC2626]"
                                                        >
                                                            <UserX size={14} />
                                                            Desactivar
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
  )
}
