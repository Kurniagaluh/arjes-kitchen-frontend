import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

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
import Booking from './pages/Booking';

// Update: Arahkan ke folder spesifik (User vs Admin)
import Menu from './pages/user/Menu';           // Halaman Menu Pembeli (Read Only)
import ManageMenu from './pages/admin/ManageMenu'; // Halaman Menu Admin (CRUD)
import Checkout from './pages/user/Checkout'; 

// Import Dashboard
import UserDashboard from './pages/user/UserDashboard'; 
import AdminDashboard from './pages/admin/AdminDashboard'; 

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

// --- FUNGSI UTAMA APLIKASI ---
function App() {
  const location = useLocation();

  // --- LOGIKA MENYEMBUNYIKAN NAVBAR & FOOTER ---
  // Sembunyikan Navbar/Footer di Dashboard (Admin/User) dan Halaman Auth
  // Tambahkan juga '/admin/menu' agar saat admin input data, tampilan full tanpa navbar publik
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/user');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const showNavbar = !isDashboard && !isAuthPage;
  const showFooter = !isDashboard && !isAuthPage;

  // --- LOGIKA MENYEMBUNYIKAN WA ---
  // Khusus Admin, tombol WA dihilangkan agar tidak mengganggu
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
          
          {/* Halaman Menu untuk Pembeli */}
          <Route path="/menu" element={<Menu />} /> 
          
          {/* B. Halaman Transaksi */}
          <Route path="/cart" element={<Checkout />} /> 
          <Route path="/checkout" element={<Checkout />} />
          
          {/* C. Auth & Reservasi */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Booking />} />

          {/* D. Dashboard Area & Admin (Protected) */}
          <Route path="/profile" element={<UserDashboard />} /> 
          <Route path="/user/dashboard" element={<UserDashboard />} />
          
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Route Admin Input Menu (BARU) */}
          <Route path="/admin/menu" element={<ManageMenu />} />
        </Routes>
      </div>

      {/* 3. GLOBAL FOOTER */}
      {showFooter && <Footer />}

      {/* 4. FLOATING WIDGETS (WhatsApp) */}
      {/* Hanya muncul jika BUKAN halaman Admin */}
      {!isAdminRoute && <WhatsAppFloat />}

    </div>
  );
}

export default App;