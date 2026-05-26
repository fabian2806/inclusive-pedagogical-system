import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import SaaneeDashboard from '@/components/dashboard/SaaneeDashboard'
import { dashboardService } from '@/lib/api/dashboardService'
import { renderWithProviders } from '../../helpers/renderWithProviders'

vi.mock('@/lib/api/dashboardService')

const mockedDashboard = vi.mocked(dashboardService)

beforeEach(() => {
  vi.clearAllMocks()
})

function render() {
  return renderWithProviders(<SaaneeDashboard userName="Roberto Quispe" />, { route: '/dashboard' })
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

  it('muestra KPI "Solicitudes activas" como placeholder Fase 4 (sin valor real)', async () => {
    mockedDashboard.getSaaneeResumen.mockResolvedValue({ totalAlumnosActivos: 0 })

    render()

    await waitFor(() => {
      expect(screen.getByText('Solicitudes activas')).toBeInTheDocument()
    })
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText(/Disponible en Fase 4/i)).toBeInTheDocument()
  })

  it('muestra sección "Solicitudes de apoyo" como placeholder Fase 4 (sin solicitudes mock)', async () => {
    mockedDashboard.getSaaneeResumen.mockResolvedValue({ totalAlumnosActivos: 0 })

    render()

    await waitFor(() => {
      expect(screen.getByText('Solicitudes de apoyo')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/La gestión de solicitudes de apoyo se incorpora junto al módulo de coordinación/i),
    ).toBeInTheDocument()
    // No deben aparecer las solicitudes hardcoded del v0
    expect(screen.queryByText(/Evaluación auditiva — Sofía Rodríguez/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Ajuste de estrategias LSP/i)).not.toBeInTheDocument()
  })

  it('muestra sección "Próximos eventos" como placeholder Fase 4', async () => {
    mockedDashboard.getSaaneeResumen.mockResolvedValue({ totalAlumnosActivos: 0 })

    render()

    await waitFor(() => {
      expect(screen.getByText('Próximos eventos')).toBeInTheDocument()
    })
    expect(screen.getByText(/La gestión de eventos llegará en una fase posterior/i)).toBeInTheDocument()
  })

  it('muestra mensaje de error si el fetch del resumen falla', async () => {
    mockedDashboard.getSaaneeResumen.mockRejectedValue(new Error('Falla servidor'))

    render()

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el resumen/i)).toBeInTheDocument()
    })
  })
})
