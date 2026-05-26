import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { dashboardService } from '@/lib/api/dashboardService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('dashboardService', () => {
  it('getAdminResumen consulta /dashboard/admin/resumen', async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        totalUsuarios: 40,
        totalAlumnosActivos: 32,
        expedientesAbiertos: 30,
        periodoVigente: '2026',
        usuariosPorRol: { ADMIN: 2, DOCENTE: 8, PADRE: 26, SAANEE: 4 },
      },
    })

    const result = await dashboardService.getAdminResumen()

    expect(mockedClient.get).toHaveBeenCalledWith('/dashboard/admin/resumen')
    expect(result.totalUsuarios).toBe(40)
    expect(result.usuariosPorRol.DOCENTE).toBe(8)
  })

  it('getDocenteResumen consulta /dashboard/docente/resumen', async () => {
    mockedClient.get.mockResolvedValue({
      data: { alumnosAsignados: 5, entradasBitacoraHoy: 3, alumnosSinPerfilDiscapacidad: 2 },
    })

    const result = await dashboardService.getDocenteResumen()

    expect(mockedClient.get).toHaveBeenCalledWith('/dashboard/docente/resumen')
    expect(result.alumnosAsignados).toBe(5)
    expect(result.alumnosSinPerfilDiscapacidad).toBe(2)
  })

  it('getPadreResumen consulta /dashboard/padre/resumen', async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        hijos: [
          { id: 1, nombre: 'Carlos', apellido: 'Lopez', grado: '3ro', seccion: 'A', expedienteId: 100 },
        ],
        entradasNuevasHoy: 7,
      },
    })

    const result = await dashboardService.getPadreResumen()

    expect(mockedClient.get).toHaveBeenCalledWith('/dashboard/padre/resumen')
    expect(result.hijos).toHaveLength(1)
    expect(result.hijos[0].nombre).toBe('Carlos')
    expect(result.entradasNuevasHoy).toBe(7)
  })

  it('getSaaneeResumen consulta /dashboard/saanee/resumen', async () => {
    mockedClient.get.mockResolvedValue({ data: { totalAlumnosActivos: 50 } })

    const result = await dashboardService.getSaaneeResumen()

    expect(mockedClient.get).toHaveBeenCalledWith('/dashboard/saanee/resumen')
    expect(result.totalAlumnosActivos).toBe(50)
  })

  it('getActividadRecienteDocente pasa limit como query param', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await dashboardService.getActividadRecienteDocente(3)

    expect(mockedClient.get).toHaveBeenCalledWith(
      '/dashboard/docente/actividad-reciente',
      { params: { limit: 3 } },
    )
  })

  it('getActividadRecienteDocente usa limit=5 por defecto', async () => {
    mockedClient.get.mockResolvedValue({ data: [] })

    await dashboardService.getActividadRecienteDocente()

    expect(mockedClient.get).toHaveBeenCalledWith(
      '/dashboard/docente/actividad-reciente',
      { params: { limit: 5 } },
    )
  })
})
