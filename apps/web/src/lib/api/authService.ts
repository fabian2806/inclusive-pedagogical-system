import apiClient from './client'
import type { LoginRequest, LoginResponse, UsuarioResponse } from '@/types/api'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  async getMe(): Promise<UsuarioResponse> {
    const response = await apiClient.get<UsuarioResponse>('/auth/me')
    return response.data
  },
}
