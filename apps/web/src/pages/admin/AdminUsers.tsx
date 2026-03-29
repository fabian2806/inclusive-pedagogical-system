import { useState } from "react"
import { Plus, Users, GraduationCap, UserCog, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/admin/StatsCard"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { SearchFilterBar } from "@/components/admin/SearchFilterBar"
import { UsersTable } from "@/components/admin/users/UsersTable"
import { UserFormDialog } from "@/components/admin/users/UsersFormDialog"
import type { User, UserRole } from "@/types/user"

// Mock users data
const initialUsers: User[] = [
    {
        id: "1",
        name: "María Elena Castro",
        email: "mcastro@signaedu.pe",
        phone: "987 654 321",
        role: "docente",
        status: "active",
        createdAt: "15 Ene 2025",
        lastLogin: "Hoy",
    },
    {
        id: "2",
        name: "Roberto Quispe",
        email: "rquispe@signaedu.pe",
        phone: "912 345 678",
        role: "saanee",
        status: "active",
        createdAt: "20 Ene 2025",
        lastLogin: "Ayer",
    },
    {
        id: "3",
        name: "Elena Pérez",
        email: "eperez@gmail.com",
        phone: "945 678 123",
        role: "padre",
        status: "active",
        createdAt: "25 Ene 2025",
        lastLogin: "Hace 2 días",
    },
    {
        id: "4",
        name: "Carlos Mendoza",
        email: "cmendoza@signaedu.pe",
        phone: "956 789 234",
        role: "docente",
        status: "active",
        createdAt: "10 Feb 2025",
        lastLogin: "Hoy",
    },
    {
        id: "5",
        name: "Ana García",
        email: "agarcia@signaedu.pe",
        phone: "978 123 456",
        role: "saanee",
        status: "inactive",
        createdAt: "5 Feb 2025",
    },
    {
        id: "6",
        name: "Juan Rodríguez",
        email: "jrodriguez@gmail.com",
        phone: "934 567 890",
        role: "padre",
        status: "active",
        createdAt: "1 Mar 2025",
        lastLogin: "Hace 1 semana",
    },
]

const emptyUser = {
    name: "",
    email: "",
    phone: "",
    role: "docente" as UserRole,
    password: "",
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState(emptyUser)

    // Filter users
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
    })

    const handleOpenCreate = () => {
        setEditingUser(null)
        setFormData(emptyUser)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            password: "",
        })
        setIsDialogOpen(true)
    }

    const handleSave = () => {
        if (editingUser) {
            // Update existing user
            setUsers(users.map((u) =>
                u.id === editingUser.id
                    ? { ...u, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
                    : u
            ))
        } else {
            // Create new user
            const newUser: User = {
                id: String(Date.now()),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                status: "active",
                createdAt: new Date().toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" }),
            }
            setUsers([newUser, ...users])
        }
        setIsDialogOpen(false)
        setFormData(emptyUser)
    }

    const handleToggleStatus = (userId: string) => {
        setUsers(users.map((u) =>
            u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
        ))
    }

    const handleDelete = (userId: string) => {
        setUsers(users.filter((u) => u.id !== userId))
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
                    value={users.length}
                    color="blue"
                    subtitle={
                        <StatusBadge
                            active={users.filter((u) => u.status === "active").length}
                            inactive={users.filter((u) => u.status === "inactive").length}
                        />
                    }
                />

                <StatsCard
                    icon={GraduationCap}
                    title="Docentes"
                    value={users.filter((u) => u.role === "docente").length}
                    color="blue"
                />

                <StatsCard
                    icon={UserCog}
                    title="Padres/Tutores"
                    value={users.filter((u) => u.role === "padre").length}
                    color="purple"
                />

                <StatsCard
                    icon={Shield}
                    title="SAANEE"
                    value={users.filter((u) => u.role === "saanee").length}
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
                        options: ["docente", "padre", "saanee"]
                    },
                    {
                        label: "Estado",
                        value: "status",
                        selectItem: "Todos",
                        options: ["active", "inactive"]
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
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
            />

            {/* Create/Edit Dialog */}
            <UserFormDialog
                open={isDialogOpen}
                isEditing={!!editingUser}
                formData={formData}
                onChange={setFormData}
                onSave={handleSave}
                onCancel={() => {
                    setIsDialogOpen(false)
                    setEditingUser(null)
                    setFormData(emptyUser)
                }}
            />
        </div>
    )
}
