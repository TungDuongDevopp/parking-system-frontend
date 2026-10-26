
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Login from './auth/Login';
import Register from './auth/Register';
import ChangePassword from './auth/ChangePassword';
import Dashboard from './admin/Dashboard';
import AdminRole from './admin/AdminRole';
import AdminUser from './admin/AdminUser';
import AdminCustomer from './admin/AdminCustomer';
import CustomerProfile from './customer/CustomerProfile';
import CustomerFindParking from './customer/CustomerFindParking';
import CustomerReservations from './customer/CustomerReservations';
import CustomerSubscriptions from './customer/CustomerSubscriptions';
import StaffHome from './staff/StaffHome';
import StaffProfile from './staff/StaffProfile';
import ProtectedRoute from './auth/ProtectedRoute';
import Homepage from './Homepage';
import AboutPage from './AboutPage';
import PricingPage from './PricingPage';
import AdminStaff from './admin/AdminStaff';
import AdminParkingArea from './admin/AdminParkingArea';
import { AuthProvider } from './auth/AuthContext';
import AdminParkingSpot from './admin/AdminParkingSpot';
import AdminQuotation from './admin/AdminQuotation';
import AdminSubscription from './admin/AdminSubscription';
import AdminPlate from './admin/AdminPlate';
import AdminReservation from './admin/AdminReservation';
import AdminSession from './admin/AdminSession';
const App = () => {
  
    return (
        <BrowserRouter>
          <AuthProvider>
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/admin" element={
                  <ProtectedRoute allowedRole='Admin'>
                <Dashboard />
                  </ProtectedRoute>
                 } />
                <Route path="/admin/roles" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminRole />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminUser />
                  </ProtectedRoute>
                } />
                <Route path="/admin/customers" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminCustomer />
                  </ProtectedRoute>
                } />
                 <Route path="/admin/parkingAreas" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminParkingArea/>
                  </ProtectedRoute>
                } />
                 <Route path="/admin/quotations" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminQuotation/>
                  </ProtectedRoute>
                } />
                 <Route path="/admin/parkingSpots" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminParkingSpot/>
                  </ProtectedRoute>
                } />   
                <Route path="/admin/staffs" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminStaff/>
                  </ProtectedRoute>
                } />
                 <Route path="/admin/subscriptions" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminSubscription/>
                  </ProtectedRoute>
                } />
                <Route path="/admin/plates" element={
                  <ProtectedRoute allowedRole='Admin'>
                   <AdminPlate/>
                  </ProtectedRoute>
                } />
                  <Route path="/admin/reservations" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminReservation/>
                  </ProtectedRoute>
                } />
                  <Route path="/admin/sessions" element={
                  <ProtectedRoute allowedRole='Admin'>
                    <AdminSession/>
                  </ProtectedRoute>
                } />
                <Route path="/staff" element={
                  <ProtectedRoute allowedRole='Staff'>
                     <StaffHome/>
                  </ProtectedRoute>

                  } />
                <Route path="/staff/parkingAreas" element={
                  <ProtectedRoute allowedRole='Staff'>
                    <AdminParkingArea readOnly />
                  </ProtectedRoute>
                } />
                <Route path="/staff/parkingSpots" element={
                  <ProtectedRoute allowedRole='Staff'>
                    <AdminParkingSpot readOnly />
                  </ProtectedRoute>
                } />
                <Route path="/staff/profile" element={
                  <ProtectedRoute allowedRole='Staff'>
                    <StaffProfile />
                  </ProtectedRoute>
                } /><Route path="/staff/quotations" element={
                  <ProtectedRoute allowedRole='Staff'>
                    <AdminQuotation readOnly/>
                  </ProtectedRoute>
                } />
                 <Route path="/staff/subscriptions" element={
                  <ProtectedRoute allowedRole='Staff'>
                    <AdminSubscription readOnly/>
                  </ProtectedRoute>
                } />
                <Route path="/staff/plates" element={
                  <ProtectedRoute allowedRole='Staff'>
                   <AdminPlate readOnly/>
                  </ProtectedRoute>
                } />
                <Route path="/staff/sessions" element={
                  <ProtectedRoute allowedRole='Staff'>
                    <AdminSession readOnly/>
                  </ProtectedRoute>
                } />
                 <Route path="/staff/reservations" element={
                  <ProtectedRoute allowedRole='Staff'>
                    <AdminReservation readOnly/>
                  </ProtectedRoute>
                } />
                <Route path="/customer" element={
                  <ProtectedRoute allowedRole='Customer'>
                    <Navigate to="/" replace />
                  </ProtectedRoute>
                  } />
                <Route path="/customer/profile" element={
                  <ProtectedRoute allowedRole='Customer'>
                    <CustomerProfile />
                  </ProtectedRoute>
                } />
                <Route path="/customer/find-parking" element={
                  <ProtectedRoute allowedRole='Customer'>
                    <CustomerFindParking />
                  </ProtectedRoute>
                } />
                <Route path="/customer/reservations" element={
                  <ProtectedRoute allowedRole='Customer'>
                    <CustomerReservations />
                  </ProtectedRoute>
                } />
                <Route path="/customer/subscriptions" element={
                  <ProtectedRoute allowedRole='Customer'>
                    <CustomerSubscriptions />
                  </ProtectedRoute>
                } />
                <Route path="/customer/profile/create" element={
                  <ProtectedRoute allowedRole='Customer'>
                    <Navigate to="/customer/profile" replace />
                  </ProtectedRoute>
                } />
               
              </Routes>
          </AuthProvider>
                                                        
        </BrowserRouter>
          );                                                       
   }

        export default App;