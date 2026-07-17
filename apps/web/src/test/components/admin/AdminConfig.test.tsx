import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminConfig from '@/pages/admin/AdminConfig'
import { configuracionService, alumnosService } from '@/lib/api'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import type { User } from '@/types/auth'

vi.mock('@/lib/api/configuracionService')
vi.mock('@/lib/api/alumnosService')

const mockedConfig = vi.mocked(configuracionService)
const mockedAlumnos = vi.mocked(alumnosService)

function admin(): User {
  return {
    id: 1,
    nombre: 'Admin',
    apellido: 'Sistema',
    correo: 'admin@signaedu.pe',
    telefono: null,
    rol: 'admin',
    authorities: ['EXPEDIENTE_CREAR', 'EXPEDIENTE_ACTUALIZAR'],
  }
}

/** @param periodoAbierto define si el periodo vigente tiene expedientes activos. */
function stubPeriodo(periodoAbierto: boolean, expedientesActivos = periodoAbierto ? 6 : 0) {
  mockedConfig.obtenerPeriodoVigente.mockResolvedValue({
    periodoLectivoVigente: '2026',
    periodoAbierto,
    expedientesActivos,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedAlumnos.listar.mockResolvedValue([])
  mockedConfig.obtenerContactoAdmin.mockResolvedValue({ correo: 'a@b.pe', telefono: null })
  stubPeriodo(false)
})

function render() {
  return renderWithProviders(<AdminConfig />, {
    user: admin(),
    route: '/dashboard/admin/configuracion',
  })
}

function botonGuardarPeriodo() {
  return screen.getByRole('button', { name: /^guardar$/i })
}

describe('AdminConfig — guarda del orden cerrar → cambiar → aperturar', () => {
  it('con el periodo abierto, no deja cambiar el año y explica por que', async () => {
    stubPeriodo(true)
    render()

    await waitFor(() => expect(botonGuardarPeriodo()).toBeDisabled())
    expect(screen.getByText(/cierra el periodo/i)).toBeInTheDocument()
    expect(screen.getByText(/quedarán sin poder cerrarse/i)).toBeInTheDocument()
  })

  it('con el periodo cerrado, deja cambiar el año', async () => {
    stubPeriodo(false)
    render()

    await waitFor(() => expect(botonGuardarPeriodo()).toBeEnabled())
    expect(screen.queryByText(/quedarán sin poder cerrarse/i)).not.toBeInTheDocument()
  })

  it('con el periodo abierto tampoco deja editar el campo del año', async () => {
    stubPeriodo(true)
    render()

    await waitFor(() => expect(screen.getByRole('spinbutton')).toBeDisabled())
  })
})

describe('AdminConfig — validacion de formato del periodo', () => {
  it('muestra un error en vez de no hacer nada cuando el año es invalido', async () => {
    stubPeriodo(false)
    render()
    await waitFor(() => expect(botonGuardarPeriodo()).toBeEnabled())

    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '20271', { delay: null })
    await userEvent.click(botonGuardarPeriodo())

    expect(await screen.findByText(/año de 4 dígitos/i)).toBeInTheDocument()
    expect(mockedConfig.actualizarPeriodoVigente).not.toHaveBeenCalled()
  })

  it('con un año valido llama al servicio', async () => {
    stubPeriodo(false)
    mockedConfig.actualizarPeriodoVigente.mockResolvedValue({
      periodoLectivoVigente: '2027',
      periodoAbierto: false,
      expedientesActivos: 0,
    })
    render()
    await waitFor(() => expect(botonGuardarPeriodo()).toBeEnabled())

    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '2027', { delay: null })
    await userEvent.click(botonGuardarPeriodo())

    await waitFor(() =>
      expect(mockedConfig.actualizarPeriodoVigente).toHaveBeenCalledWith({
        periodoLectivo: '2027',
      }),
    )
  })
})

describe('AdminConfig — apertura reporta los omitidos', () => {
  it('avisa cuando algunos alumnos quedaron afuera', async () => {
    stubPeriodo(false)
    mockedConfig.aperturarPeriodo.mockResolvedValue({
      periodoLectivo: '2027',
      expedientesCreados: 4,
      expedientesOmitidos: 2,
    })
    render()

    await userEvent.click(await screen.findByRole('button', { name: /aperturar periodo/i }))
    await userEvent.click(await screen.findByRole('button', { name: /confirmar apertura/i }))

    expect(await screen.findByText(/se crearon/i)).toBeInTheDocument()
    expect(screen.getByText(/alumnos ya tenían/i)).toBeInTheDocument()
    expect(screen.getByText(/fueron omitidos/i)).toBeInTheDocument()
  })

  it('no menciona omitidos cuando se crearon todos', async () => {
    stubPeriodo(false)
    mockedConfig.aperturarPeriodo.mockResolvedValue({
      periodoLectivo: '2027',
      expedientesCreados: 6,
      expedientesOmitidos: 0,
    })
    render()

    await userEvent.click(await screen.findByRole('button', { name: /aperturar periodo/i }))
    await userEvent.click(await screen.findByRole('button', { name: /confirmar apertura/i }))

    expect(await screen.findByText(/se crearon/i)).toBeInTheDocument()
    expect(screen.queryByText(/omitid/i)).not.toBeInTheDocument()
  })
})
