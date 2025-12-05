import React from 'react';
import { motion } from 'framer-motion';

const WhatsAppFloat = () => {
  // Ganti nomor ini dengan nomor WA admin
  const phoneNumber = "6281234567890"; 
  const message = "Halo Arjes Kitchen, saya mau tanya reservasi...";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[60] flex items-center gap-3 group"
    >
      {/* Teks "Butuh Bantuan?" (Popup Kiri) */}
      <span className="bg-white text-gray-800 px-4 py-2 rounded-xl font-bold shadow-xl opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 absolute right-16 whitespace-nowrap pointer-events-none text-sm border border-gray-100">
        Chat via WhatsApp
      </span>

      {/* Gambar Logo WhatsApp Official (Tanpa Background CSS lagi) */}
      <div className="relative">
        {/* Efek Glow di belakang logo biar nyala */}
        <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-40 animate-pulse"></div>
        
        {/* Logo Gambar Asli */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
          alt="WhatsApp Contact" 
          className="w-14 h-14 drop-shadow-2xl relative z-10"
        />
      </div>
    </motion.a>
  );
};

export default WhatsAppFloat;