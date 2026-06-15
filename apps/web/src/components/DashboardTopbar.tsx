import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Bell, Calendar as CalendarIcon, FileText, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { notificacionesService } from '@/lib/api'
import type { NotificacionResponse, TipoNotificacion } from '@/types/api'

// Mapa de prefijos de ruta → título de sección. Se evalúa del más específico
// al más general (el primero que matchea gana), por eso "/dashboard" va al final
// como fallback. Sustituye al search bar mock que vivía en el navbar.
const SECTION_TITLES: ReadonlyArray<readonly [string, string]> = [
  ['/dashboard/admin/usuarios', 'Usuarios'],
  ['/dashboard/admin/estudiantes', 'Estudiantes'],
  ['/dashboard/admin/tipos-documento', 'Tipos de Documento'],
  ['/dashboard/admin/configuracion', 'Configuración'],
  ['/dashboard/estudiantes', 'Estudiantes'],
  ['/dashboard/indicadores', 'Indicadores'],
  ['/dashboard/eventos', 'Eventos'],
  ['/dashboard', 'Inicio'],
]

function sectionTitle(pathname: string): string {
  const match = SECTION_TITLES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'),
  )
  return match ? match[1] : 'SignaEdu'
}

export function DashboardTopbar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const titulo = sectionTitle(pathname)

  const [currentDate, setCurrentDate] = useState<string>('')
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    )
  }, [])

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-[#E5E7EB] bg-white px-4">
      <SidebarTrigger className="text-[#6B7280] hover:text-[#1E3A5F]" />

      {/* Título de la sección actual (reemplaza el search bar mock). */}
      <h1 className="flex-1 text-base font-semibold text-[#1E3A5F] truncate">{titulo}</h1>

      {/* Notificaciones: solo visibles para docente / padre / SAANEE.
          Admin no tiene NOTIFICACION_LEER en RBAC; ocultar evita 403. */}
      {user?.rol !== 'admin' && <NotificacionesBell />}

      {currentDate && (
        <div className="hidden sm:block text-xs text-[#6B7280] capitalize">
          {currentDate}
        </div>
      )}
    </header>
  )
}

// ─── Bell con dropdown conectado al backend ───────────────────────────────────

function NotificacionesBell() {
  const [open, setOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState<NotificacionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [marcando, setMarcando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await notificacionesService.listarMias()
      setNotificaciones(data)
    } catch {
      setError('No se pudieron cargar las notificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial: necesaria para que el badge muestre el conteo correcto sin
  // que el usuario abra el dropdown.
  useEffect(() => {
    cargar()
  }, [cargar])

  // Al abrir el dropdown refrescamos para tener el ultimo estado en pantalla.
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) cargar()
  }

  const noLeidas = useMemo(
    () => notificaciones.filter((n) => n.fechaLectura === null).length,
    [notificaciones],
  )

  const handleClickNotificacion = async (n: NotificacionResponse) => {
    if (n.fechaLectura !== null) return
    // Marcado optimista: actualizar el estado local antes del PATCH evita el
    // flicker del badge en el ida y vuelta del request.
    setNotificaciones((prev) =>
      prev.map((x) =>
        x.id === n.id ? { ...x, fechaLectura: new Date().toISOString() } : x,
      ),
    )
    try {
      await notificacionesService.marcarLeida(n.id)
    } catch {
      // Si falla revertimos para que el badge vuelva a mostrar el pendiente.
      setNotificaciones((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, fechaLectura: null } : x)),
      )
    }
  }

  const handleMarcarTodas = async () => {
    if (noLeidas === 0 || marcando) return
    setMarcando(true)
    const ahora = new Date().toISOString()
    const previo = notificaciones
    setNotificaciones((prev) =>
      prev.map((x) => (x.fechaLectura === null ? { ...x, fechaLectura: ahora } : x)),
    )
    try {
      await notificacionesService.marcarTodasLeidas()
    } catch {
      setNotificaciones(previo)
    } finally {
      setMarcando(false)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#6B7280] hover:text-[#1E3A5F]"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
          {noLeidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#EF4444] text-[10px] font-semibold text-white flex items-center justify-center">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="text-[#1E3A5F] p-0">
            Notificaciones
          </DropdownMenuLabel>
          {noLeidas > 0 && (
            <button
              type="button"
              onClick={handleMarcarTodas}
              disabled={marcando}
              className="text-[11px] text-[#3B82F6] hover:text-[#1E3A5F] disabled:opacity-50"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {loading && (
          <div className="py-6 flex items-center justify-center text-[#6B7280] gap-2">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Cargando…</span>
          </div>
        )}

        {!loading && error && (
          <div className="py-4 px-3 text-xs text-[#DC2626]">{error}</div>
        )}

        {!loading && !error && notificaciones.length === 0 && (
          <div className="py-6 text-center text-xs text-[#9CA3AF]">
            No tienes notificaciones.
          </div>
        )}

        {!loading && !error &&
          notificaciones.map((n) => (
            <NotificacionItem
              key={n.id}
              notificacion={n}
              onClick={() => handleClickNotificacion(n)}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificacionItem({
  notificacion,
  onClick,
}: {
  notificacion: NotificacionResponse
  onClick: () => void
}) {
  const noLeida = notificacion.fechaLectura === null
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-[#F9FAFB] transition-colors ${
        noLeida ? 'bg-[#EFF6FF]' : ''
      }`}
    >
      <IconoReferencia tipo={notificacion.referenciaTipo} />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-tight ${
            noLeida ? 'font-medium text-[#1E3A5F]' : 'text-[#6B7280]'
          }`}
        >
          {notificacion.mensaje}
        </p>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
          {formatearTiempoRelativo(notificacion.fechaCreacion)}
        </p>
      </div>
      {noLeida && (
        <span
          aria-hidden
          className="mt-1.5 h-2 w-2 rounded-full bg-[#3B82F6] shrink-0"
        />
      )}
    </button>
  )
}

function IconoReferencia({ tipo }: { tipo: TipoNotificacion }) {
  const Icono = tipo === 'EVENTO' ? CalendarIcon : tipo === 'ENTRADA_EXPD' ? FileText : Bell
  return (
    <div className="mt-0.5 h-7 w-7 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
      <Icono size={14} className="text-[#6B7280]" />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatearTiempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.round(diffMs / 60_000)
  if (min < 1) return 'Justo ahora'
  if (min < 60) return `Hace ${min} ${min === 1 ? 'minuto' : 'minutos'}`
  const h = Math.round(min / 60)
  if (h < 24) return `Hace ${h} ${h === 1 ? 'hora' : 'horas'}`
  const d = Math.round(h / 24)
  if (d < 7) return `Hace ${d} ${d === 1 ? 'día' : 'días'}`
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}
