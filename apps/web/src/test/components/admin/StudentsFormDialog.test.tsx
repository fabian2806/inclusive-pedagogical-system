import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudentFormDialog } from '@/components/admin/students/StudentsFormDialog'
import type { StudentFormData } from '@/types/student'

const emptyForm: StudentFormData = {
  nombre: '', apellido: '', fechaNacimiento: '', grado: '', seccion: '', docenteId: '', padreIds: [],
}

const filledForm: StudentFormData = {
  nombre: 'Sofía', apellido: 'Rodríguez', fechaNacimiento: '2015-03-10',
  grado: '3° Primaria', seccion: 'A', docenteId: '1', padreIds: [2],
}

const mockDocentes = [
  { id: 1, nombre: 'María', apellido: 'Castro', correo: 'maria@test.com', telefono: null },
]
const mockPadres = [
  { id: 2, nombre: 'Elena', apellido: 'Pérez', correo: 'elena@test.com', telefono: null },
  { id: 3, nombre: 'Iván', apellido: 'Montenegro', correo: 'ivan@test.com', telefono: null },
]

const defaultProps = {
  open: true,
  isEditing: false,
  formData: filledForm,
  onChange: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
  grades: ['3° Primaria', '4° Primaria'],
  sections: ['A', 'B'],
  availableTeachers: mockDocentes,
  availableParents: mockPadres,
}

describe('StudentFormDialog', () => {
  it('renderiza campos nombre, apellido y fecha de nacimiento', () => {
    render(<StudentFormDialog {...defaultProps} />)

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha de nacimiento')).toBeInTheDocument()
  })

  it('renderiza el select de docente y la lista de padres/tutores', () => {
    render(<StudentFormDialog {...defaultProps} />)

    expect(screen.getByText('Docente asignado')).toBeInTheDocument()
    expect(screen.getByText('Padres/Tutores vinculados')).toBeInTheDocument()
    expect(screen.getByText('Elena Pérez')).toBeInTheDocument()
    expect(screen.getByText('Iván Montenegro')).toBeInTheDocument()
  })

  it('deshabilita botón guardar si faltan campos obligatorios', () => {
    render(<StudentFormDialog {...defaultProps} formData={emptyForm} />)

    expect(screen.getByRole('button', { name: 'Crear estudiante' })).toBeDisabled()
  })

  it('marca solo los padres seleccionados y muestra el contador', () => {
    render(<StudentFormDialog {...defaultProps} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('agrega un padre a la selección sin quitar el ya vinculado', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StudentFormDialog {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByText('Iván Montenegro'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ padreIds: [2, 3] }),
    )
  })

  it('quita un padre ya seleccionado al desmarcarlo', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<StudentFormDialog {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByText('Elena Pérez'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ padreIds: [] }),
    )
  })

  it('avisa cuando no hay padres/tutores registrados', () => {
    render(<StudentFormDialog {...defaultProps} availableParents={[]} />)

    expect(
      screen.getByText(/No hay padres\/tutores registrados/),
    ).toBeInTheDocument()
  })
})
