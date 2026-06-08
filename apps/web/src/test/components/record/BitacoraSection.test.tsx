import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BitacoraSection } from '@/components/record/BitacoraSection'
import type { EntryFormState } from '@/components/record/BitacoraEntryForm'
import type { BitacoraEntry } from '@/types/bitacora'

function emptyForm(): EntryFormState {
  return {
    tipo: '',
    titulo: '',
    contenido: '',
    importancia: '',
    severidad: '',
    indicadorId: '',
    resultado: '',
    resultadoLogrado: '',
    archivos: [],
  }
}

function entryMock(id: string): BitacoraEntry {
  return {
    id,
    date: '01 jun 2026',
    time: '10:30',
    author: 'María Torres',
    role: 'DOCENTE',
    type: 'observacion_pe',
    title: 'Avance lectura',
    content: 'Sofía leyó 8 palabras',
    attachments: [],
    replies: [],
  }
}

interface Overrides {
  entries?: BitacoraEntry[]
  canExport?: boolean
  exporting?: boolean
  onExport?: () => void
}

function baseProps(overrides: Overrides = {}) {
  const entries = overrides.entries ?? [entryMock('1')]
  return {
    alumnoId: 1,
    alumnoNombre: 'Sofía Rodríguez',
    entries,
    filteredEntries: entries,
    isLoading: false,
    error: null,
    submitting: false,
    activeFilter: 'all',
    setActiveFilter: vi.fn(),
    tiposVisibles: [],
    entryForm: emptyForm(),
    setEntryForm: vi.fn(),
    selectedType: undefined,
    indicadoresActivos: [],
    onPublish: vi.fn(),
    replyingTo: null,
    startReply: vi.fn(),
    cancelReply: vi.fn(),
    replyText: '',
    setReplyText: vi.fn(),
    onReply: vi.fn(),
    canExport: overrides.canExport ?? true,
    exporting: overrides.exporting ?? false,
    onExport: overrides.onExport ?? vi.fn(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('BitacoraSection — boton Exportar CSV', () => {
  it('muestra el boton cuando canExport es true', () => {
    render(<BitacoraSection {...baseProps({ canExport: true })} />)
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument()
  })

  it('NO muestra el boton cuando canExport es false', () => {
    render(<BitacoraSection {...baseProps({ canExport: false })} />)
    expect(screen.queryByRole('button', { name: /exportar csv/i })).not.toBeInTheDocument()
  })

  it('deshabilita el boton cuando no hay entradas', () => {
    render(<BitacoraSection {...baseProps({ entries: [] })} />)
    const btn = screen.getByRole('button', { name: /exportar csv/i })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('title', expect.stringMatching(/no hay entradas/i))
  })

  it('al hacer click invoca onExport', async () => {
    const onExport = vi.fn()
    render(<BitacoraSection {...baseProps({ onExport })} />)

    await userEvent.click(screen.getByRole('button', { name: /exportar csv/i }))

    expect(onExport).toHaveBeenCalledTimes(1)
  })

  it('muestra texto "Exportando…" y queda deshabilitado cuando exporting es true', () => {
    render(<BitacoraSection {...baseProps({ exporting: true })} />)
    const btn = screen.getByRole('button', { name: /exportando/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })
})
