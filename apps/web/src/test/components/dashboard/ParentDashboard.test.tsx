import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import ParentDashboard from '@/components/dashboard/ParentDashboard'
import { dashboardService } from '@/lib/api/dashboardService'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import type { HijoResumen } from '@/types/api'

vi.mock('@/lib/api/dashboardService')

const mockedService = vi.mocked(dashboardService)

beforeEach(() => {
  vi.clearAllMocks()
})

function hijoFake(id: number, nombre: string, expedienteId: number | null = 100): HijoResumen {
  return {
    id, nombre, apellido: 'Rodriguez', grado: '3ro', seccion: 'A', expedienteId,
  }
}

function render() {
  return renderWithProviders(<ParentDashboard userName="Laura Diaz" />, { route: '/dashboard' })
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

  it('muestra Reuniones por confirmar como placeholder Fase 4 (sin datos mock)', async () => {
    mockedService.getPadreResumen.mockResolvedValue({
      hijos: [hijoFake(1, 'Sofía')],
      entradasNuevasHoy: 0,
    })

    render()

    await waitFor(() => {
      expect(screen.getByText('Reuniones por confirmar')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/La gestión de reuniones y eventos llegará en una fase posterior/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Reunión de seguimiento trimestral/i)).not.toBeInTheDocument()
  })

  it('muestra mensaje de error si el fetch falla', async () => {
    mockedService.getPadreResumen.mockRejectedValue(new Error('Falla servidor'))

    render()

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el resumen/i)).toBeInTheDocument()
    })
  })
})
