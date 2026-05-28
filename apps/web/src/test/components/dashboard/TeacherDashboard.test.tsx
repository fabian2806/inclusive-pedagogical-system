import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import TeacherDashboard from '@/components/dashboard/TeacherDashboard'
import { dashboardService } from '@/lib/api/dashboardService'
import { alumnosService } from '@/lib/api/alumnosService'
import { eventosService } from '@/lib/api/eventosService'
import { notificacionesService } from '@/lib/api/notificacionesService'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import type { ActividadEntradaResponse, AlumnoResponse } from '@/types/api'

vi.mock('@/lib/api/dashboardService')
vi.mock('@/lib/api/alumnosService')
vi.mock('@/lib/api/eventosService')
vi.mock('@/lib/api/notificacionesService')

const mockedDashboard = vi.mocked(dashboardService)
const mockedAlumnos = vi.mocked(alumnosService)
const mockedEventos = vi.mocked(eventosService)
const mockedNotificaciones = vi.mocked(notificacionesService)

beforeEach(() => {
  vi.clearAllMocks()
  // Default: sin eventos ni notificaciones para que cada test setee lo que necesite.
  mockedEventos.listar.mockResolvedValue([])
  mockedNotificaciones.listarMias.mockResolvedValue([])
})

function alumnoFake(id: number, nombre: string): AlumnoResponse {
  return {
    id, nombre, apellido: 'Lopez',
    idFotoPerfil: null,
    fechaNacimiento: '2015-01-01',
    grado: '3ro',
    seccion: 'A',
    estado: 'ACTIVO',
    docentes: [], padres: [],
  }
}

function entradaFake(id: number): ActividadEntradaResponse {
  return {
    id,
    tipo: 'COMUNICACION_FAMILIAR',
    fecha: new Date(Date.now() - 30 * 60_000).toISOString(),
    autor: { id: 2, nombre: 'Padre', apellido: 'X', rol: 'PADRE' },
    alumnoId: 7,
    alumnoNombre: 'Carlos',
    alumnoApellido: 'Lopez',
    titulo: 'Consulta sobre la tarea',
    descripcion: 'Texto largo de la entrada',
  }
}

function render() {
  return renderWithProviders(<TeacherDashboard userName="María Torres" />, { route: '/dashboard' })
}

describe('TeacherDashboard', () => {
  it('muestra los 3 KPIs reales del resumen', async () => {
    mockedDashboard.getDocenteResumen.mockResolvedValue({
      alumnosAsignados: 5,
      entradasBitacoraHoy: 3,
      alumnosSinPerfilDiscapacidad: 2,
    })
    mockedAlumnos.listar.mockResolvedValue([])
    mockedDashboard.getActividadRecienteDocente.mockResolvedValue([])

    render()

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
    expect(screen.getByText('Estudiantes asignados')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Entradas de bitácora hoy')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Estudiantes sin perfil')).toBeInTheDocument()
  })

  it('muestra Próximos eventos con estado vacío y CTA a crear cuando no hay eventos', async () => {
    mockedDashboard.getDocenteResumen.mockResolvedValue({
      alumnosAsignados: 0, entradasBitacoraHoy: 0, alumnosSinPerfilDiscapacidad: 0,
    })
    mockedAlumnos.listar.mockResolvedValue([])
    mockedDashboard.getActividadRecienteDocente.mockResolvedValue([])

    render()

    await waitFor(() => {
      expect(screen.getByText('Próximos eventos')).toBeInTheDocument()
    })
    expect(screen.getByText('Sin eventos próximos.')).toBeInTheDocument()
    // El CTA Crear evento enlaza a /dashboard/eventos.
    const crearLink = screen.getByRole('link', { name: /Crear evento/i })
    expect(crearLink).toHaveAttribute('href', '/dashboard/eventos')
  })

  it('renderiza estudiantes recientes con datos reales', async () => {
    mockedDashboard.getDocenteResumen.mockResolvedValue({
      alumnosAsignados: 2, entradasBitacoraHoy: 0, alumnosSinPerfilDiscapacidad: 0,
    })
    mockedAlumnos.listar.mockResolvedValue([
      alumnoFake(1, 'Sofía'),
      alumnoFake(2, 'Carlos'),
    ])
    mockedDashboard.getActividadRecienteDocente.mockResolvedValue([])

    render()

    await waitFor(() => {
      expect(screen.getByText('Sofía Lopez')).toBeInTheDocument()
    })
    expect(screen.getByText('Carlos Lopez')).toBeInTheDocument()
  })

  it('muestra mensaje vacío cuando el docente no tiene alumnos asignados', async () => {
    mockedDashboard.getDocenteResumen.mockResolvedValue({
      alumnosAsignados: 0, entradasBitacoraHoy: 0, alumnosSinPerfilDiscapacidad: 0,
    })
    mockedAlumnos.listar.mockResolvedValue([])
    mockedDashboard.getActividadRecienteDocente.mockResolvedValue([])

    render()

    await waitFor(() => {
      expect(screen.getByText(/Aún no tienes estudiantes asignados/i)).toBeInTheDocument()
    })
  })

  it('renderiza actividad reciente real', async () => {
    mockedDashboard.getDocenteResumen.mockResolvedValue({
      alumnosAsignados: 1, entradasBitacoraHoy: 1, alumnosSinPerfilDiscapacidad: 0,
    })
    mockedAlumnos.listar.mockResolvedValue([])
    mockedDashboard.getActividadRecienteDocente.mockResolvedValue([entradaFake(101)])

    render()

    await waitFor(() => {
      expect(screen.getByText(/Consulta sobre la tarea/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Comunicación familiar/i)).toBeInTheDocument()
    expect(screen.getByText(/por Padre X/i)).toBeInTheDocument()
  })

  it('muestra mensaje vacío cuando no hay actividad reciente', async () => {
    mockedDashboard.getDocenteResumen.mockResolvedValue({
      alumnosAsignados: 1, entradasBitacoraHoy: 0, alumnosSinPerfilDiscapacidad: 0,
    })
    mockedAlumnos.listar.mockResolvedValue([])
    mockedDashboard.getActividadRecienteDocente.mockResolvedValue([])

    render()

    await waitFor(() => {
      expect(screen.getByText(/Sin actividad reciente en tus estudiantes/i)).toBeInTheDocument()
    })
  })
})
