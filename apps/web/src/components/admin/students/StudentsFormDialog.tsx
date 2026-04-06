import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

                    {/* Docente asignado y Padre/Tutor */}
                    <div className="grid grid-cols-2 gap-3">
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

                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Padre/Tutor vinculado</Label>
                            <Select
                                value={formData.padreId}
                                onValueChange={(value) => onChange({ ...formData, padreId: value })}
                            >
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar padre/tutor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableParents.map((padre) => (
                                        <SelectItem key={padre.id} value={String(padre.id)}>
                                            {padre.nombre} {padre.apellido}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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
                            disabled={saving}
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
