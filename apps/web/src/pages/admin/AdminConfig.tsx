"use client"

import { useEffect, useState } from "react"
import {
  Settings,
  CalendarDays,
  CheckCircle,
  XCircle,
  Save,
  BookOpen,
  Users,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

// Mock data
const ALUMNOS_ACTIVOS = 24
const PERIODO_VIGENTE_INICIAL = "2025"

type PeriodoEstado = "abierto" | "cerrado"


export default function AdminConfig() {
  const { user } = useAuth()
  const navigate = useNavigate()

    // Derigir a dashboard si el usuario no es admin (esto es solo para seguridad adicional, el sidebar ya oculta esta opcion a usuarios no admin)
    useEffect(() => {
        if (user?.rol !== "admin") {
            navigate("/dashboard")
        }
    }, [user, navigate])

    if (user?.rol !== "admin") {
        return null
    }

  const [periodoVigente, setPeriodoVigente] = useState(PERIODO_VIGENTE_INICIAL)
  const [periodoInput, setPeriodoInput] = useState(PERIODO_VIGENTE_INICIAL)
  const [periodoEstado, setPeriodoEstado] = useState<PeriodoEstado>("abierto")
  const [savedMessage, setSavedMessage] = useState(false)

  // Dialog states
  const [dialogApertura, setDialogApertura] = useState(false)
  const [dialogCierre, setDialogCierre] = useState(false)
  const [loadingApertura, setLoadingApertura] = useState(false)
  const [loadingCierre, setLoadingCierre] = useState(false)

  const handleGuardarPeriodo = () => {
    if (!periodoInput || periodoInput.length !== 4) return
    setPeriodoVigente(periodoInput)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  const handleAperturar = () => {
    setLoadingApertura(true)
    setTimeout(() => {
      setPeriodoEstado("abierto")
      setPeriodoVigente(periodoInput)
      setLoadingApertura(false)
      setDialogApertura(false)
    }, 1500)
  }

  const handleCerrar = () => {
    setLoadingCierre(true)
    setTimeout(() => {
      setPeriodoEstado("cerrado")
      setLoadingCierre(false)
      setDialogCierre(false)
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-[#EEF2FF]">
          <Settings size={22} className="text-[#3B82F6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Configuracion del Sistema</h1>
          <p className="text-sm text-[#6B7280]">Gestiona los parametros generales del sistema</p>
        </div>
      </div>

      {/* Periodo Lectivo */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FEF3C7]">
                <CalendarDays size={18} className="text-[#D97706]" />
              </div>
              <div>
                <CardTitle className="text-base text-[#1E3A5F]">Periodo Lectivo</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Controla el periodo academico vigente y la apertura o cierre de expedientes
                </CardDescription>
              </div>
            </div>
            {periodoEstado === "abierto" ? (
              <Badge className="gap-1.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] hover:bg-[#ECFDF5]">
                <CheckCircle size={12} />
                Periodo abierto
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 text-[#6B7280] border-[#D1D5DB]">
                <XCircle size={12} />
                Periodo cerrado
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Periodo input */}
          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-[#374151]">Periodo vigente</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="2000"
                  max="2099"
                  value={periodoInput}
                  onChange={(e) => setPeriodoInput(e.target.value)}
                  className="w-32 border-[#E5E7EB] text-[#1E3A5F] font-semibold text-center text-lg"
                />
                <Button
                  onClick={handleGuardarPeriodo}
                  variant="outline"
                  className="gap-2 border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]"
                >
                  <Save size={15} />
                  Guardar
                </Button>
                {savedMessage && (
                  <span className="flex items-center gap-1 text-sm text-[#059669]">
                    <CheckCircle size={14} />
                    Guardado
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Periodo actual en el sistema:{" "}
                <span className="font-semibold text-[#1E3A5F]">{periodoVigente}</span>
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-[#F3F4F6]" />

          {/* Fila de estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-[#3B82F6]" />
                <span className="text-xs text-[#6B7280]">Alumnos activos</span>
              </div>
              <p className="text-2xl font-bold text-[#1E3A5F]">{ALUMNOS_ACTIVOS}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-[#059669]" />
                <span className="text-xs text-[#6B7280]">Expedientes periodo</span>
              </div>
              <p className="text-2xl font-bold text-[#1E3A5F]">
                {periodoEstado === "abierto" ? ALUMNOS_ACTIVOS : 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={16} className="text-[#D97706]" />
                <span className="text-xs text-[#6B7280]">Estado</span>
              </div>
              <p className={`text-sm font-semibold ${periodoEstado === "abierto" ? "text-[#059669]" : "text-[#6B7280]"}`}>
                {periodoEstado === "abierto" ? "En curso" : "Finalizado"}
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-[#F3F4F6]" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
              onClick={() => setDialogApertura(true)}
              disabled={periodoEstado === "abierto"}
            >
              <BookOpen size={16} />
              Aperturar periodo
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              onClick={() => setDialogCierre(true)}
              disabled={periodoEstado === "cerrado"}
            >
              <XCircle size={16} />
              Cerrar periodo
            </Button>
          </div>

          {periodoEstado === "cerrado" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
              <AlertTriangle size={15} className="text-[#D97706] mt-0.5 shrink-0" />
              <p className="text-xs text-[#92400E]">
                El periodo <span className="font-semibold">{periodoVigente}</span> esta cerrado. Para iniciar el nuevo ciclo academico, actualiza el periodo vigente y apertura el nuevo periodo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Aperturar */}
      <Dialog open={dialogApertura} onOpenChange={setDialogApertura}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#1E3A5F] flex items-center gap-2">
              <BookOpen size={18} className="text-[#3B82F6]" />
              Aperturar periodo {periodoInput}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#374151]">
              Esta accion creara expedientes del periodo{" "}
              <span className="font-semibold text-[#1E3A5F]">{periodoInput}</span> para todos los
              alumnos activos del sistema.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE]">
              <Users size={20} className="text-[#3B82F6] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1E3A5F]">
                  {ALUMNOS_ACTIVOS} alumnos activos
                </p>
                <p className="text-xs text-[#6B7280]">
                  Se crearan {ALUMNOS_ACTIVOS} expedientes nuevos
                </p>
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">
              Los expedientes de periodos anteriores no se veran afectados.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogApertura(false)}
              className="border-[#E5E7EB] text-[#374151]"
              disabled={loadingApertura}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAperturar}
              className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
              disabled={loadingApertura}
            >
              {loadingApertura ? "Aperturando..." : "Confirmar apertura"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cerrar periodo */}
      <Dialog open={dialogCierre} onOpenChange={setDialogCierre}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#1E3A5F] flex items-center gap-2">
              <XCircle size={18} className="text-[#DC2626]" />
              Cerrar periodo {periodoVigente}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#374151]">
              Esta accion cerrara todos los expedientes activos del periodo{" "}
              <span className="font-semibold text-[#1E3A5F]">{periodoVigente}</span>. Esta operacion
              no se puede deshacer.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5]">
              <AlertTriangle size={20} className="text-[#DC2626] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#DC2626]">
                  {ALUMNOS_ACTIVOS} expedientes seran cerrados
                </p>
                <p className="text-xs text-[#6B7280]">
                  Los expedientes pasaran al estado "cerrado" y no podran editarse
                </p>
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">
              Asegurate de que todos los informes y documentos del periodo esten completos antes de cerrar.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogCierre(false)}
              className="border-[#E5E7EB] text-[#374151]"
              disabled={loadingCierre}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCerrar}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
              disabled={loadingCierre}
            >
              {loadingCierre ? "Cerrando..." : "Confirmar cierre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
