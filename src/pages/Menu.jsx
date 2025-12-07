import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Filter, Star } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import { useNavigate } from 'react-router-dom'; // PENTING: Untuk memindahkan user ke halaman login

// --- DUMMY DATA MENU ---
const MENU_ITEMS = [
  // COFFEE
  { id: 1, name: 'Kopi Susu Gula Aren', category: 'coffee', price: 18000, rating: 4.8, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80', desc: 'Espresso + Gula Aren Organik + Fresh Milk' },
  { id: 2, name: 'Americano', category: 'coffee', price: 15000, rating: 4.5, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', desc: 'Double shot espresso dengan air panas' },
  { id: 3, name: 'Caramel Macchiato', category: 'coffee', price: 24000, rating: 4.9, image: 'https://images.unsplash.com/photo-1485808191679-5f8c7c8606f5?w=500&q=80', desc: 'Vanilla syrup, espresso, milk & caramel sauce' },
  
  // NON-COFFEE
  { id: 4, name: 'Matcha Latte', category: 'non-coffee', price: 22000, rating: 4.7, image: 'https://images.unsplash.com/photo-1515825838458-f2a94b20105a?w=500&q=80', desc: 'Premium matcha powder dengan susu creamy' },
  { id: 5, name: 'Red Velvet Latte', category: 'non-coffee', price: 22000, rating: 4.6, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500&q=80', desc: 'Rasa red velvet cake dalam bentuk minuman' },
  
  // FOOD
  { id: 6, name: 'Nasi Goreng Arjes', category: 'food', price: 25000, rating: 4.8, image: 'https://images.unsplash.com/photo-1603133872878-684f57143988?w=500&q=80', desc: 'Spesial bumbu rempah + Telur + Kerupuk' },
  { id: 7, name: 'Rice Bowl Teriyaki', category: 'food', price: 28000, rating: 4.7, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80', desc: 'Nasi pulen dengan ayam saus teriyaki' },
  
  // SNACK
  { id: 8, name: 'Mix Platter', category: 'snack', price: 30000, rating: 4.5, image: 'https://images.unsplash.com/photo-1576506542790-512442482e39?w=500&q=80', desc: 'Sosis, Nugget, Kentang Goreng jadi satu' },
  { id: 9, name: 'French Fries', category: 'snack', price: 15000, rating: 4.4, image: 'https://images.unsplash.com/photo-1630384060421-a4323ceca0df?w=500&q=80', desc: 'Kentang goreng renyah bumbu asin gurih' },
];

const Menu = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate(); // Inisialisasi fungsi navigasi
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIKA UTAMA: CEK LOGIN SAAT KLIK TAMBAH ---
  const handleAddToCart = (item) => {
    // 1. Cek apakah ada 'user' di penyimpanan browser
    const user = localStorage.getItem('user');
    
    if (user) {
      // KONDISI: SUDAH LOGIN
      // Lakukan fungsi tambah ke keranjang
      addToCart({ ...item, image: item.image });
    } else {
      // KONDISI: BELUM LOGIN
      // 1. Kasih Peringatan
      alert("Silakan Login atau Sign Up terlebih dahulu untuk memesan menu! 😊");
      // 2. Arahkan ke halaman Login
      navigate('/login');
    }
  };

  // LOGIKA FILTER & SEARCH (Biasa)
  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'non-coffee', label: 'Non-Coffee' },
    { id: 'food', label: 'Makanan Berat' },
    { id: 'snack', label: 'Cemilan' },
  ];

  return (
    <div className="min-h-screen bg-arjes-bg text-arjes-text pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Menu (Selalu Tampil) */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
          >
            Our Full Menu
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Nikmati sajian terbaik dari biji kopi pilihan dan bahan berkualitas. 
            Pesan sekarang, kami antar ke mejamu.
          </p>
        </div>

        {/* Filter & Search (Selalu Tampil) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-arjes-gold text-arjes-bg border-arjes-gold'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-arjes-gold hover:text-arjes-gold'
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
              placeholder="Cari kopi atau makanan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-arjes-gold focus:ring-1 focus:ring-arjes-gold transition-all"
            />
          </div>
        </div>

        {/* DAFTAR MENU (Selalu Tampil) */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={item.id}
                className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-arjes-gold/30 hover:bg-white/10 transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs text-yellow-400 font-bold border border-white/10">
                    <Star size={12} fill="currentColor" /> {item.rating}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-arjes-gold transition-colors">{item.name}</h3>
                    <span className="text-arjes-gold font-bold whitespace-nowrap">
                      {item.price / 1000}K
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                    {item.desc}
                  </p>

                  {/* TOMBOL INI YANG MENGATUR LOGIKA LOGIN */}
                  <button 
                    onClick={() => handleAddToCart(item)} 
                    className="w-full bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-arjes-gold hover:text-arjes-bg transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-arjes-gold/20"
                  >
                    <ShoppingCart size={18} /> Tambah
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               <Filter size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Menu tidak ditemukan</h3>
            <p className="text-gray-400">Coba cari kata kunci lain atau ganti kategori.</p>
            <button 
                onClick={() => {setSearchTerm(''); setActiveCategory('all');}}
                className="mt-4 text-arjes-gold hover:underline"
            >
                Reset Filter
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Menu;