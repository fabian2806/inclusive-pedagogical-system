import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { TipoDocumentoFormData } from "@/types/document"

interface DocumentsFormDialogProps {
    open: boolean
    isEditing: boolean
    formData: TipoDocumentoFormData
    onChange: (data: TipoDocumentoFormData) => void
    onSave: () => void
    onCancel: () => void
}

export function DocumentsFormDialog({
    open,
    isEditing,
    formData,
    onChange,
    onSave,
    onCancel,
}: DocumentsFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-[#1E3A5F]">
                        {isEditing ? "Editar tipo de documento" : "Nuevo tipo de documento"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código *</Label>
                            <Input
                                id="codigo"
                                placeholder="Ej: CERT_AUD"
                                value={formData.codigo}
                                onChange={(e) => onChange({ ...formData, codigo: e.target.value.toUpperCase() })}
                                className="border-[#E5E7EB] font-mono"
                                disabled={isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                placeholder="Nombre del tipo"
                                value={formData.nombre}
                                onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
                                className="border-[#E5E7EB]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            placeholder="Describe el propósito de este tipo de documento..."
                            value={formData.descripcion}
                            onChange={(e) => onChange({ ...formData, descripcion: e.target.value })}
                            className="border-[#E5E7EB] min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                            <div>
                                <Label className="text-sm font-medium">Obligatorio</Label>
                                <p className="text-xs text-[#6B7280]">El estudiante debe tener este documento</p>
                            </div>
                            <Switch
                                checked={formData.esObligatorio}
                                onCheckedChange={(checked) => onChange({ ...formData, esObligatorio: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                            <div>
                                <Label className="text-sm font-medium">Versionable</Label>
                                <p className="text-xs text-[#6B7280]">Permite múltiples versiones del documento</p>
                            </div>
                            <Switch
                                checked={formData.esVersionable}
                                onCheckedChange={(checked) => onChange({ ...formData, esVersionable: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB]">
                            <div>
                                <Label className="text-sm font-medium">Periódico</Label>
                                <p className="text-xs text-[#6B7280]">Se genera en intervalos regulares</p>
                            </div>
                            <Switch
                                checked={formData.esPeriodico}
                                onCheckedChange={(checked) => onChange({ ...formData, esPeriodico: checked })}
                            />
                        </div>

                        {formData.esPeriodico && (
                            <div className="space-y-2 pl-3">
                                <Label>Periodicidad</Label>
                                <Select
                                    value={formData.periodicidad}
                                    onValueChange={(value) => onChange({ ...formData, periodicidad: value })}
                                >
                                    <SelectTrigger className="border-[#E5E7EB]">
                                        <SelectValue placeholder="Seleccionar periodicidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semanal">Semanal</SelectItem>
                                        <SelectItem value="Quincenal">Quincenal</SelectItem>
                                        <SelectItem value="Mensual">Mensual</SelectItem>
                                        <SelectItem value="Bimestral">Bimestral</SelectItem>
                                        <SelectItem value="Trimestral">Trimestral</SelectItem>
                                        <SelectItem value="Semestral">Semestral</SelectItem>
                                        <SelectItem value="Anual">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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
                        className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
                        onClick={onSave}
                        disabled={!formData.nombre || !formData.codigo}
                    >
                        {isEditing ? "Guardar cambios" : "Crear tipo"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
