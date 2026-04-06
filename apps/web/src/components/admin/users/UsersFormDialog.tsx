import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserFormData } from "@/types/user"
import type { TipoRol } from "@/types/api"

interface UserFormDialogProps {
  open: boolean
  isEditing: boolean
  formData: UserFormData
  onChange: (data: UserFormData) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
  saveError?: string | null
}

export function UserFormDialog({
  open,
  isEditing,
  formData,
  onChange,
  onSave,
  onCancel,
  saving = false,
  saveError = null,
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
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-sm text-[#374151]">
                Nombre
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
                placeholder="Ej: María Elena"
                className="border-[#E5E7EB]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellido" className="text-sm text-[#374151]">
                Apellido
              </Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => onChange({ ...formData, apellido: e.target.value })}
                placeholder="Ej: Castro"
                className="border-[#E5E7EB]"
              />
            </div>
          </div>

          {/* Correo y Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="correo" className="text-sm text-[#374151]">
                Correo electrónico
              </Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => onChange({ ...formData, correo: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="border-[#E5E7EB]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-sm text-[#374151]">
                Teléfono
              </Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => onChange({ ...formData, telefono: e.target.value })}
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
                value={formData.rol}
                onValueChange={(value: TipoRol) => onChange({ ...formData, rol: value })}
              >
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCENTE">Docente</SelectItem>
                  <SelectItem value="PADRE">Padre/Tutor</SelectItem>
                  <SelectItem value="SAANEE">SAANEE</SelectItem>
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

          {/* Error de guardado */}
          {saveError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {saveError}
            </div>
          )}

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
              disabled={saving}
              className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
            >
              {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
