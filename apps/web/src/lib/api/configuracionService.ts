import apiClient from './client'
import type {
  ConfiguracionPeriodoResponse,
  PeriodoLectivoRequest,
  AperturaPeriodoResponse,
  CierrePeriodoResponse,
  ContactoAdminResponse,
  ContactoAdminRequest,
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

  // Endpoint publico: usable desde el login sin autenticacion.
  async obtenerContactoAdmin(): Promise<ContactoAdminResponse> {
    const response = await apiClient.get<ContactoAdminResponse>('/public/contacto-admin')
    return response.data
  },

  // Solo admin (requiere token con rol ADMIN).
  async actualizarContactoAdmin(data: ContactoAdminRequest): Promise<ContactoAdminResponse> {
    const response = await apiClient.put<ContactoAdminResponse>(
      '/admin/configuracion/contacto-admin',
      data
    )
    return response.data
  },
}
