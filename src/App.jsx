import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- IMPORT COMPONENTS ---
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuExpandable from './components/MenuExpandable';
import Facilities from './components/Facilities';
import Testimonials from './components/Testimonials';
import WhatsAppFloat from './components/WhatsAppFloat';
import Footer from './components/Footer';

// --- IMPORT PAGES ---
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/BookingPage';
import Menu from './pages/user/Menu';
import ManageMenu from './pages/admin/ManageMenu';
import Checkout from './pages/user/Checkout';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTables from './pages/admin/AdminTables'; 

// Import ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';

// --- 1. KOMPONEN LANDING PAGE ---
const LandingPage = () => {
  return (
    <>
      <Hero />
      <MenuExpandable />
      <div id="about-us">
        <Facilities />
        <Testimonials />
      </div>
    </>
  );
};

// --- 2. KOMPONEN UTAMA DENGAN AUTH ---
function AppContent() {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  // --- LOGIKA MENYEMBUNYIKAN NAVBAR & FOOTER ---
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/user');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const showNavbar = !isDashboard && !isAuthPage;
  const showFooter = !isDashboard && !isAuthPage;
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="bg-arjes-bg text-arjes-text font-sans overflow-x-hidden selection:bg-arjes-gold selection:text-arjes-bg min-h-screen flex flex-col justify-between">
      
      {/* 1. GLOBAL NAVBAR */}
      {showNavbar && <Navbar />}

      {/* 2. ROUTING HALAMAN */}
      <div className={!isDashboard ? "" : ""}> 
        <Routes>
          {/* A. Halaman Publik */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<Menu />} />
          
          {/* B. Halaman Transaksi */}
          <Route path="/cart" element={<Checkout />} /> 
          <Route path="/checkout" element={<Checkout />} />
          
          {/* C. Auth & Reservasi */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          } />
          <Route path="/booking" element={<Booking />} />

          {/* D. Protected Routes - User */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          {/* E. Protected Routes - Admin Only */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/menu" element={
            <ProtectedRoute requireAdmin>
              <ManageMenu />
            </ProtectedRoute>
          } />
          
          {/* ✅ TAMBAHKAN ROUTE INI UNTUK ADMIN TABLES */}
          <Route path="/admin/tables" element={
            <ProtectedRoute requireAdmin>
              <AdminTables />
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* 3. GLOBAL FOOTER */}
      {showFooter && <Footer />}

      {/* 4. FLOATING WIDGETS (WhatsApp) */}
      {!isAdminRoute && <WhatsAppFloat />}
    </div>
  );
}

// --- 3. WRAP APP DENGAN AUTH PROVIDER ---
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;