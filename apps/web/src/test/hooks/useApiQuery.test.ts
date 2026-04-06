import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useApiQuery } from '@/hooks/useApiQuery'

describe('useApiQuery', () => {
  it('retorna data al resolver exitosamente', async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1, nombre: 'Test' }])

    const { result } = renderHook(() => useApiQuery(fetcher))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([{ id: 1, nombre: 'Test' }])
    expect(result.current.error).toBeNull()
  })

  it('retorna error cuando el fetcher falla', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Error de red'))

    const { result } = renderHook(() => useApiQuery(fetcher))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Error inesperado al cargar los datos')
  })

  it('refetch recarga los datos', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

    const { result } = renderHook(() => useApiQuery(fetcher))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.data).toHaveLength(1)

    result.current.refetch()

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2)
    })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
