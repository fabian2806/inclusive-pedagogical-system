import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface StudentFormData {
    name: string
    grade: string
    section: string
    hearingLevel: string
    docenteId: string
    padreId: string
    notes: string
}

interface StudentFormDialogProps {
    open: boolean
    isEditing: boolean
    formData: StudentFormData
    onChange: (data: StudentFormData) => void
    onSave: () => void
    onCancel: () => void
    grades: string[]
    sections: string[]
    hearingLevels: string[]
    availableTeachers: { id: string; name: string }[]
    availableParents: { id: string; name: string }[]
}

export function StudentFormDialog({
    open,
    isEditing,
    formData,
    onChange,
    onSave,
    onCancel,
    grades,
    sections,
    hearingLevels,
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
                    {/* Nombre completo */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm text-[#374151]">
                            Nombre completo
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => onChange({ ...formData, name: e.target.value })}
                            placeholder="Ej: Sofía Rodríguez"
                            className="border-[#E5E7EB]"
                        />
                    </div>

                    {/* Grado, Sección, Nivel auditivo */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Grado</Label>
                            <Select
                                value={formData.grade}
                                onValueChange={(value) => onChange({ ...formData, grade: value })}
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
                                value={formData.section}
                                onValueChange={(value) => onChange({ ...formData, section: value })}
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

                        <div className="space-y-1.5">
                            <Label className="text-sm text-[#374151]">Nivel auditivo</Label>
                            <Select
                                value={formData.hearingLevel}
                                onValueChange={(value) => onChange({ ...formData, hearingLevel: value })}
                            >
                                <SelectTrigger className="border-[#E5E7EB]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hearingLevels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
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
                                        <SelectItem key={docente.id} value={docente.id}>
                                            {docente.name}
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
                                        <SelectItem key={padre.id} value={padre.id}>
                                            {padre.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notas adicionales */}
                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-sm text-[#374151]">
                            Notas adicionales (opcional)
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => onChange({ ...formData, notes: e.target.value })}
                            placeholder="Información adicional del estudiante..."
                            className="border-[#E5E7EB] resize-none h-20"
                        />
                    </div>

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
                            className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
                        >
                            {isEditing ? "Guardar cambios" : "Crear estudiante"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}