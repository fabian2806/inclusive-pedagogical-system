import apiClient from './client'
import type { ExpedientePeriodoResponse } from '@/types/api'

export const expedientesService = {
  /**
   * Periodos en los que el alumno tiene expediente, del mas reciente al mas
   * antiguo. Incluye los cerrados: son consultables en solo lectura.
   */
  async listarPeriodos(alumnoId: number): Promise<ExpedientePeriodoResponse[]> {
    const response = await apiClient.get<ExpedientePeriodoResponse[]>(
      `/alumnos/${alumnoId}/expedientes`,
    )
    return response.data
  },
}
