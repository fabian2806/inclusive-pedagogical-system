import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '@/lib/api/client'
import { alumnosService } from '@/lib/api/alumnosService'

vi.mock('@/lib/api/client')

const mockedClient = vi.mocked(apiClient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('alumnosService', () => {
  it('crear envía POST con datos del alumno', async () => {
    const nuevoAlumno = {
      nombre: 'Sofía', apellido: 'Rodríguez',
      fechaNacimiento: '2015-03-10', grado: '3° Primaria', seccion: 'A',
    }
    mockedClient.post.mockResolvedValue({
      data: { id: 1, ...nuevoAlumno, estado: 'ACTIVO', docentes: [], padres: [] },
    })

    const result = await alumnosService.crear(nuevoAlumno)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/alumnos', nuevoAlumno)
    expect(result.id).toBe(1)
  })

  it('listar retorna array de alumnos', async () => {
    const mockAlumnos = [
      { id: 1, nombre: 'Sofía', apellido: 'R', estado: 'ACTIVO', docentes: [], padres: [] },
    ]
    mockedClient.get.mockResolvedValue({ data: mockAlumnos })

    const result = await alumnosService.listar()

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/alumnos')
    expect(result).toHaveLength(1)
  })

  it('asignarDocente envía POST con alumnoId y docenteId', async () => {
    mockedClient.post.mockResolvedValue({ data: { id: 1, docentes: [{ id: 3 }] } })

    await alumnosService.asignarDocente(1, 3)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/alumnos/1/docentes/3')
  })
})
