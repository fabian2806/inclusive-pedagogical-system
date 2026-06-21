"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Settings,
  CalendarDays,
  CheckCircle,
  XCircle,
  Save,
  BookOpen,
  Users,
  AlertTriangle,
  Mail,
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
import { useApiQuery } from "@/hooks/useApiQuery"
import { configuracionService } from "@/lib/api/configuracionService"
import { alumnosService } from "@/lib/api/alumnosService"
import type { ErrorResponse } from "@/types/api"
import { AxiosError } from "axios"

export default function AdminConfig() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.rol !== "admin") {
      navigate("/dashboard")
    }
  }, [user, navigate])

  if (user?.rol !== "admin") {
    return null
  }

  // Cargar periodo vigente y alumnos activos
  const fetchPeriodo = useCallback(() => configuracionService.obtenerPeriodoVigente(), [])
  const fetchAlumnos = useCallback(() => alumnosService.listar(), [])
  const fetchContacto = useCallback(() => configuracionService.obtenerContactoAdmin(), [])
  const { data: periodoData, isLoading: loadingPeriodo, refetch: refetchPeriodo } = useApiQuery(fetchPeriodo)
  const { data: alumnos, isLoading: loadingAlumnos } = useApiQuery(fetchAlumnos)
  const { data: contactoData, isLoading: loadingContacto, refetch: refetchContacto } = useApiQuery(fetchContacto)

  const alumnosActivos = alumnos?.filter(a => a.estado === "ACTIVO").length ?? 0

  const [periodoInput, setPeriodoInput] = useState("")
  const [savedMessage, setSavedMessage] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Dialog states
  const [dialogApertura, setDialogApertura] = useState(false)
  const [dialogCierre, setDialogCierre] = useState(false)
  const [loadingApertura, setLoadingApertura] = useState(false)
  const [loadingCierre, setLoadingCierre] = useState(false)
  const [resultadoApertura, setResultadoApertura] = useState<number | null>(null)
  const [resultadoCierre, setResultadoCierre] = useState<number | null>(null)

  // Contacto del administrador
  const [correoInput, setCorreoInput] = useState("")
  const [telefonoInput, setTelefonoInput] = useState("")
  const [loadingSaveContacto, setLoadingSaveContacto] = useState(false)
  const [savedContacto, setSavedContacto] = useState(false)

  // Sincronizar estado cuando se carga el periodo
  useEffect(() => {
    if (periodoData) {
      setPeriodoInput(periodoData.periodoLectivoVigente)
    }
  }, [periodoData])

  // Sincronizar estado cuando se carga el contacto
  useEffect(() => {
    if (contactoData) {
      setCorreoInput(contactoData.correo ?? "")
      setTelefonoInput(contactoData.telefono ?? "")
    }
  }, [contactoData])

  const periodoVigente = periodoData?.periodoLectivoVigente ?? ""
  const periodoAbierto = periodoData?.periodoAbierto ?? false
  const expedientesActivos = periodoData?.expedientesActivos ?? 0

  const extraerError = (err: unknown): string => {
    if (err instanceof AxiosError) {
      const apiError = err.response?.data as ErrorResponse | undefined
      return apiError?.mensaje ?? err.message
    }
    return "Error inesperado"
  }

  const handleGuardarPeriodo = async () => {
    if (!periodoInput || periodoInput.length !== 4) return
    setLoadingSave(true)
    setErrorMessage(null)
    try {
      await configuracionService.actualizarPeriodoVigente({ periodoLectivo: periodoInput })
      refetchPeriodo()
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err) {
      setErrorMessage(extraerError(err))
    } finally {
      setLoadingSave(false)
    }
  }

  const handleGuardarContacto = async () => {
    if (!correoInput) return
    setLoadingSaveContacto(true)
    setErrorMessage(null)
    try {
      await configuracionService.actualizarContactoAdmin({
        correo: correoInput,
        telefono: telefonoInput || undefined,
      })
      refetchContacto()
      setSavedContacto(true)
      setTimeout(() => setSavedContacto(false), 3000)
    } catch (err) {
      setErrorMessage(extraerError(err))
    } finally {
      setLoadingSaveContacto(false)
    }
  }

  const handleAperturar = async () => {
    setLoadingApertura(true)
    setErrorMessage(null)
    try {
      const resultado = await configuracionService.aperturarPeriodo()
      setResultadoApertura(resultado.expedientesCreados)
      refetchPeriodo()
      setDialogApertura(false)
    } catch (err) {
      setErrorMessage(extraerError(err))
      setDialogApertura(false)
    } finally {
      setLoadingApertura(false)
    }
  }

  const handleCerrar = async () => {
    setLoadingCierre(true)
    setErrorMessage(null)
    try {
      const resultado = await configuracionService.cerrarPeriodo()
      setResultadoCierre(resultado.expedientesCerrados)
      refetchPeriodo()
      setDialogCierre(false)
    } catch (err) {
      setErrorMessage(extraerError(err))
      setDialogCierre(false)
    } finally {
      setLoadingCierre(false)
    }
  }

  if (loadingPeriodo || loadingAlumnos || loadingContacto) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-[#6B7280]">Cargando configuración...</p>
      </div>
    )
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

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5]">
          <AlertTriangle size={15} className="text-[#DC2626] mt-0.5 shrink-0" />
          <p className="text-xs text-[#991B1B]">{errorMessage}</p>
        </div>
      )}

      {/* Resultado apertura */}
      {resultadoApertura !== null && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
          <CheckCircle size={15} className="text-[#059669] mt-0.5 shrink-0" />
          <p className="text-xs text-[#065F46]">
            Periodo aperturado. Se crearon <span className="font-semibold">{resultadoApertura}</span> expedientes.
          </p>
        </div>
      )}

      {/* Resultado cierre */}
      {resultadoCierre !== null && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
          <CheckCircle size={15} className="text-[#D97706] mt-0.5 shrink-0" />
          <p className="text-xs text-[#92400E]">
            Periodo cerrado. Se cerraron <span className="font-semibold">{resultadoCierre}</span> expedientes.
          </p>
        </div>
      )}

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
            {periodoAbierto ? (
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
                  disabled={loadingSave}
                >
                  <Save size={15} />
                  {loadingSave ? "Guardando..." : "Guardar"}
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
              <p className="text-2xl font-bold text-[#1E3A5F]">{alumnosActivos}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-[#059669]" />
                <span className="text-xs text-[#6B7280]">Expedientes periodo</span>
              </div>
              <p className="text-2xl font-bold text-[#1E3A5F]">
                {expedientesActivos}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={16} className="text-[#D97706]" />
                <span className="text-xs text-[#6B7280]">Estado</span>
              </div>
              <p className={`text-sm font-semibold ${periodoAbierto ? "text-[#059669]" : "text-[#6B7280]"}`}>
                {periodoAbierto ? "En curso" : "Finalizado"}
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-[#F3F4F6]" />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              className="gap-2 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white"
              onClick={() => { setResultadoApertura(null); setResultadoCierre(null); setErrorMessage(null); setDialogApertura(true) }}
              disabled={periodoAbierto}
            >
              <BookOpen size={16} />
              Aperturar periodo
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              onClick={() => { setResultadoApertura(null); setResultadoCierre(null); setErrorMessage(null); setDialogCierre(true) }}
              disabled={!periodoAbierto}
            >
              <XCircle size={16} />
              Cerrar periodo
            </Button>
          </div>

          {!periodoAbierto && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
              <AlertTriangle size={15} className="text-[#D97706] mt-0.5 shrink-0" />
              <p className="text-xs text-[#92400E]">
                El periodo <span className="font-semibold">{periodoVigente}</span> esta cerrado. Para iniciar el nuevo ciclo academico, actualiza el periodo vigente y apertura el nuevo periodo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacto del administrador */}
      <Card className="border-[#E5E7EB]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#EFF6FF]">
              <Mail size={18} className="text-[#3B82F6]" />
            </div>
            <div>
              <CardTitle className="text-base text-[#1E3A5F]">Contacto del administrador</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Datos que se muestran en el login en "Olvidaste tu contrasena" y "Contacta al administrador"
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-[#374151]">Correo de contacto</Label>
              <Input
                type="email"
                placeholder="admin@signaedu.pe"
                value={correoInput}
                onChange={(e) => setCorreoInput(e.target.value)}
                className="border-[#E5E7EB] text-[#1E3A5F]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-[#374151]">Telefono (opcional)</Label>
              <Input
                type="tel"
                placeholder="Ej. +51 999 999 999"
                value={telefonoInput}
                onChange={(e) => setTelefonoInput(e.target.value)}
                className="border-[#E5E7EB] text-[#1E3A5F]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGuardarContacto}
              variant="outline"
              className="gap-2 border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]"
              disabled={loadingSaveContacto}
            >
              <Save size={15} />
              {loadingSaveContacto ? "Guardando..." : "Guardar contacto"}
            </Button>
            {savedContacto && (
              <span className="flex items-center gap-1 text-sm text-[#059669]">
                <CheckCircle size={14} />
                Guardado
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Aperturar */}
      <Dialog open={dialogApertura} onOpenChange={setDialogApertura}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-[#1E3A5F] flex items-center gap-2">
              <BookOpen size={18} className="text-[#3B82F6]" />
              Aperturar periodo {periodoVigente}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-[#374151]">
              Esta accion creara expedientes del periodo{" "}
              <span className="font-semibold text-[#1E3A5F]">{periodoVigente}</span> para todos los
              alumnos activos del sistema.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE]">
              <Users size={20} className="text-[#3B82F6] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1E3A5F]">
                  {alumnosActivos} alumnos activos
                </p>
                <p className="text-xs text-[#6B7280]">
                  Se crearan hasta {alumnosActivos} expedientes nuevos
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
                  Los expedientes activos seran cerrados
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
