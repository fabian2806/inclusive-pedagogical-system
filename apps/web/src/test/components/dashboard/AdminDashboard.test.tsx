import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import { dashboardService } from '@/lib/api/dashboardService'
import { renderWithProviders } from '../../helpers/renderWithProviders'

vi.mock('@/lib/api/dashboardService')

const mockedService = vi.mocked(dashboardService)

beforeEach(() => {
  vi.clearAllMocks()
})

function render() {
  return renderWithProviders(<AdminDashboard userName="Ana Lopez" />, { route: '/dashboard' })
}

describe('AdminDashboard', () => {
  it('muestra estado de carga inicial', () => {
    mockedService.getAdminResumen.mockReturnValue(new Promise(() => {}))
    render()
    expect(screen.getByText(/Cargando resumen/i)).toBeInTheDocument()
  })

  it('muestra KPIs reales tras cargar el resumen', async () => {
    mockedService.getAdminResumen.mockResolvedValue({
      totalUsuarios: 40,
      totalAlumnosActivos: 32,
      expedientesAbiertos: 30,
      periodoVigente: '2026',
      usuariosPorRol: { ADMIN: 2, DOCENTE: 8, PADRE: 26, SAANEE: 4 },
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('40')).toBeInTheDocument()
    })
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('muestra Usuarios por rol con los counts del backend', async () => {
    mockedService.getAdminResumen.mockResolvedValue({
      totalUsuarios: 40,
      totalAlumnosActivos: 32,
      expedientesAbiertos: 30,
      periodoVigente: '2026',
      usuariosPorRol: { ADMIN: 2, DOCENTE: 8, PADRE: 26, SAANEE: 4 },
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('Docentes')).toBeInTheDocument()
    })
    expect(screen.getByText('Padres/Tutores')).toBeInTheDocument()
    expect(screen.getByText('Administradores')).toBeInTheDocument()
    expect(screen.getByText('26')).toBeInTheDocument()
  })

  it('no renderiza Tareas pendientes ni Actividad reciente del v0', async () => {
    mockedService.getAdminResumen.mockResolvedValue({
      totalUsuarios: 0,
      totalAlumnosActivos: 0,
      expedientesAbiertos: 0,
      periodoVigente: '2026',
      usuariosPorRol: { ADMIN: 0, DOCENTE: 0, PADRE: 0, SAANEE: 0 },
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('Periodo lectivo')).toBeInTheDocument()
    })
    expect(screen.queryByText(/Tareas pendientes/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Actividad reciente/i)).not.toBeInTheDocument()
  })

  it('muestra mensaje de error si el fetch falla', async () => {
    mockedService.getAdminResumen.mockRejectedValue(new Error('Falla servidor'))

    render()

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el resumen/i)).toBeInTheDocument()
    })
  })
})
