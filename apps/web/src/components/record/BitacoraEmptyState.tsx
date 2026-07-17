import { FileText, MessageSquare } from "lucide-react"
import type { EntryTypeConfig } from "@/lib/bitacora-ui"

interface Props {
  totalEntries: number
  alumnoNombre: string
  tiposVisibles: EntryTypeConfig[]
  onTipoClick: (tipoId: string) => void
  onResetFilter: () => void
  /** Periodo cerrado: no hay formulario, asi que no invitamos a escribir. */
  soloLectura?: boolean
}

export function BitacoraEmptyState({
  totalEntries,
  alumnoNombre,
  tiposVisibles,
  onTipoClick,
  onResetFilter,
  soloLectura = false,
}: Props) {
  // En un periodo cerrado el vacio es un hecho consumado, no una invitacion:
  // ese año simplemente no se registro nada y ya no se puede registrar.
  if (totalEntries === 0 && soloLectura) {
    return (
      <div className="flex flex-col items-center py-16 px-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#F9FAFB] border-2 border-dashed border-[#E5E7EB] flex items-center justify-center mb-5">
          <FileText size={32} className="text-[#D1D5DB]" />
        </div>
        <h3 className="text-base font-semibold text-[#1E3A5F] mb-2">
          Sin entradas en este periodo
        </h3>
        <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">
          No se registraron entradas para {alumnoNombre} en el periodo consultado.
        </p>
      </div>
    )
  }

  if (totalEntries === 0) {
    return (
      <div className="flex flex-col items-center py-16 px-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#EFF6FF] border-2 border-dashed border-[#BFDBFE] flex items-center justify-center mb-5">
          <FileText size={32} className="text-[#93C5FD]" />
        </div>
        <h3 className="text-base font-semibold text-[#1E3A5F] mb-2">
          La bitácora está vacía
        </h3>
        <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs mb-6">
          Aún no hay entradas registradas para {alumnoNombre}. Selecciona un tipo de entrada arriba y publica la primera.
        </p>
        <div className="flex flex-wrap justify-center gap-2 max-w-sm">
          {tiposVisibles.slice(0, 4).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onTipoClick(t.id)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all"
              style={{
                backgroundColor: t.color.bg,
                borderColor: t.color.border,
                color: t.color.text,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color.dot }} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-[#F3F4F6] w-full max-w-sm">
          <p className="text-[11px] text-[#9CA3AF] uppercase tracking-widest font-medium mb-3">
            Tipos de entrada disponibles
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            {tiposVisibles.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-xs text-[#6B7280]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color.dot }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filtro sin resultados
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-3">
        <MessageSquare size={22} className="text-[#D1D5DB]" />
      </div>
      <p className="text-sm font-medium text-[#374151] mb-1">Sin entradas de este tipo</p>
      <p className="text-xs text-[#9CA3AF]">Prueba con otro filtro o crea una nueva entrada</p>
      <button
        onClick={onResetFilter}
        className="mt-3 text-xs text-[#3B82F6] hover:underline"
      >
        Ver todas las entradas
      </button>
    </div>
  )
}
