import React from 'react';
import { Link } from 'react-router-dom'; // PENTING: Import ini biar bisa pindah halaman
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      
      {/* Background Glow Effect (Hiasan) */}
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
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
            Taste of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-arjes-gold to-yellow-200">
              Knowledge
            </span>
          </h1>
          <p className="text-arjes-muted text-lg mb-8 max-w-md leading-relaxed">
            Rasakan harmoni rasa kopi terbaik di lingkungan Universitas Sebelas Maret. 
            Tempat ternyaman untuk diskusi & inspirasi.
          </p>
          
          <div className="flex gap-4">
            {/* TOMBOL 1: BOOKING (Pindah Halaman) */}
            <Link 
              to="/booking" 
              className="px-8 py-4 bg-arjes-gold text-arjes-bg font-bold rounded-xl shadow-lg shadow-arjes-gold/20 hover:translate-y-[-2px] transition-all inline-block text-center"
            >
              Book a Table
            </Link>
            
            {/* TOMBOL 2: VIEW MENU (Scroll ke Bawah) */}
            <a 
              href="#menu" 
              className="px-8 py-4 border border-white/20 rounded-xl hover:bg-white/5 transition-colors inline-block text-center cursor-pointer"
            >
              View Menu
            </a>
          </div>
        </motion.div>

        {/* Kolom Kanan: Gambar */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          {/* Bingkai Gambar */}
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 group">
             {/* Gambar Dummy dari Unsplash */}
            <img 
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop" 
              alt="Arjes Coffee" 
              className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-arjes-bg/80 to-transparent" />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;