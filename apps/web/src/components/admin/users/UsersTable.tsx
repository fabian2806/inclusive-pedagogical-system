import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, MoreHorizontal, UserX } from "lucide-react"
import type { User } from "@/types/user"
import type { TipoRol } from "@/types/api"

interface UsersTableProps {
    users: User[]
    onEdit: (user: User) => void
    onDesactivar: (userId: number) => void
}

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    ADMIN: { label: "Administrador", color: "text-[#1E3A5F]", bg: "bg-[#E5E7EB]" },
    DOCENTE: { label: "Docente", color: "text-[#3B82F6]", bg: "bg-[#EEF2FF]" },
    PADRE: { label: "Padre/Tutor", color: "text-[#8B5CF6]", bg: "bg-[#F3E8FF]" },
    SAANEE: { label: "SAANEE", color: "text-[#059669]", bg: "bg-[#ECFDF5]" },
}

function getRolPrincipal(roles: TipoRol[]): TipoRol {
    return roles[0] ?? 'DOCENTE'
}

export function UsersTable({ users, onEdit, onDesactivar }: UsersTableProps) {
    return (
        <Card className="border-[#E5E7EB]">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-[#E5E7EB]">
                            <TableHead className="text-[#6B7280]">Usuario</TableHead>
                            <TableHead className="text-[#6B7280]">Rol</TableHead>
                            <TableHead className="text-[#6B7280]">Estado</TableHead>
                            <TableHead className="text-[#6B7280] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-[#9CA3AF]">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => {
                                const rol = getRolPrincipal(user.roles)
                                const config = roleConfig[rol]
                                return (
                                    <TableRow key={user.id} className="border-[#E5E7EB]">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className={`${config.bg} ${config.color} text-xs font-semibold`}>
                                                        {(user.nombre[0] + user.apellido[0]).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-[#1E3A5F]">
                                                        {user.nombre} {user.apellido}
                                                    </p>
                                                    <p className="text-xs text-[#9CA3AF]">{user.correo}</p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${config.bg} ${config.color} border-transparent text-xs`}
                                            >
                                                {config.label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs ${user.estado === "ACTIVO"
                                                        ? "bg-[#ECFDF5] text-[#059669] border-transparent"
                                                        : "bg-[#F3F4F6] text-[#6B7280] border-transparent"
                                                    }`}
                                            >
                                                {user.estado === "ACTIVO" ? "Activo" : "Inactivo"}
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
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit(user)}
                                                        className="gap-2"
                                                    >
                                                        <Edit size={14} />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    {user.estado === "ACTIVO" && (
                                                        <DropdownMenuItem
                                                            onClick={() => onDesactivar(user.id)}
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
