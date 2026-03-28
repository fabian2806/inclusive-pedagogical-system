import type { UserRole } from "@/types/auth"

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrador"
    case "docente":
      return "Docente"
    case "padre":
      return "Familia"
    case "saanee":
      return "Especialista SAANEE"
    default:
      return "Usuario"
  }
}

export function getRoleColor(role: UserRole) {
  switch (role) {
    case "admin":
      return {
        bg: "bg-[#FEF3C7]",
        text: "text-[#D97706]",
        border: "border-[#FDE68A]",
      }

    case "docente":
      return {
        bg: "bg-[#EEF2FF]",
        text: "text-[#3B82F6]",
        border: "border-[#C7D2FE]",
      }

    case "padre":
      return {
        bg: "bg-[#ECFDF5]",
        text: "text-[#059669]",
        border: "border-[#A7F3D0]",
      }

    case "saanee":
      return {
        bg: "bg-[#F3E8FF]",
        text: "text-[#7C3AED]",
        border: "border-[#DDD6FE]",
      }

    default:
      return {
        bg: "bg-[#F3F4F6]",
        text: "text-[#6B7280]",
        border: "border-[#E5E7EB]",
      }
  }
}