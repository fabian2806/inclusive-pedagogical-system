import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { type Student } from "@/types/student"

interface StudentsTableProps {
  students: Student[]
  onEdit: (student: Student) => void
  onToggleStatus: (studentId: string) => void
  onDelete: (studentId: string) => void
  onView?: (studentId: string) => void
}

export function StudentsTable({
  students,
  onEdit,
  onToggleStatus,
  onDelete,
  onView
}: StudentsTableProps) {
  return (
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
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-[#9CA3AF]">
                                    No se encontraron estudiantes
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
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
                                                {onView && (
                                                    <DropdownMenuItem
                                                        onClick={() => onView(student.id)}
                                                        className="gap-2"
                                                    >
                                                        <Eye size={14} />
                                                        Ver expediente
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => onEdit(student)} className="gap-2">
                                                    <Edit size={14} />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onToggleStatus(student.id)} className="gap-2">
                                                    {student.status === "active" ? "Desactivar" : "Activar"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onDelete(student.id)} className="gap-2 text-[#DC2626]">
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
  )
}