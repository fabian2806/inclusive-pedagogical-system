import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResponderAsistenciaPanel } from '@/components/events/ResponderAsistenciaPanel'
import { eventosService } from '@/lib/api'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import type {
  EventoResponse,
  EventoUsuarioResponse,
  EstadoAsistencia,
  EstadoEvento,
} from '@/types/api'

vi.mock('@/lib/api/eventosService')

const mockedEventos = vi.mocked(eventosService)

beforeEach(() => {
  vi.clearAllMocks()
})

function eventoFake(opts: {
  estado?: EstadoEvento
  fechaInicio?: string
} = {}): EventoResponse {
  return {
    id: 1,
    titulo: 'Reunion',
    descripcion: null,
    fechaInicio: opts.fechaInicio ?? new Date(Date.now() + 24 * 3600_000).toISOString(),
    fechaFin: new Date(Date.now() + 25 * 3600_000).toISOString(),
    tipoEvento: 'REUNION_PADRES',
    modalidad: 'PRESENCIAL',
    ubicacion: 'Sala A',
    estado: opts.estado ?? 'ACTIVO',
    motivoCancelacion: null,
    alumno: { id: 7, nombre: 'Sofia', apellido: 'R', grado: '3ro', seccion: 'A' },
    usuarioCreador: { id: 1, nombre: 'Maria', apellido: 'Castro', rol: 'DOCENTE' },
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: null,
    invitados: [],
  }
}

function invitadoFake(estado: EstadoAsistencia): EventoUsuarioResponse {
  return {
    id: 100,
    usuario: { id: 42, nombre: 'Laura', apellido: 'Diaz', rol: 'PADRE' },
    estadoAsistencia: estado,
    fechaRespuesta: estado === 'PENDIENTE' ? null : new Date().toISOString(),
    motivoRechazo: estado === 'RECHAZADO' ? 'No disponibilidad' : null,
  }
}

function render(props: {
  evento?: EventoResponse
  invitado: EventoUsuarioResponse
  onResponded?: () => void
}) {
  return renderWithProviders(
    <ResponderAsistenciaPanel
      evento={props.evento ?? eventoFake()}
      invitado={props.invitado}
      onResponded={props.onResponded ?? (() => {})}
    />,
    { route: '/dashboard/eventos' },
  )
}

describe('ResponderAsistenciaPanel', () => {
  it('PENDIENTE: muestra ambos botones Confirmar y Rechazar', () => {
    render({ invitado: invitadoFake('PENDIENTE') })

    expect(screen.getByRole('button', { name: /Confirmar/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Rechazar/i })).toBeEnabled()
  })

  it('CONFIRMADO: boton Confirmar queda deshabilitado y muestra pista positiva', () => {
    render({ invitado: invitadoFake('CONFIRMADO') })

    expect(screen.getByRole('button', { name: /Confirmado/i })).toBeDisabled()
    expect(screen.getByText(/Confirmaste tu asistencia/i)).toBeInTheDocument()
  })

  it('RECHAZADO: boton Rechazar dice Cambiar motivo y se permite cambiar a Confirmar', () => {
    render({ invitado: invitadoFake('RECHAZADO') })

    expect(screen.getByRole('button', { name: /Cambiar motivo/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /Confirmar asistencia/i })).toBeEnabled()
    expect(screen.getByText(/Rechazaste la invitacion|Rechazaste la invitación/i)).toBeInTheDocument()
  })

  it('evento CANCELADO: solo muestra badge de estado, sin botones de accion', () => {
    render({
      evento: eventoFake({ estado: 'CANCELADO' }),
      invitado: invitadoFake('PENDIENTE'),
    })

    expect(screen.queryByRole('button', { name: /Confirmar asistencia/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Rechazar/i })).not.toBeInTheDocument()
    expect(screen.getByText(/Tu respuesta/i)).toBeInTheDocument()
  })

  it('fechaInicio ya paso: solo muestra badge, sin botones', () => {
    render({
      evento: eventoFake({ fechaInicio: new Date(Date.now() - 3600_000).toISOString() }),
      invitado: invitadoFake('PENDIENTE'),
    })

    expect(screen.queryByRole('button', { name: /Confirmar asistencia/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Rechazar/i })).not.toBeInTheDocument()
  })

  it('Confirmar dispara responder con estado CONFIRMADO y onResponded en exito', async () => {
    const user = userEvent.setup()
    const onResponded = vi.fn()
    mockedEventos.responder.mockResolvedValue(eventoFake())

    render({ invitado: invitadoFake('PENDIENTE'), onResponded })

    await user.click(screen.getByRole('button', { name: /Confirmar asistencia/i }))

    await waitFor(() => {
      expect(mockedEventos.responder).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ estadoAsistencia: 'CONFIRMADO' }),
      )
    })
    expect(onResponded).toHaveBeenCalledOnce()
  })

  it('Rechazar abre sub-dialog con opciones de motivo', async () => {
    const user = userEvent.setup()
    render({ invitado: invitadoFake('PENDIENTE') })

    await user.click(screen.getByRole('button', { name: /Rechazar/i }))

    await waitFor(() => {
      expect(screen.getByText(/Por qué rechazas|Por que rechazas/i)).toBeInTheDocument()
    })
  })
})
