import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectBasedOnRole from './components/RedirectBasedOnRole';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import DriverLayout from './layouts/DriverLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserRequestRide from './pages/user/RequestRide';
import UserRideHistory from './pages/user/RideHistory';
import UserAnalytics from './pages/user/Analytics';
import UserProfile from './pages/user/Profile';
import RideTracking from './pages/user/RideTracking';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverRides from './pages/driver/Rides';
import DriverEarnings from './pages/driver/Earnings';
import DriverProfile from './pages/driver/Profile';
import DriverTaxiManagement from './pages/driver/TaxiManagement';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ModelTraining from './pages/admin/ModelTraining';
import AdminUsers from './pages/admin/Users';
import AdminTaxis from './pages/admin/Taxis';
import AdminRides from './pages/admin/Rides';
import AdminSettings from './pages/admin/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            
            {/* User Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <UserLayout>
                    <UserDashboard />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/request-ride" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <UserLayout>
                    <UserRequestRide />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/ride-history" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <UserLayout>
                    <UserRideHistory />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/analytics" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <UserLayout>
                    <UserAnalytics />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/profile" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <UserLayout>
                    <UserProfile />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/ride-tracking/:rideId" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_USER']}>
                  <UserLayout>
                    <RideTracking />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Driver Routes */}
            <Route 
              path="/driver/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_DRIVER']}>
                  <DriverLayout>
                    <DriverDashboard />
                  </DriverLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/taxi" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_DRIVER']}>
                  <DriverLayout>
                    <DriverTaxiManagement />
                  </DriverLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/rides" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_DRIVER']}>
                  <DriverLayout>
                    <DriverRides />
                  </DriverLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/earnings" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_DRIVER']}>
                  <DriverLayout>
                    <DriverEarnings />
                  </DriverLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/profile" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_DRIVER']}>
                  <DriverLayout>
                    <DriverProfile />
                  </DriverLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/model-training" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminLayout>
                    <ModelTraining />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/taxis" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminLayout>
                    <AdminTaxis />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/rides" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminLayout>
                    <AdminRides />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="*" element={<RedirectBasedOnRole />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;