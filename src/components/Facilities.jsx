import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, BatteryCharging, Users, Music } from 'lucide-react';

const Facilities = () => {
  return (
    <section className="py-24 px-6 bg-arjes-bg">
      <div className="container mx-auto max-w-6xl">
        
        {/* Judul Section */}
        <div className="mb-16 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-arjes-gold text-sm font-bold tracking-widest uppercase"
          >
            Why Choose Us
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold mt-3 text-white"
          >
            More Than Just <span className="text-arjes-gold italic">Coffee.</span>
          </motion.h2>
        </div>

        {/* GRID LAYOUT (Kotak-Kotak Fasilitas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
          
          {/* 1. SUASANA (Tinggi) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="md:col-span-1 md:row-span-2 relative rounded-3xl overflow-hidden group border border-white/5"
          >
            <img 
              src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1000" 
              alt="Workspace" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-2xl font-bold text-white mb-2">Cozy Workspace</h3>
              <p className="text-arjes-muted text-sm">Desain industrial yang tenang, cocok untuk nugas atau skripsian seharian.</p>
            </div>
          </motion.div>

          {/* 2. WIFI (Lebar) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 bg-arjes-surface rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between border border-white/5 hover:border-arjes-gold/30 transition-colors group"
          >
            <div className="mb-6 md:mb-0">
              <div className="w-12 h-12 bg-arjes-gold/20 rounded-full flex items-center justify-center mb-4 text-arjes-gold">
                <Wifi size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Super Fast WiFi</h3>
              <p className="text-arjes-muted max-w-sm">Anti lag, anti putus. Koneksi prioritas khusus mahasiswa UNS yang butuh upload tugas berat.</p>
            </div>
            {/* Hiasan Speedometer */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-arjes-gold/20 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-0 border-t-4 border-arjes-gold rounded-full animate-spin"></div>
              <span className="text-xl font-bold text-white font-mono">100<span className="text-xs">Mbps</span></span>
            </div>
          </motion.div>

          {/* 3. COLOKAN (Kecil) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#2F4F3A] rounded-3xl p-6 flex flex-col justify-between border border-white/5 hover:-translate-y-2 transition-transform"
          >
            <BatteryCharging size={32} className="text-arjes-gold mb-4" />
            <div>
              <h4 className="text-xl font-bold text-white">Power Outlet</h4>
              <p className="text-white/60 text-sm mt-1">Colokan tersedia di setiap meja.</p>
            </div>
          </motion.div>

          {/* 4. KOMUNITAS (Kecil) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-arjes-gold rounded-3xl p-6 flex flex-col justify-between text-arjes-bg hover:-translate-y-2 transition-transform"
          >
            <Users size={32} className="mb-4" />
            <div>
              <h4 className="text-xl font-bold">Student Hub</h4>
              <p className="text-arjes-bg/70 text-sm mt-1">Tempat kumpul komunitas kampus.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Facilities;