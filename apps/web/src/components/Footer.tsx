import { Mail, ArrowUp } from "lucide-react"

export function Footer() {

  const year = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-white border-t border-[#E5E7EB] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* En el lado izquierdo: logo e info de la universidad (considerar cambiarlo post reunión asesor) */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center shrink-0">

            {/*TODO: Exportar logo a un único componente */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E3A5F]">SignaEdu</p>
            <p className="text-xs text-[#6B7280] mt-0.5">PUCP · Facultad de Ciencias e Ingeniería</p>
            <p className="text-xs text-[#9CA3AF]">Proyecto de Tesis · Lima, Perú · Setiembre 2025 – Junio 2026</p>
          </div>
        </div>

        {/* En el lado derecho: información de contacto a mi persona (considerar cambiarlo post reunión asesor) */}
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold text-[#374151] mb-1">Contacto del proyecto</p>
          <p className="text-sm font-semibold text-[#1E3A5F]">Fabián Alejandro Montenegro Rufasto</p>
          <a
            href="mailto:a20210834@pucp.edu.pe"
            className="flex items-center gap-1.5 mt-1 text-xs text-[#3B82F6] hover:underline md:justify-end"
          >
            <Mail size={12} />
            a20210834@pucp.edu.pe
          </a>
        </div>
      </div>

        {/* Barra inferior: copyright + volver arriba */}
      <div className="mt-8 border-t border-[#F3F4F6] pt-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center text-xs text-[#9CA3AF]">
          <p>© {year} SignaEdu — PUCP. Todos los derechos reservados.</p>
          {/*[(1)]*/}
        </div>
      </div>

    </footer>
  )
}

/*

[(1)] Para el footer por si expandimos el landing (botón de volver arriba):

<button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="flex items-center gap-2 text-[#374151] hover:text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] rounded px-2 py-1"
    aria-label="Volver arriba"
    title="Volver arriba"
    >
    <ArrowUp size={14} />
    <span className="hidden sm:inline">Volver arriba</span>
</button> 

*/