import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentsFormDialog } from '@/components/admin/documents/DocumentsFormDialog'
import type { TipoDocumentoFormData } from '@/types/document'

const emptyForm: TipoDocumentoFormData = {
  nombre: '', esObligatorio: false, esVersionable: false, esPeriodico: false, periodicidad: '',
}

const filledForm: TipoDocumentoFormData = {
  nombre: 'Certificado Médico', esObligatorio: true, esVersionable: false,
  esPeriodico: true, periodicidad: 'Anual',
}

const defaultProps = {
  open: true,
  isEditing: false,
  formData: filledForm,
  onChange: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
}

describe('DocumentsFormDialog', () => {
  it('renderiza campo nombre sin código ni descripción', () => {
    render(<DocumentsFormDialog {...defaultProps} />)

    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument()
    expect(screen.queryByLabelText('Código *')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Descripción')).not.toBeInTheDocument()
  })

  it('muestra selector de periodicidad cuando esPeriodico es true', () => {
    render(<DocumentsFormDialog {...defaultProps} />)

    expect(screen.getByText('Periodicidad')).toBeInTheDocument()
  })

  it('deshabilita botón guardar si nombre está vacío', () => {
    render(<DocumentsFormDialog {...defaultProps} formData={emptyForm} />)

    expect(screen.getByRole('button', { name: 'Crear tipo' })).toBeDisabled()
  })
})
