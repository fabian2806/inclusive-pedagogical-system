import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardTopbar } from '@/components/DashboardTopbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { notificacionesService } from '@/lib/api'
import { renderWithProviders } from '../helpers/renderWithProviders'
import type { User } from '@/types/auth'
import type { NotificacionResponse } from '@/types/api'

vi.mock('@/lib/api/notificacionesService')

const mockedNotifs = vi.mocked(notificacionesService)

beforeEach(() => {
  vi.clearAllMocks()
  mockedNotifs.listarMias.mockResolvedValue([])
})

function usuario(rol: User['rol']): User {
  return {
    id: 1, nombre: 'Test', apellido: 'User',
    correo: `${rol}@test.com`, telefono: null, rol, authorities: [],
  }
}

function notif(id: number, opts: { leida?: boolean } = {}): NotificacionResponse {
  return {
    id,
    mensaje: `Notificacion ${id}`,
    referenciaTipo: 'EVENTO',
    referenciaId: 100,
    usuarioCreador: null,
    fechaCreacion: new Date(Date.now() - 5 * 60_000).toISOString(),
    fechaLectura: opts.leida ? new Date().toISOString() : null,
  }
}

function render(rol: User['rol'], route = '/dashboard') {
  return renderWithProviders(
    <SidebarProvider>
      <DashboardTopbar />
    </SidebarProvider>,
    { user: usuario(rol), route },
  )
}

describe('DashboardTopbar', () => {
  describe('título de sección', () => {
    // Usamos rol admin: el título no depende del rol y admin no monta la
    // campanita (sin fetch async), lo que mantiene estos tests sin warnings de act().
    it('muestra "Inicio" en /dashboard', () => {
      render('admin', '/dashboard')
      expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
    })

    it('muestra "Estudiantes" en una ruta de estudiantes', () => {
      render('admin', '/dashboard/admin/estudiantes/5')
      expect(screen.getByRole('heading', { name: 'Estudiantes' })).toBeInTheDocument()
    })

    it('muestra "Tipos de Documento" en la ruta admin de tipos de documento', () => {
      render('admin', '/dashboard/admin/tipos-documento')
      expect(
        screen.getByRole('heading', { name: 'Tipos de Documento' }),
      ).toBeInTheDocument()
    })
  })

  it('admin: NO renderiza el icono de campanita', () => {
    render('admin')

    // El icono Bell solo aparece para docente/padre/saanee.
    expect(screen.queryByRole('button', { name: /Notificaciones/i })).not.toBeInTheDocument()
  })

  it('docente: renderiza la campanita y consulta notificaciones al montar', async () => {
    render('docente')

    await waitFor(() => {
      expect(mockedNotifs.listarMias).toHaveBeenCalled()
    })
  })

  it('badge muestra el conteo de notificaciones no leidas', async () => {
    mockedNotifs.listarMias.mockResolvedValue([
      notif(1), notif(2), notif(3, { leida: true }),
    ])

    render('docente')

    await waitFor(() => {
      // 2 no leidas → badge muestra 2.
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('badge se oculta si no hay notificaciones no leidas', async () => {
    mockedNotifs.listarMias.mockResolvedValue([
      notif(1, { leida: true }), notif(2, { leida: true }),
    ])

    render('docente')

    // Esperamos a que se monte el componente y el fetch resuelva.
    await waitFor(() => expect(mockedNotifs.listarMias).toHaveBeenCalled())
    // Ningun badge "0" deberia aparecer.
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('click en notificacion no leida invoca marcarLeida con su id', async () => {
    const user = userEvent.setup()
    mockedNotifs.listarMias.mockResolvedValue([notif(42)])
    mockedNotifs.marcarLeida.mockResolvedValue(notif(42, { leida: true }))

    render('docente')

    // Abrir dropdown.
    await waitFor(() => screen.getByRole('button', { name: /Notificaciones/i }))
    await user.click(screen.getByRole('button', { name: /Notificaciones/i }))

    await waitFor(() => screen.getByText('Notificacion 42'))
    await user.click(screen.getByText('Notificacion 42'))

    await waitFor(() => {
      expect(mockedNotifs.marcarLeida).toHaveBeenCalledWith(42)
    })
  })

  it('boton Marcar todas como leidas invoca el endpoint masivo', async () => {
    const user = userEvent.setup()
    mockedNotifs.listarMias.mockResolvedValue([notif(1), notif(2)])
    mockedNotifs.marcarTodasLeidas.mockResolvedValue({ marcadas: 2 })

    render('docente')

    await waitFor(() => screen.getByRole('button', { name: /Notificaciones/i }))
    await user.click(screen.getByRole('button', { name: /Notificaciones/i }))

    await waitFor(() => screen.getByText(/Marcar todas como le/i))
    await user.click(screen.getByText(/Marcar todas como le/i))

    await waitFor(() => {
      expect(mockedNotifs.marcarTodasLeidas).toHaveBeenCalled()
    })
  })
})
