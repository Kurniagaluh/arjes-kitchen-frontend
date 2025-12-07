import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Tambah useNavigate
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  const navigate = useNavigate();

  // FUNGSI LOGIKA "SMART BOOKING"
  const handleBookingClick = () => {
    // 1. Cek apakah ada data user di penyimpanan browser
    const user = localStorage.getItem('user');

    if (user) {
      // KONDISI A: SUDAH LOGIN -> Langsung ke Booking
      navigate('/booking');
    } else {
      // KONDISI B: BELUM LOGIN -> Arahkan ke Login
      // Opsional: Kasih alert biar user tau kenapa dilempar ke login
      alert("Silakan Login terlebih dahulu untuk melakukan reservasi meja."); 
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden bg-arjes-bg">
      
      {/* Background Glow Effect */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-arjes-gold/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Kolom Kiri: Teks */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-arjes-gold tracking-[0.2em] text-sm font-bold uppercase mb-4 block">
            Welcome to UNS
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
            Taste of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-arjes-gold to-yellow-200">
              Knowledge
            </span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-md leading-relaxed">
            Rasakan harmoni rasa kopi terbaik di lingkungan Universitas Sebelas Maret. 
            Tempat ternyaman untuk diskusi & inspirasi.
          </p>
          
          <div className="flex flex-wrap gap-4">
            {/* TOMBOL 1: BOOKING (SMART BUTTON) */}
            {/* Kita ubah dari <Link> menjadi <button> agar bisa pakai logika onClick */}
            <button 
              onClick={handleBookingClick} 
              className="px-8 py-4 bg-arjes-gold text-arjes-bg font-bold rounded-xl shadow-lg shadow-arjes-gold/20 hover:scale-105 transition-transform inline-block text-center cursor-pointer"
            >
              Book a Table
            </button>
            
            {/* TOMBOL 2: VIEW MENU */}
            <Link 
              to="/menu" 
              className="group px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              View Menu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Kolom Kanan: Gambar */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden md:block"
        >
          {/* Bingkai Gambar */}
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 group">
            <img 
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop" 
              alt="Arjes Coffee" 
              className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-arjes-bg/80 to-transparent" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;