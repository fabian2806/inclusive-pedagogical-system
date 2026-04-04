import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import { AuthProvider } from '@/contexts/AuthContext'
import Dashboard from '@/pages/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import DashboardLayout from '@/pages/DashboardLayout'
import { AdminStudents } from '@/pages/admin/AdminStudents'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminDocuments from './pages/admin/AdminDocuments'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          
          {/*<Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>}/>*/}

          <Route path="/dashboard" element={<ProtectedRoute> <DashboardLayout /> </ProtectedRoute>}>
            <Route index element={<Dashboard />} />

            <Route path='admin'>
              <Route path='usuarios' element={<AdminUsers />} />
              <Route path='estudiantes' element={<AdminStudents />} />
              <Route path='tipos-documento' element={<AdminDocuments />} />
              <Route path='eventos' element={<div>Admin - Eventos</div>} />
              <Route path='reportes' element={<div>Admin - Reportes</div>} />
            </Route>

          </Route>



        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
