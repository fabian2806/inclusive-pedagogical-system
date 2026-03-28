import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import { AuthProvider } from '@/contexts/AuthContext'
import Dashboard from '@/pages/Dashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import DashboardLayout from '@/pages/DashboardLayout'

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

          </Route>



        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
