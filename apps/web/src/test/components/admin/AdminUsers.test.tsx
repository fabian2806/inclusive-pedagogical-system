import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminUsers from '@/pages/admin/AdminUsers'
import { usuariosService } from '@/lib/api'
import { toast } from '@/lib/toast'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import type { UsuarioResponse } from '@/types/api'

vi.mock('@/lib/api/usuariosService')
// Mock del helper de toast: nos interesa verificar que se invoca, no su render.
vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

const mockedUsuarios = vi.mocked(usuariosService)
const mockedToast = vi.mocked(toast)

function userFake(overrides: Partial<UsuarioResponse> = {}): UsuarioResponse {
  return {
    id: 1,
    nombre: 'Laura',
    apellido: 'Diaz',
    correo: 'laura@test.com',
    telefono: null,
    estado: 'ACTIVO',
    roles: ['DOCENTE'],
    authorities: [],
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUsuarios.listar.mockResolvedValue([])
})

function render() {
  return renderWithProviders(<AdminUsers />, { route: '/dashboard/admin/usuarios' })
}

describe('AdminUsers — toasts', () => {
  it('crear usuario exitoso dispara toast.success("Usuario creado")', async () => {
    // delay: null quita el setTimeout que userEvent mete entre tecla y tecla.
    // Son 4 campos y cada pulsacion re-renderiza el dialogo completo, asi que
    // el test superaba los 5s de timeout cuando corre junto al resto de la suite.
    const user = userEvent.setup({ delay: null })
    mockedUsuarios.crear.mockResolvedValue(userFake())

    render()

    await user.click(await screen.findByRole('button', { name: /Nuevo usuario/i }))

    await user.type(screen.getByLabelText('Nombre'), 'Laura')
    await user.type(screen.getByLabelText('Apellido'), 'Diaz')
    await user.type(screen.getByLabelText('Correo electrónico'), 'laura@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secret123')

    await user.click(screen.getByRole('button', { name: /Crear usuario/i }))

    await waitFor(() => {
      expect(mockedUsuarios.crear).toHaveBeenCalled()
      expect(mockedToast.success).toHaveBeenCalledWith('Usuario creado')
    })
  })

  it('error al desactivar dispara toast.error', async () => {
    const user = userEvent.setup()
    mockedUsuarios.listar.mockResolvedValue([userFake({ id: 5, estado: 'ACTIVO' })])
    mockedUsuarios.desactivar.mockRejectedValue(new Error('boom'))

    render()

    const fila = (await screen.findByText('Laura Diaz')).closest('tr')!
    await user.click(within(fila).getByRole('button'))
    await user.click(await screen.findByText('Desactivar'))

    await waitFor(() => {
      expect(mockedUsuarios.desactivar).toHaveBeenCalledWith(5)
      expect(mockedToast.error).toHaveBeenCalledWith('No se pudo desactivar el usuario')
    })
  })
})
