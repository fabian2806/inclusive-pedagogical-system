export type UserRole = "docente" | "padre" | "saanee" | "admin"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: "active" | "inactive"
  createdAt: string
  lastLogin?: string
}

export interface UserFormData {
  name: string
  email: string
  phone: string
  role: UserRole
  password: string
}