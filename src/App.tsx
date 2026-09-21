
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './auth/Login';
import Register from './auth/Register';
import ChangePassword from './auth/ChangePassword';
import Dashboard from './admin/Dashboard';
import CustomerHome from './customer/CustomerHome';
import StaffHome from './staff/StaffHome';
import ProtectedRoute from './auth/ProtectedRoute';
import AuthRedirect from './auth/AuthRedirect';
function App() {
  
    return (
        <BrowserRouter>
              <Routes>
                <Route path = "/" element ={<AuthRedirect/>}></Route>
                <Route path="/login" element={<Login />} />  
                <Route path="/register" element={<Register />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/admin" element={
                  <ProtectedRoute allowedRole='Admin'>
                <Dashboard />
                  </ProtectedRoute>
                 } />
                <Route path="/staff" element={
                  <ProtectedRoute allowedRole='Staff'>
                     <StaffHome/>
                  </ProtectedRoute>

                  } />
                <Route path="/customer" element={
                  <ProtectedRoute allowedRole='Customer'>
                       <CustomerHome />
                  </ProtectedRoute>
                  } />
                </Routes>
                                                        
        </BrowserRouter>
          );                                                       
   }

        export default App;