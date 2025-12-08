// src/pages/user/Menu.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; 
import { fetchMenus } from '../../api/menuApi';   
import { useCart } from '../../context/CartContext'; 
import { useNavigate } from 'react-router-dom'; 
import { ShoppingCart, Search, Filter } from 'lucide-react'; // Star sudah dihapus
import { motion } from 'framer-motion';

const Menu = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // State untuk Filter & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // === 1. AMBIL DATA DARI ADMIN (REACT QUERY) ===
  const { 
    data: menus = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  // === 2. LOGIKA PROTEKSI LOGIN ===
  const handleAddToCart = (item) => {
    const user = localStorage.getItem('user');
    
    if (user) {
      addToCart(item);
    } else {
      alert("Silakan Login atau Sign Up terlebih dahulu untuk memesan! 😊");
      navigate('/login');
    }
  };

  // === 3. LOGIKA FILTER (CLIENT SIDE) ===
  const filteredItems = menus.filter((item) => {
    const itemCategory = item.category || 'food'; 
    const matchesCategory = activeCategory === 'all' || itemCategory === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'non-coffee', label: 'Non-Coffee' },
    { id: 'food', label: 'Makanan' },
    { id: 'snack', label: 'Cemilan' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1F18]">
        <p className="animate-pulse text-xl text-[#D4AF37]">Sedang menyiapkan menu lezat...</p>
      </div>
    );
  }

  if (isError) return <div className="text-white text-center mt-20">Gagal memuat menu. Cek koneksi API.</div>;

  return (
    <div className="min-h-screen bg-[#0F1F18] text-white pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Menu */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-[#D4AF37] mb-4"
          >
            Our Full Menu
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Nikmati sajian terbaik dari Arjes Kitchen. Pesan sekarang, kami antar ke mejamu.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-[#D4AF37] text-[#0F1F18] border-[#D4AF37]'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
        </div>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={item.id}
                className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group"
              >
                <div className="relative h-48 overflow-hidden bg-gray-800 flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-5xl">🍽️</span>
                  )}
                  {/* Bintang Rating DIHAPUS dari sini */}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>
                    <span className="text-[#D4AF37] font-bold whitespace-nowrap">
                      Rp {item.price?.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Deskripsi */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                    {item.desc || 'Menu spesial Arjes Kitchen.'}
                  </p>

                  <button 
                    onClick={() => handleAddToCart(item)} 
                    className="w-full bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#0F1F18] transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Masukan Keranjang
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Filter size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Menu tidak ditemukan</h3>
              <p className="text-gray-400 mt-2">
                {menus.length === 0 ? "Admin belum menginput menu." : "Coba cari kata kunci lain."}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Menu;