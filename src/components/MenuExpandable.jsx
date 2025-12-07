import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom'; // PENTING: Import ini biar tombolnya jalan

const menuItems = [
  {
    id: 1,
    title: "Signature Coffee",
    name: "Kopi Susu Gula Aren",
    price: "18K",
    desc: "Perpaduan espresso robusta lampung dengan gula aren organik.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80", 
    bg: "bg-[#1A2F23]"
  },
  {
    id: 2,
    title: "Best Seller",
    name: "Nasi Goreng Arjes",
    price: "25K",
    desc: "Nasi goreng rempah rahasia dengan topping sosis & telur mata sapi.",
    image: "https://images.unsplash.com/photo-1603133872878-684f57143988?w=800&q=80",
    bg: "bg-[#243E30]"
  },
  {
    id: 3,
    title: "Japanese Vibe",
    name: "Matcha Latte",
    price: "24K",
    desc: "Pure Matcha dari Kyoto dicampur susu segar creamy.",
    image: "https://images.unsplash.com/photo-1515825838458-f2a94b20105a?w=800&q=80",
    bg: "bg-[#2F4F3A]"
  },
  {
    id: 4,
    title: "Premium Cut",
    name: "Wagyu Steak",
    price: "85K",
    desc: "Daging wagyu meltique empuk dengan saus mushroom.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f40388085?w=800&q=80",
    bg: "bg-[#1A2F23]"
  },
  {
    id: 5,
    title: "Sweet Tooth",
    name: "Choco Lava",
    price: "20K",
    desc: "Coklat lumer hangat dengan satu scoop es krim vanilla.",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    bg: "bg-[#243E30]"
  },
];

const MenuExpandable = () => {
  // Default yang kebuka adalah item pertama (id: 1)
  const [activeId, setActiveId] = useState(1);

  return (
    <section className="py-24 bg-arjes-bg overflow-hidden flex flex-col justify-center">
      
      {/* Header */}
      <div className="container mx-auto px-6 mb-12 flex justify-between items-end">
        <div>
          <span className="text-arjes-gold tracking-widest text-sm font-bold uppercase">Our Menu</span>
          <h2 className="text-4xl md:text-6xl font-serif text-white mt-2">
            Watch. <br /> Taste. <span className="text-arjes-gold">Enjoy.</span>
          </h2>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-gray-400 max-w-xs text-sm">
            Geser atau klik kartu untuk melihat detail menu andalan kami hari ini.
          </p>
        </div>
      </div>

      {/* THE EXPANDABLE CARDS */}
      <div className="container mx-auto px-4 h-[500px] flex gap-4">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            onClick={() => setActiveId(item.id)}
            className={`relative h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-spring
              ${activeId === item.id ? 'flex-[3.5]' : 'flex-[0.5] hover:flex-[0.8]'}
            `}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Background Image (Gelap biar teks kebaca) */}
            <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-500 hover:bg-black/20" />
            <img 
              src={item.image} 
              alt={item.name}
              onError={(e) => {e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800"}} // Fallback Image
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />

            {/* KONTEN SAAT KARTU AKTIF (LEBAR) */}
            {activeId === item.id && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute inset-0 z-20 p-8 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent"
              >
                <div className="flex justify-between items-start mb-4">
                   <span className="px-3 py-1 bg-arjes-gold/20 text-arjes-gold text-xs font-bold rounded-full border border-arjes-gold/30 uppercase tracking-wider backdrop-blur-md">
                     {item.title}
                   </span>
                   <span className="text-3xl font-serif text-white italic">
                     {item.price}
                   </span>
                </div>

                <h3 className="text-4xl font-bold text-white mb-2 leading-tight">
                  {item.name}
                </h3>
                <p className="text-gray-300 text-sm mb-6 max-w-md line-clamp-2">
                  {item.desc}
                </p>

                {/* TOMBOL YANG SUDAH DIPERBAIKI */}
                <Link 
                    to="/menu" 
                    className="flex items-center gap-2 bg-arjes-gold text-arjes-bg px-6 py-3 rounded-xl font-bold w-fit hover:bg-white transition-colors group"
                >
                  Pesan Sekarang
                  <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                </Link>
                
              </motion.div>
            )}

            {/* KONTEN SAAT KARTU TIDAK AKTIF (SEMPIT) */}
            {activeId !== item.id && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                {/* Teks Vertikal */}
                <h3 className="text-2xl font-bold text-white/80 rotate-[-90deg] whitespace-nowrap tracking-widest uppercase origin-center mix-blend-overlay">
                  {item.title}
                </h3>
                
                {/* Icon Bulat di Bawah */}
                <div className="absolute bottom-8 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                   <Coffee size={18} className="text-white" />
                </div>
              </div>
            )}
            
          </motion.div>
        ))}
      </div>

    </section>
  );
};

export default MenuExpandable;