import { useState, useEffect, useCallback } from 'react'
import type { ErrorResponse } from '@/types/api'
import { AxiosError } from 'axios'

interface UseApiQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useApiQuery<T>(fetcher: () => Promise<T>): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ErrorResponse | undefined
        setError(apiError?.mensaje ?? err.message)
      } else {
        setError('Error inesperado al cargar los datos')
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    execute()
  }, [execute])

  return { data, isLoading, error, refetch: execute }
}
