import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './context/CartContext'; 

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
import Menu from './pages/Menu'; 

// PERBAIKAN DI SINI:
// Karena file Checkout.jsx ada di dalam folder 'user', kita harus ubah path-nya
import Checkout from './pages/user/Checkout'; 

import UserDashboard from './pages/user/UserDashboard'; 
import AdminDashboard from './pages/admin/AdminDashboard'; 

// Komponen Khusus: Tombol Keranjang Melayang
const FloatingCartButton = () => {
  const { cart, setIsSidebarOpen } = useCart();
  const location = useLocation();

  // Tombol hanya muncul di halaman menu
  if (location.pathname !== '/menu') {
    return null;
  }

  const totalItems = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-arjes-gold text-arjes-bg w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
    >
        <ShoppingBag size={28} />
        {totalItems > 0 && (
          <span className="absolute top-[-5px] right-[-5px] bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center animate-bounce">
            {totalItems}
          </span>
        )}
    </button>
  );
};

// Komponen Halaman Depan (Landing Page)
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

// --- FUNGSI UTAMA ---
function App() {
  return (
    <div className="bg-arjes-bg text-arjes-text font-sans overflow-x-hidden selection:bg-arjes-gold selection:text-arjes-bg">
      
      <Routes>
        {/* 1. Halaman Utama (Home) */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 2. Halaman Menu & Transaksi */}
        <Route path="/menu" element={<Menu />} /> 
        <Route path="/checkout" element={<Checkout />} />
        
        {/* 3. Auth & Booking */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<Booking />} />

        {/* 4. Dashboard */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
      </Routes>

      <FloatingCartButton />
    </div>
  );
}

export default App;