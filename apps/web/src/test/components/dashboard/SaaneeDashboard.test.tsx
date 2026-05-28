import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import SaaneeDashboard from '@/components/dashboard/SaaneeDashboard'
import { dashboardService } from '@/lib/api/dashboardService'
import { eventosService } from '@/lib/api/eventosService'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import type { User } from '@/types/auth'
import type { EventoResponse } from '@/types/api'

vi.mock('@/lib/api/dashboardService')
vi.mock('@/lib/api/eventosService')

const mockedDashboard = vi.mocked(dashboardService)
const mockedEventos = vi.mocked(eventosService)

beforeEach(() => {
  vi.clearAllMocks()
  mockedEventos.listar.mockResolvedValue([])
})

const saanee: User = {
  id: 77, nombre: 'Roberto', apellido: 'Quispe', correo: 'roberto@test.com',
  telefono: null, rol: 'saanee', authorities: [],
}

function eventoFake(opts: Partial<EventoResponse> & { id: number }): EventoResponse {
  return {
    id: opts.id,
    titulo: opts.titulo ?? 'Solicitud apoyo SAANEE',
    descripcion: null,
    fechaInicio: opts.fechaInicio ?? new Date(Date.now() + 24 * 3600_000).toISOString(),
    fechaFin: opts.fechaFin ?? new Date(Date.now() + 25 * 3600_000).toISOString(),
    tipoEvento: opts.tipoEvento ?? 'SOLICITUD_APOYO_SAANEE',
    modalidad: 'PRESENCIAL',
    ubicacion: 'Sala SAANEE',
    estado: opts.estado ?? 'ACTIVO',
    motivoCancelacion: null,
    alumno: { id: 7, nombre: 'Sofía', apellido: 'Rodríguez', grado: '3ro', seccion: 'A' },
    usuarioCreador: { id: 1, nombre: 'María', apellido: 'Castro', rol: 'DOCENTE' },
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: null,
    invitados: opts.invitados ?? [],
  }
}

function render() {
  return renderWithProviders(<SaaneeDashboard userName="Roberto Quispe" />, {
    route: '/dashboard',
    user: saanee,
  })
}

describe('SaaneeDashboard', () => {
  it('muestra KPI "Estudiantes activos" con total real del sistema', async () => {
    mockedDashboard.getSaaneeResumen.mockResolvedValue({ totalAlumnosActivos: 50 })

    render()

    await waitFor(() => {
      expect(screen.getByText('Estudiantes activos')).toBeInTheDocument()
    })
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText(/En seguimiento global/i)).toBeInTheDocument()
  })

  it('KPI Solicitudes activas muestra 0 cuando no hay solicitudes pendientes', async () => {
    mockedDashboard.getSaaneeResumen.mockResolvedValue({ totalAlumnosActivos: 0 })

    render()

    await waitFor(() => {
      expect(screen.getByText('Solicitudes activas')).toBeInTheDocument()
    })
    expect(screen.getByText(/Sin solicitudes pendientes/i)).toBeInTheDocument()
  })

  it('KPI Solicitudes activas + sección Solicitudes de apoyo cuentan solo SOLICITUD_APOYO_SAANEE pendientes para este SAANEE', async () => {
    mockedDashboard.getSaaneeResumen.mockResolvedValue({ totalAlumnosActivos: 0 })
    mockedEventos.listar.mockResolvedValue([
      // SOLICITUD pendiente para id=77: SI cuenta.
      eventoFake({
        id: 1,
        titulo: 'Evaluacion auditiva Sofia',
        tipoEvento: 'SOLICITUD_APOYO_SAANEE',
        invitados: [
          {
            id: 100,
            usuario: { id: 77, nombre: 'Roberto', apellido: 'Quispe', rol: 'SAANEE' },
            estadoAsistencia: 'PENDIENTE',
            fechaRespuesta: null,
            motivoRechazo: null,
          },
        ],
      }),
      // SOLICITUD ya confirmada por este SAANEE: NO cuenta como pendiente.
      eventoFake({
        id: 2,
        titulo: 'Solicitud ya confirmada',
        tipoEvento: 'SOLICITUD_APOYO_SAANEE',
        invitados: [
          {
            id: 101,
            usuario: { id: 77, nombre: 'Roberto', apellido: 'Quispe', rol: 'SAANEE' },
            estadoAsistencia: 'CONFIRMADO',
            fechaRespuesta: new Date().toISOString(),
            motivoRechazo: null,
          },
        ],
      }),
      // REUNION_PADRES donde este SAANEE no es invitado: NO cuenta.
      eventoFake({
        id: 3,
        titulo: 'Reunión familiar',
        tipoEvento: 'REUNION_PADRES',
        invitados: [],
      }),
    ])

    render()

    await waitFor(() => {
      expect(screen.getByText(/Pendientes de tu respuesta/i)).toBeInTheDocument()
    })
    // El KPI Solicitudes activas debe contar 1 (solo el evento pendiente
    // para este SAANEE; no la solicitud ya confirmada ni la reunion de
    // otra familia donde no es invitado).
    const kpiPendientes = screen.getByText(/Pendientes de tu respuesta/i)
    const kpiCard = kpiPendientes.closest('[data-slot=card]') as HTMLElement
    expect(kpiCard).toBeTruthy()
    expect(kpiCard.textContent).toContain('1')

    // La solicitud pendiente aparece dos veces: en la lista de Solicitudes
    // de apoyo Y en Proximos eventos. La confirmada aparece solo en Proximos
    // (no es pendiente). La reunion familiar no es invitado, no aparece.
    expect(screen.getAllByText('Evaluacion auditiva Sofia')).toHaveLength(2)
    expect(screen.getByText('Solicitud ya confirmada')).toBeInTheDocument()
    expect(screen.queryByText('Reunión familiar')).not.toBeInTheDocument()
  })

  it('Próximos eventos lista cualquier tipo donde el SAANEE es invitado, no solo SOLICITUDes', async () => {
    mockedDashboard.getSaaneeResumen.mockResolvedValue({ totalAlumnosActivos: 0 })
    mockedEventos.listar.mockResolvedValue([
      // SOLICITUD donde es invitado: SI cuenta en proximos eventos.
      eventoFake({
        id: 1,
        titulo: 'Solicitud invitado',
        tipoEvento: 'SOLICITUD_APOYO_SAANEE',
        invitados: [
          {
            id: 100,
            usuario: { id: 77, nombre: 'Roberto', apellido: 'Quispe', rol: 'SAANEE' },
            estadoAsistencia: 'CONFIRMADO',
            fechaRespuesta: new Date().toISOString(),
            motivoRechazo: null,
          },
        ],
      }),
      // Evento donde NO es invitado: NO cuenta.
      eventoFake({
        id: 2,
        titulo: 'Evento ajeno',
        tipoEvento: 'SOLICITUD_APOYO_SAANEE',
        invitados: [],
      }),
    ])

    render()

    await waitFor(() => {
      expect(screen.getByText('Próximos eventos')).toBeInTheDocument()
    })
    expect(screen.getByText('Solicitud invitado')).toBeInTheDocument()
    expect(screen.queryByText('Evento ajeno')).not.toBeInTheDocument()
  })

  it('muestra mensaje de error si el fetch del resumen falla', async () => {
    mockedDashboard.getSaaneeResumen.mockRejectedValue(new Error('Falla servidor'))

    render()

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el resumen/i)).toBeInTheDocument()
    })
  })
})
