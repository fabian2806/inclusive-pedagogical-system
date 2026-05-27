import apiClient from './client'
import type { ContactoResponse } from '@/types/api'

/**
 * Endpoints bajo authority CONTACTO_LEER. Permiten a docentes / padres /
 * SAANEE consultar contactos sin necesitar acceso a la API admin de usuarios.
 */
export const contactosService = {
  async obtenerContactosDelAlumno(alumnoId: number): Promise<ContactoResponse[]> {
    const response = await apiClient.get<ContactoResponse[]>(
      `/alumnos/${alumnoId}/contactos`,
    )
    return response.data
  },

  async listarSaaneeActivos(): Promise<ContactoResponse[]> {
    const response = await apiClient.get<ContactoResponse[]>(
      '/usuarios/saanee',
    )
    return response.data
  },
}
