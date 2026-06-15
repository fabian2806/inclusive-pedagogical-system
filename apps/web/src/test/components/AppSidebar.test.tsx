import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { renderWithProviders } from '../helpers/renderWithProviders'
import type { User, UserRole } from '@/types/auth'

function usuario(rol: UserRole): User {
  return {
    id: 1, nombre: 'Test', apellido: 'User',
    correo: `${rol}@test.com`, telefono: null, rol,
    authorities: [],
  }
}

function renderSidebar(rol: UserRole) {
  return renderWithProviders(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
    { user: usuario(rol), route: '/dashboard' },
  )
}

describe('AppSidebar', () => {
  describe('rol admin', () => {
    it('muestra Inicio, Usuarios, Estudiantes, Tipos de Documento, Configuración', () => {
      renderSidebar('admin')
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Usuarios')).toBeInTheDocument()
      expect(screen.getByText('Estudiantes')).toBeInTheDocument()
      expect(screen.getByText('Tipos de Documento')).toBeInTheDocument()
      expect(screen.getByText('Configuración')).toBeInTheDocument()
    })

    it('no muestra Reportes (removido del v0)', () => {
      renderSidebar('admin')
      expect(screen.queryByText('Reportes')).not.toBeInTheDocument()
    })

    it('no muestra Eventos (fuera del alcance de admin en Fase 4)', () => {
      renderSidebar('admin')
      expect(screen.queryByText('Eventos')).not.toBeInTheDocument()
    })
  })

  describe('rol docente', () => {
    it('muestra Inicio, Estudiantes, Indicadores, Eventos', () => {
      renderSidebar('docente')
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Estudiantes')).toBeInTheDocument()
      expect(screen.getByText('Indicadores')).toBeInTheDocument()
      expect(screen.getByText('Eventos')).toBeInTheDocument()
    })

    it('Eventos enlaza a /dashboard/eventos', () => {
      renderSidebar('docente')
      const link = screen.getByText('Eventos').closest('a')
      expect(link).toHaveAttribute('href', '/dashboard/eventos')
    })

    it('no muestra Informes (removido del v0)', () => {
      renderSidebar('docente')
      expect(screen.queryByText('Informes')).not.toBeInTheDocument()
    })

    it('no muestra items administrativos', () => {
      renderSidebar('docente')
      expect(screen.queryByText('Usuarios')).not.toBeInTheDocument()
      expect(screen.queryByText('Tipos de Documento')).not.toBeInTheDocument()
      expect(screen.queryByText('Configuración')).not.toBeInTheDocument()
    })
  })

  describe('rol padre', () => {
    it('muestra Inicio, Mis Hijos, Eventos', () => {
      renderSidebar('padre')
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Mis Hijos')).toBeInTheDocument()
      expect(screen.getByText('Eventos')).toBeInTheDocument()
    })

    it('no muestra Comunicación (removida — vive dentro de la bitácora)', () => {
      renderSidebar('padre')
      expect(screen.queryByText('Comunicación')).not.toBeInTheDocument()
    })

    it('Mis Hijos apunta al listado real de estudiantes filtrado por rol', () => {
      renderSidebar('padre')
      const link = screen.getByText('Mis Hijos').closest('a')
      expect(link).toHaveAttribute('href', '/dashboard/estudiantes')
    })
  })

  describe('rol saanee', () => {
    it('muestra Inicio, Estudiantes, Eventos', () => {
      renderSidebar('saanee')
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Estudiantes')).toBeInTheDocument()
      expect(screen.getByText('Eventos')).toBeInTheDocument()
    })

    it('no muestra Evaluaciones ni Coordinación (removidas del v0)', () => {
      renderSidebar('saanee')
      expect(screen.queryByText('Evaluaciones')).not.toBeInTheDocument()
      expect(screen.queryByText('Coordinación')).not.toBeInTheDocument()
    })
  })

  it('no muestra la sección "Sistema" con Configuración suelta (secondaryItems removido)', () => {
    renderSidebar('docente')
    expect(screen.queryByText('Sistema')).not.toBeInTheDocument()
  })
})
