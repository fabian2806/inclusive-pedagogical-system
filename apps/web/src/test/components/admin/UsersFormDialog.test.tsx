import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserFormDialog } from '@/components/admin/users/UsersFormDialog'
import type { UserFormData } from '@/types/user'

const emptyForm: UserFormData = {
  nombre: '', apellido: '', correo: '', telefono: '', password: '', rol: 'DOCENTE',
}

const filledForm: UserFormData = {
  nombre: 'María', apellido: 'Castro', correo: 'maria@test.com',
  telefono: '999000000', password: 'pass123', rol: 'DOCENTE',
}

const defaultProps = {
  open: true,
  isEditing: false,
  formData: filledForm,
  onChange: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
}

describe('UserFormDialog', () => {
  it('renderiza campos nombre, apellido y correo', () => {
    render(<UserFormDialog {...defaultProps} />)

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('llama onSave al hacer click en guardar con datos completos', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(<UserFormDialog {...defaultProps} onSave={onSave} />)

    await user.click(screen.getByRole('button', { name: 'Crear usuario' }))
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('deshabilita botón guardar si faltan campos obligatorios', () => {
    render(<UserFormDialog {...defaultProps} formData={emptyForm} />)

    expect(screen.getByRole('button', { name: 'Crear usuario' })).toBeDisabled()
  })
})
