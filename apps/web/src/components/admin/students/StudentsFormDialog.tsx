import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import type { StudentFormData } from "@/types/student"
import type { UsuarioSimpleResponse } from "@/types/api"

interface StudentFormDialogProps {
    open: boolean
    isEditing: boolean
    formData: StudentFormData
    onChange: (data: StudentFormData) => void
    onSave: () => void
    onCancel: () => void
    saving?: boolean
    saveError?: string | null
    grades: string[]
    sections: string[]
    availableTeachers: UsuarioSimpleResponse[]
    availableParents: UsuarioSimpleResponse[]
}

export function StudentFormDialog({
    open,
    isEditing,
    formData,
    onChange,
    onSave,
    onCancel,
    saving = false,
    saveError = null,
    grades,
    sections,
    availableTeachers,
    availableParents
}: StudentFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-137.5">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-[#1E3A5F]">
                        {isEditing ? "Editar estudiante" : "Nuevo estudiante"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
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
                                placeholder="Ej: Sofía"
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
                                placeholder="Ej: Rodríguez"
                                className="border-[#E5E7EB]"
                            />
                        </div>
                    </div>

                    {/* Fecha de nacimiento, Grado, Sección */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="fechaNacimiento" className="text-sm text-[#374151]">
                                Fecha de nacimiento
                            </Label>
                            <Input
                                id="fechaNacimiento"
                                type="date"
                                value={formData.fechaNacimiento}
                                onChange={(e) => onChange({ ...formData, fechaNacimiento: e.target.value })}
                                className="border-[#E5E7EB]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Grado</Label>
                            <Select
                                value={formData.grado}
                                onValueChange={(value) => onChange({ ...formData, grado: value })}
                            >
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map((grade) => (
                                        <SelectItem key={grade} value={grade}>
                                            {grade}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Sección</Label>
                            <Select
                                value={formData.seccion}
                                onValueChange={(value) => onChange({ ...formData, seccion: value })}
                            >
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((section) => (
                                        <SelectItem key={section} value={section}>
                                            {section}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Docente asignado */}
                    <div className="space-y-1.5">
                        <Label className="text-sm text-[#374151]">Docente asignado</Label>
                        <Select
                            value={formData.docenteId}
                            onValueChange={(value) => onChange({ ...formData, docenteId: value })}
                        >
                            <SelectTrigger className="border-[#E5E7EB]">
                                <SelectValue placeholder="Seleccionar docente" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTeachers.map((docente) => (
                                    <SelectItem key={docente.id} value={String(docente.id)}>
                                        {docente.nombre} {docente.apellido}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Padres/Tutores vinculados */}
                    <ParentsSelector
                        parents={availableParents}
                        seleccionados={formData.padreIds}
                        onToggle={(id) =>
                            onChange({
                                ...formData,
                                padreIds: formData.padreIds.includes(id)
                                    ? formData.padreIds.filter((x) => x !== id)
                                    : [...formData.padreIds, id],
                            })
                        }
                    />

                    {/* Error de guardado */}
                    {saveError && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                            {saveError}
                        </div>
                    )}

                    {/* Botones de acción */}
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
                            disabled={
                                saving ||
                                !formData.nombre.trim() ||
                                !formData.apellido.trim() ||
                                !formData.fechaNacimiento ||
                                !formData.grado ||
                                !formData.seccion
                            }
                            className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
                        >
                            {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear estudiante"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ParentsSelector({
    parents,
    seleccionados,
    onToggle,
}: {
    parents: UsuarioSimpleResponse[]
    seleccionados: number[]
    onToggle: (id: number) => void
}) {
    if (parents.length === 0) {
        return (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
                <AlertCircle size={16} className="text-[#D97706] mt-0.5 shrink-0" />
                <p className="text-sm text-[#92400E]">
                    No hay padres/tutores registrados. Créalos desde Usuarios para poder vincularlos.
                </p>
            </div>
        )
    }
    return (
        <div className="space-y-2">
            <Label className="text-sm text-[#374151]">
                Padres/Tutores vinculados
                {seleccionados.length > 0 && (
                    <span className="text-[#6B7280] font-normal"> ({seleccionados.length})</span>
                )}
            </Label>
            <div className="space-y-2">
                {parents.map((padre) => (
                    <label
                        key={padre.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] cursor-pointer hover:bg-[#F3F4F6]"
                    >
                        <Checkbox
                            checked={seleccionados.includes(padre.id)}
                            onCheckedChange={() => onToggle(padre.id)}
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-[#374151]">
                                {padre.nombre} {padre.apellido}
                            </p>
                            <p className="text-xs text-[#6B7280]">{padre.correo}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    )
}
