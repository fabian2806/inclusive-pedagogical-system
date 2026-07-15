"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X, User, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#1E3A5F]">SignaEdu</span>
            <span className="hidden sm:block text-[#9CA3AF] text-xs">|</span>
            <span className="hidden sm:block text-xs text-[#6B7280]">Seguimiento Pedagógico Inclusivo</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#inicio"
            className="text-sm font-medium text-[#1E3A5F] border-b-2 border-[#1E3A5F] pb-0.5 transition-colors"
          >
            Inicio
          </a>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center">
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#D1D5DB] text-[#1E3A5F] text-sm font-medium rounded-full px-4"
            >
              <User size={14} />
              Iniciar sesión
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#374151]"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden bg-white border-t border-[#E5E7EB] overflow-hidden transition-all duration-200",
        open ? "max-h-72 py-3" : "max-h-0"
      )}>
        <nav className="flex flex-col px-6 gap-4">
          <a
            href="#inicio"
            className="text-sm font-medium text-[#6B7280] hover:text-[#1E3A5F] transition-colors"
            onClick={() => setOpen(false)}
          >
            Inicio
          </a>
          <div className="pt-2 border-t border-[#E5E7EB]">
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm" className="w-full gap-2 border-[#D1D5DB] text-[#1E3A5F]">
                <User size={14} />
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
