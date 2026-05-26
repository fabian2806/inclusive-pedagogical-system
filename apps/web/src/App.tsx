import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import { AuthProvider } from '@/contexts/AuthContext'
import Dashboard from '@/pages/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import DashboardLayout from '@/pages/DashboardLayout'
import { AdminStudents } from '@/pages/admin/AdminStudents'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminDocuments from '@/pages/admin/AdminDocuments'
import AdminConfig from '@/pages/admin/AdminConfig'
import Students from '@/pages/Students'
import StudentProfile from '@/pages/StudentProfile'
import StudentRecord from './pages/StudentRecord'
import Indicators from './pages/Indicators'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute> <DashboardLayout /> </ProtectedRoute>}>
            <Route index element={<Dashboard />} />

            <Route path='estudiantes'>
              <Route index element={<Students />} />
              <Route path=':id/perfil' element={<StudentProfile />} />
              <Route path=':id/expediente' element={<StudentRecord />} />
            </Route>

            <Route
              path='indicadores'
              element={
                <ProtectedRoute allowedRoles={['docente']}>
                  <Indicators />
                </ProtectedRoute>
              }
            />

            <Route
              path='admin'
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route path='usuarios' element={<AdminUsers />} />
              <Route path='estudiantes' element={<AdminStudents />} />
              <Route path='tipos-documento' element={<AdminDocuments />} />
              <Route path='configuracion' element={<AdminConfig />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
