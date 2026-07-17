import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ExpedienteHeader } from '@/components/record/ExpedienteHeader'
import type { AlumnoResponse, ExpedientePeriodoResponse } from '@/types/api'

function alumnoMock(): AlumnoResponse {
  return {
    id: 1,
    nombre: 'Sofía',
    apellido: 'Rodríguez',
    idFotoPerfil: null,
    fechaNacimiento: '2015-03-10',
    grado: '3ro',
    seccion: 'A',
    estado: 'ACTIVO',
    docentes: [],
    padres: [],
  } as unknown as AlumnoResponse
}

function periodos(): ExpedientePeriodoResponse[] {
  return [
    { periodoLectivo: '2026', estado: 'ACTIVO', vigente: true, editable: true },
    { periodoLectivo: '2024', estado: 'INACTIVO', vigente: false, editable: false },
  ]
}

function renderHeader(props: Partial<Parameters<typeof ExpedienteHeader>[0]> = {}) {
  return render(
    <MemoryRouter>
      <ExpedienteHeader alumno={alumnoMock()} {...props} />
    </MemoryRouter>,
  )
}

describe('ExpedienteHeader — selector de periodo', () => {
  it('no muestra el selector cuando solo hay un periodo', () => {
    renderHeader({
      periodos: [periodos()[0]],
      periodoSeleccionado: '2026',
      onPeriodoChange: vi.fn(),
    })

    expect(screen.queryByLabelText(/periodo del expediente/i)).not.toBeInTheDocument()
  })

  it('no muestra el selector cuando el alumno no tiene expedientes', () => {
    renderHeader({ periodos: [], onPeriodoChange: vi.fn() })

    expect(screen.queryByLabelText(/periodo del expediente/i)).not.toBeInTheDocument()
  })

  it('muestra el selector cuando hay historial', () => {
    renderHeader({
      periodos: periodos(),
      periodoSeleccionado: '2026',
      onPeriodoChange: vi.fn(),
    })

    expect(screen.getByLabelText(/periodo del expediente/i)).toBeInTheDocument()
  })

  it('al elegir un periodo anterior avisa al padre', async () => {
    const onPeriodoChange = vi.fn()
    renderHeader({
      periodos: periodos(),
      periodoSeleccionado: '2026',
      onPeriodoChange,
    })

    await userEvent.click(screen.getByLabelText(/periodo del expediente/i))
    await userEvent.click(await screen.findByRole('option', { name: /2024/ }))

    expect(onPeriodoChange).toHaveBeenCalledWith('2024')
  })

  it('etiqueta cada periodo segun se pueda editar o no', async () => {
    renderHeader({
      periodos: periodos(),
      periodoSeleccionado: '2026',
      onPeriodoChange: vi.fn(),
    })

    await userEvent.click(screen.getByLabelText(/periodo del expediente/i))

    expect(await screen.findByRole('option', { name: /2026 · vigente/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /2024 · cerrado/ })).toBeInTheDocument()
  })

  it('el nombre del alumno se sigue mostrando', () => {
    renderHeader({ periodos: periodos(), periodoSeleccionado: '2026', onPeriodoChange: vi.fn() })

    expect(screen.getByText('Sofía Rodríguez')).toBeInTheDocument()
  })
})
