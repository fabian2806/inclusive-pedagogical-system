import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import ParentDashboard from '@/components/dashboard/ParentDashboard'
import { dashboardService } from '@/lib/api/dashboardService'
import { eventosService } from '@/lib/api/eventosService'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import type { User } from '@/types/auth'
import type { EventoResponse, HijoResumen } from '@/types/api'

vi.mock('@/lib/api/dashboardService')
vi.mock('@/lib/api/eventosService')

const mockedService = vi.mocked(dashboardService)
const mockedEventos = vi.mocked(eventosService)

beforeEach(() => {
  vi.clearAllMocks()
  mockedEventos.listar.mockResolvedValue([])
})

const padre: User = {
  id: 42, nombre: 'Laura', apellido: 'Diaz', correo: 'laura@test.com',
  telefono: null, rol: 'padre', authorities: [],
}

function hijoFake(id: number, nombre: string, expedienteId: number | null = 100): HijoResumen {
  return {
    id, nombre, apellido: 'Rodriguez', grado: '3ro', seccion: 'A', expedienteId,
  }
}

function eventoFake(opts: Partial<EventoResponse> & { id: number }): EventoResponse {
  return {
    id: opts.id,
    titulo: opts.titulo ?? 'Reunión con familia Rodríguez',
    descripcion: null,
    fechaInicio: opts.fechaInicio ?? new Date(Date.now() + 24 * 3600_000).toISOString(),
    fechaFin: opts.fechaFin ?? new Date(Date.now() + 25 * 3600_000).toISOString(),
    tipoEvento: 'REUNION_PADRES',
    modalidad: 'PRESENCIAL',
    ubicacion: 'Sala A',
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
  return renderWithProviders(<ParentDashboard userName="Laura Diaz" />, {
    route: '/dashboard',
    user: padre,
  })
}

describe('ParentDashboard', () => {
  it('muestra KPIs con datos reales', async () => {
    mockedService.getPadreResumen.mockResolvedValue({
      hijos: [hijoFake(1, 'Sofía'), hijoFake(2, 'Carlos')],
      entradasNuevasHoy: 4,
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('Hijos registrados')).toBeInTheDocument()
    })
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Entradas nuevas hoy')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renderiza tarjeta por cada hijo con link al expediente y al perfil', async () => {
    mockedService.getPadreResumen.mockResolvedValue({
      hijos: [hijoFake(7, 'Sofía')],
      entradasNuevasHoy: 0,
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('Sofía Rodriguez')).toBeInTheDocument()
    })
    const expedienteLink = screen.getByText('Expediente').closest('a')
    expect(expedienteLink).toHaveAttribute('href', '/dashboard/estudiantes/7/expediente')
    const perfilLink = screen.getByText('Perfil').closest('a')
    expect(perfilLink).toHaveAttribute('href', '/dashboard/estudiantes/7/perfil')
  })

  it('muestra badge "Sin expediente vigente" cuando expedienteId es null', async () => {
    mockedService.getPadreResumen.mockResolvedValue({
      hijos: [hijoFake(7, 'Sofía', null)],
      entradasNuevasHoy: 0,
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('Sin expediente vigente')).toBeInTheDocument()
    })
  })

  it('muestra empty state cuando no hay hijos vinculados', async () => {
    mockedService.getPadreResumen.mockResolvedValue({
      hijos: [],
      entradasNuevasHoy: 0,
    })

    render()

    await waitFor(() => {
      expect(screen.getByText(/Aún no tienes hijos vinculados/i)).toBeInTheDocument()
    })
  })

  it('Reuniones por confirmar muestra empty state cuando no hay invitaciones PENDIENTES', async () => {
    mockedService.getPadreResumen.mockResolvedValue({
      hijos: [hijoFake(1, 'Sofía')],
      entradasNuevasHoy: 0,
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('Reuniones por confirmar')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/No tienes reuniones pendientes de confirmar/i),
    ).toBeInTheDocument()
  })

  it('Reuniones por confirmar lista solo eventos donde el padre es invitado PENDIENTE', async () => {
    mockedService.getPadreResumen.mockResolvedValue({
      hijos: [hijoFake(7, 'Sofía')],
      entradasNuevasHoy: 0,
    })
    mockedEventos.listar.mockResolvedValue([
      // PENDIENTE para el padre id=42: SI cuenta.
      eventoFake({
        id: 1,
        titulo: 'Reunión pendiente',
        invitados: [
          {
            id: 100,
            usuario: { id: 42, nombre: 'Laura', apellido: 'Diaz', rol: 'PADRE' },
            estadoAsistencia: 'PENDIENTE',
            fechaRespuesta: null,
            motivoRechazo: null,
          },
        ],
      }),
      // CONFIRMADO para el padre id=42: NO cuenta.
      eventoFake({
        id: 2,
        titulo: 'Reunión ya confirmada',
        invitados: [
          {
            id: 101,
            usuario: { id: 42, nombre: 'Laura', apellido: 'Diaz', rol: 'PADRE' },
            estadoAsistencia: 'CONFIRMADO',
            fechaRespuesta: new Date().toISOString(),
            motivoRechazo: null,
          },
        ],
      }),
      // PENDIENTE pero para OTRO padre: NO cuenta.
      eventoFake({
        id: 3,
        titulo: 'Reunión de otra familia',
        invitados: [
          {
            id: 102,
            usuario: { id: 99, nombre: 'Otra', apellido: 'Persona', rol: 'PADRE' },
            estadoAsistencia: 'PENDIENTE',
            fechaRespuesta: null,
            motivoRechazo: null,
          },
        ],
      }),
    ])

    render()

    await waitFor(() => {
      expect(screen.getByText('Reunión pendiente')).toBeInTheDocument()
    })
    expect(screen.queryByText('Reunión ya confirmada')).not.toBeInTheDocument()
    expect(screen.queryByText('Reunión de otra familia')).not.toBeInTheDocument()
  })

  it('muestra mensaje de error si el fetch falla', async () => {
    mockedService.getPadreResumen.mockRejectedValue(new Error('Falla servidor'))

    render()

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el resumen/i)).toBeInTheDocument()
    })
  })
})
