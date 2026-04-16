import apiClient from './client'
import type {
  ConfiguracionPeriodoResponse,
  PeriodoLectivoRequest,
  AperturaPeriodoResponse,
  CierrePeriodoResponse,
} from '@/types/api'

export const configuracionService = {
  async obtenerPeriodoVigente(): Promise<ConfiguracionPeriodoResponse> {
    const response = await apiClient.get<ConfiguracionPeriodoResponse>(
      '/admin/configuracion/periodo-vigente'
    )
    return response.data
  },

  async actualizarPeriodoVigente(data: PeriodoLectivoRequest): Promise<ConfiguracionPeriodoResponse> {
    const response = await apiClient.put<ConfiguracionPeriodoResponse>(
      '/admin/configuracion/periodo-vigente',
      data
    )
    return response.data
  },

  async aperturarPeriodo(): Promise<AperturaPeriodoResponse> {
    const response = await apiClient.post<AperturaPeriodoResponse>(
      '/admin/configuracion/aperturar-periodo'
    )
    return response.data
  },

  async cerrarPeriodo(): Promise<CierrePeriodoResponse> {
    const response = await apiClient.post<CierrePeriodoResponse>(
      '/admin/configuracion/cerrar-periodo'
    )
    return response.data
  },
}
