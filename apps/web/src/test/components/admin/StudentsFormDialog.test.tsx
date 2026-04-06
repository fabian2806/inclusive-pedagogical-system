import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StudentFormDialog } from '@/components/admin/students/StudentsFormDialog'
import type { StudentFormData } from '@/types/student'

const emptyForm: StudentFormData = {
  nombre: '', apellido: '', fechaNacimiento: '', grado: '', seccion: '', docenteId: '', padreId: '',
}

const filledForm: StudentFormData = {
  nombre: 'Sofía', apellido: 'Rodríguez', fechaNacimiento: '2015-03-10',
  grado: '3° Primaria', seccion: 'A', docenteId: '1', padreId: '2',
}

const mockDocentes = [
  { id: 1, nombre: 'María', apellido: 'Castro', correo: 'maria@test.com' },
]
const mockPadres = [
  { id: 2, nombre: 'Elena', apellido: 'Pérez', correo: 'elena@test.com' },
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

  it('renderiza selects de docente y padre', () => {
    render(<StudentFormDialog {...defaultProps} />)

    expect(screen.getByText('Docente asignado')).toBeInTheDocument()
    expect(screen.getByText('Padre/Tutor vinculado')).toBeInTheDocument()
  })

  it('deshabilita botón guardar si faltan campos obligatorios', () => {
    render(<StudentFormDialog {...defaultProps} formData={emptyForm} />)

    expect(screen.getByRole('button', { name: 'Crear estudiante' })).toBeDisabled()
  })
})
