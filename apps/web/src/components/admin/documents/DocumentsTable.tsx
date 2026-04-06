import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Edit, Lock, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react"
import type { TipoDocumento } from "@/types/document"

interface DocumentsTableProps {
    documentos: TipoDocumento[]
    onEdit: (tipo: TipoDocumento) => void
    onDelete: (id: number) => void
}

export function DocumentsTable({ documentos, onEdit, onDelete }: DocumentsTableProps) {
    return (
        <Card className="border-[#E5E7EB]">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                            <TableHead className="text-[#6B7280] font-semibold">Nombre</TableHead>
                            <TableHead className="text-[#6B7280] font-semibold">Características</TableHead>
                            <TableHead className="text-[#6B7280] font-semibold">Origen</TableHead>
                            <TableHead className="text-[#6B7280] font-semibold text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-[#9CA3AF]">
                                    No se encontraron tipos de documento
                                </TableCell>
                            </TableRow>
                        ) : (
                            documentos.map((tipo) => (
                                <TableRow key={tipo.id} className="hover:bg-[#F9FAFB]">
                                    <TableCell>
                                        <p className="font-medium text-[#1E3A5F]">{tipo.nombre}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {tipo.esObligatorio && (
                                                <Badge className="text-[10px] bg-[#ECFDF5] text-[#059669] border-transparent">
                                                    Obligatorio
                                                </Badge>
                                            )}
                                            {tipo.esVersionable && (
                                                <Badge className="text-[10px] bg-[#EEF2FF] text-[#4F46E5] border-transparent gap-1">
                                                    <RefreshCw size={10} />
                                                    Versionable
                                                </Badge>
                                            )}
                                            {tipo.esPeriodico && (
                                                <Badge className="text-[10px] bg-[#FEF3C7] text-[#D97706] border-transparent gap-1">
                                                    <Clock size={10} />
                                                    {tipo.periodicidad}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {tipo.esPredefinido ? (
                                            <Badge variant="outline" className="text-[10px] gap-1 text-[#6B7280]">
                                                <Lock size={10} />
                                                Sistema
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-[#6B7280]">Personalizado</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!tipo.esPredefinido && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onEdit(tipo)}>
                                                            <Edit size={14} className="mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(tipo.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 size={14} className="mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
