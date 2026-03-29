import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, MoreHorizontal, Trash2, UserCheck, UserX } from "lucide-react"
import { type User, type UserRole } from "@/types/user"

interface UsersTableProps {
    users: User[]
    onEdit: (user: User) => void
    onToggleStatus: (userId: string) => void
    onDelete: (userId: string) => void
}

const roleConfig: Record<UserRole, { label: string; color: string; bg: string }> = {
    admin: { label: "Administrador", color: "text-[#1E3A5F]", bg: "bg-[#E5E7EB]" },
    docente: { label: "Docente", color: "text-[#3B82F6]", bg: "bg-[#EEF2FF]" },
    padre: { label: "Padre/Tutor", color: "text-[#8B5CF6]", bg: "bg-[#F3E8FF]" },
    saanee: { label: "SAANEE", color: "text-[#059669]", bg: "bg-[#ECFDF5]" },
}

export function UsersTable({ users, onEdit, onToggleStatus, onDelete }: UsersTableProps) {
    return (
        <Card className="border-[#E5E7EB]">
            <CardContent className="p-0">
                <Table>
                    {/* Encabezado de la tabla */}
                    <TableHeader>
                        <TableRow className="border-[#E5E7EB]">
                            <TableHead className="text-[#6B7280]">Usuario</TableHead>
                            <TableHead className="text-[#6B7280]">Rol</TableHead>
                            <TableHead className="text-[#6B7280]">Estado</TableHead>
                            <TableHead className="text-[#6B7280]">Último acceso</TableHead>
                            <TableHead className="text-[#6B7280] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    {/* Contenido de la tabla */}
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-[#9CA3AF]">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="border-[#E5E7EB]">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className={`${roleConfig[user.role].bg} ${roleConfig[user.role].color} text-xs font-semibold`}>
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-[#1E3A5F]">{user.name}</p>
                                                <p className="text-xs text-[#9CA3AF]">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`${roleConfig[user.role].bg} ${roleConfig[user.role].color} border-transparent text-xs`}
                                        >
                                            {roleConfig[user.role].label}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${user.status === "active"
                                                    ? "bg-[#ECFDF5] text-[#059669] border-transparent"
                                                    : "bg-[#F3F4F6] text-[#6B7280] border-transparent"
                                                }`}
                                        >
                                            {user.status === "active" ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-sm text-[#6B7280]">
                                        {user.lastLogin || "Nunca"}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal size={16} className="text-[#6B7280]" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(user)}
                                                    className="gap-2"
                                                >
                                                    <Edit size={14} />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onToggleStatus(user.id)}
                                                    className="gap-2"
                                                >
                                                    {user.status === "active" ? (
                                                        <>
                                                            <UserX size={14} />
                                                            Desactivar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck size={14} />
                                                            Activar
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(user.id)}
                                                    className="gap-2 text-[#DC2626]"
                                                >
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