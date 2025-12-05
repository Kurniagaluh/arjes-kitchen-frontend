import { Link } from 'react-router-dom';

import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, ShoppingBag } from 'lucide-react'; // Kita pakai ikon dari Lucide

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
    >
      {/* Container Utama Navbar (Kapsul Panjang) */}
      <div className="w-full max-w-7xl bg-arjes-bg/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        
        {/* BAGIAN KIRI: Logo & Brand */}
        <div className="flex items-center gap-3">
          {/* Lingkaran Logo */}
          <div className="w-10 h-10 bg-arjes-gold rounded-full flex items-center justify-center shadow-lg shadow-arjes-gold/20">
            <Coffee className="text-arjes-bg w-6 h-6" />
          </div>
          {/* Tulisan Brand */}
          <span className="text-xl font-serif font-bold text-arjes-text tracking-wide hidden sm:block">
            Arjes Kitchen
          </span>
        </div>

        {/* BAGIAN TENGAH: Menu Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#" className="hover:text-arjes-gold transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-arjes-gold transition-all group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-arjes-gold transition-colors relative group">
            Menu
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-arjes-gold transition-all group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-arjes-gold transition-colors relative group">
            Product
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-arjes-gold transition-all group-hover:w-full"></span>
          </a>
          <a href="#" className="hover:text-arjes-gold transition-colors relative group">
            About Us
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-arjes-gold transition-all group-hover:w-full"></span>
          </a>
        </div>

        {/* BAGIAN KANAN: Tombol Action */}
        <div className="flex items-center gap-3">
  {/* Tombol Sign Up */}
  <Link to="/register" className="hidden lg:block px-5 py-2 rounded-full text-sm font-semibold text-arjes-gold border border-arjes-gold/50 hover:bg-arjes-gold hover:text-arjes-bg transition-all">
    Sign Up
  </Link>

  {/* Tombol Login */}
  <Link to="/login" className="px-6 py-2 rounded-full text-sm font-semibold bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20 hover:scale-105 transition-transform">
    Login
  </Link>
</div>

      </div>
    </motion.nav>
  );
};

export default Navbar;