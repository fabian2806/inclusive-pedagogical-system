// Punto único de acceso a los toasts de la app. Reexporta sonner para que,
// si algún día se cambia de librería, solo haya que tocar este archivo.
// Uso: import { toast } from '@/lib/toast'  →  toast.success('...'), toast.error('...')
export { toast } from 'sonner'
