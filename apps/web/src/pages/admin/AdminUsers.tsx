import { useState, useCallback } from "react"
import { Plus, Users, GraduationCap, UserCog, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/admin/StatsCard"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { SearchFilterBar } from "@/components/admin/SearchFilterBar"
import { UsersTable } from "@/components/admin/users/UsersTable"
import { UserFormDialog } from "@/components/admin/users/UsersFormDialog"
import type { User, UserFormData } from "@/types/user"
import type { TipoRol } from "@/types/api"
import { usuariosService } from "@/lib/api"
import { useApiQuery } from "@/hooks/useApiQuery"
import { AxiosError } from "axios"

const emptyUser: UserFormData = {
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
    rol: "DOCENTE",
}

export default function UsuariosPage() {
    const fetchUsuarios = useCallback(() => usuariosService.listar(), [])
    const { data: users, isLoading, error, refetch } = useApiQuery(fetchUsuarios)

    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState<UserFormData>(emptyUser)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const allUsers = (users ?? []) as User[]

    // Filtrar usuarios
    const filteredUsers = allUsers.filter((user) => {
        const nombreCompleto = `${user.nombre} ${user.apellido}`.toLowerCase()
        const matchesSearch =
            nombreCompleto.includes(search.toLowerCase()) ||
            user.correo.toLowerCase().includes(search.toLowerCase())
        const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter as TipoRol)
        const matchesStatus = statusFilter === "all" || user.estado === statusFilter
        return matchesSearch && matchesRole && matchesStatus
    })

    const handleOpenCreate = () => {
        setEditingUser(null)
        setFormData(emptyUser)
        setSaveError(null)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            telefono: user.telefono ?? "",
            password: "",
            rol: user.roles[0] ?? "DOCENTE",
        })
        setSaveError(null)
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setSaving(true)
        setSaveError(null)
        try {
            if (editingUser) {
                await usuariosService.actualizar(editingUser.id, {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    correo: formData.correo,
                    telefono: formData.telefono || undefined,
                    password: formData.password || undefined,
                    rol: formData.rol !== editingUser.roles[0] ? formData.rol : undefined,
                })
            } else {
                await usuariosService.crear({
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    correo: formData.correo,
                    telefono: formData.telefono || undefined,
                    password: formData.password,
                    rol: formData.rol,
                })
            }
            setIsDialogOpen(false)
            setFormData(emptyUser)
            refetch()
        } catch (err) {
            if (err instanceof AxiosError) {
                setSaveError(err.response?.data?.mensaje ?? "Error al guardar usuario")
            } else {
                setSaveError("Error inesperado")
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDesactivar = async (userId: number) => {
        try {
            await usuariosService.desactivar(userId)
            refetch()
        } catch (err) {
            console.error("Error al desactivar usuario:", err)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
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
                    <h1 className="text-2xl font-bold text-[#1E3A5F]">Gestión de Usuarios</h1>
                    <p className="text-sm text-[#6B7280]">
                        Administra docentes, padres/tutores y especialistas SAANEE.
                    </p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white">
                    <Plus size={16} />
                    Nuevo usuario
                </Button>
            </div>

            {/* Cards de estadísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatsCard
                    icon={Users}
                    title="Total usuarios"
                    value={allUsers.length}
                    color="blue"
                    subtitle={
                        <StatusBadge
                            active={allUsers.filter((u) => u.estado === "ACTIVO").length}
                            inactive={allUsers.filter((u) => u.estado === "INACTIVO").length}
                        />
                    }
                />

                <StatsCard
                    icon={GraduationCap}
                    title="Docentes"
                    value={allUsers.filter((u) => u.roles.includes("DOCENTE")).length}
                    color="blue"
                />

                <StatsCard
                    icon={UserCog}
                    title="Padres/Tutores"
                    value={allUsers.filter((u) => u.roles.includes("PADRE")).length}
                    color="purple"
                />

                <StatsCard
                    icon={Shield}
                    title="SAANEE"
                    value={allUsers.filter((u) => u.roles.includes("SAANEE")).length}
                    color="green"
                />
            </div>

            {/* Filtros para los registros */}
            <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                filterOptions={[
                    {
                        label: "Filtrar por rol",
                        value: "role",
                        selectItem: "Todos los roles",
                        options: ["DOCENTE", "PADRE", "SAANEE"]
                    },
                    {
                        label: "Estado",
                        value: "status",
                        selectItem: "Todos",
                        options: ["ACTIVO", "INACTIVO"]
                    }
                ]}
                filterValues={{
                    role: roleFilter,
                    status: statusFilter
                }}
                onFilterChange={(filterName, value) => {
                    if (filterName === "role") setRoleFilter(value)
                    if (filterName === "status") setStatusFilter(value)
                }}
            />

            {/* Tabla con los registros de cada usuario */}
            <UsersTable
                users={filteredUsers}
                onEdit={handleOpenEdit}
                onDesactivar={handleDesactivar}
            />

            {/* Create/Edit Dialog */}
            <UserFormDialog
                open={isDialogOpen}
                isEditing={!!editingUser}
                formData={formData}
                onChange={setFormData}
                onSave={handleSave}
                saving={saving}
                saveError={saveError}
                onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingUser(null)
                    setFormData(emptyUser)
                    setSaveError(null)
                }}
            />

        </div>
    )
}
