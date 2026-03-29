import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserFormData, type UserRole } from "@/types/user"

interface UserFormDialogProps {
  open: boolean
  isEditing: boolean
  formData: UserFormData
  onChange: (data: UserFormData) => void
  onSave: () => void
  onCancel: () => void
}

export function UserFormDialog({
  open,
  isEditing,
  formData,
  onChange,
  onSave,
  onCancel
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-112.5">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">
            {isEditing ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Nombre completo */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm text-[#374151]">
              Nombre completo
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="Ej: María Elena Castro"
              className="border-[#E5E7EB]"
            />
          </div>

          {/* Email y Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-[#374151]">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onChange({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="border-[#E5E7EB]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm text-[#374151]">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => onChange({ ...formData, phone: e.target.value })}
                placeholder="987 654 321"
                className="border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Rol y Contraseña */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-[#374151]">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => onChange({ ...formData, role: value })}
              >
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docente">Docente</SelectItem>
                  <SelectItem value="padre">Padre/Tutor</SelectItem>
                  <SelectItem value="saanee">SAANEE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-[#374151]">
                {isEditing ? "Nueva contraseña" : "Contraseña"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => onChange({ ...formData, password: e.target.value })}
                placeholder={isEditing ? "Dejar vacío para mantener" : "••••••••"}
                className="border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-[#E5E7EB] text-[#374151]"
            >
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
            >
              {isEditing ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}