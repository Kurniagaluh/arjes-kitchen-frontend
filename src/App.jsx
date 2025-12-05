import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- IMPORT COMPONENTS (Bagian-bagian halaman) ---
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuExpandable from './components/MenuExpandable';
import Facilities from './components/Facilities';
import Testimonials from './components/Testimonials';
import WhatsAppFloat from './components/WhatsAppFloat';
import Footer from './components/Footer';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// --- IMPORT PAGES (Halaman Utuh) ---
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';

// Komponen Halaman Depan (Landing Page) digabung jadi satu biar rapi
const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <MenuExpandable />
      <Facilities />
      <Testimonials />
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

// --- FUNGSI UTAMA APLIKASI ---
function App() {
  return (
    <div className="bg-arjes-bg text-arjes-text font-sans overflow-x-hidden selection:bg-arjes-gold selection:text-arjes-bg">
      
      {/* PENGATUR RUTE (TRAFFIC LIGHT) */}
      <Routes>
        
        {/* 1. Halaman Utama (Home) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 2. Halaman Login & Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 3. Halaman Booking (PENTING! Jangan sampai ketinggalan) */}
        <Route path="/booking" element={<Booking />} />

        {/* RUTE BARU: USER DASHBOARD */}
       <Route path="/user/dashboard" element={<UserDashboard />} />

       {/* RUTE BARU: ADMIN DASHBOARD */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
      </Routes>

    </div>
  );
}

export default App;