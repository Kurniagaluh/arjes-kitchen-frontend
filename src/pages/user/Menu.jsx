// src/pages/user/Menu.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; 
import { menuAPI } from '../../api/menu';   
import { useCart } from '../../context/CartContext'; 
import { useNavigate } from 'react-router-dom'; 
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Loader2, 
  Tag,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Menu = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // State untuk Filter & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // === 1. AMBIL DATA DARI DATABASE via menuAPI ===
  const { 
    data: menus = [], 
    isLoading, 
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['menus'],
    queryFn: () => menuAPI.getAll(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // === 2. LOGIKA PROTEKSI LOGIN & ADD TO CART ===
  const handleAddToCart = (item) => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      // Safe access untuk properties
      const cartItem = {
        id: item.id || Date.now(),
        menu_id: item.id || Date.now(),
        name: item.name || 'Menu Tanpa Nama',
        price: item.price || 0,
        image: item.image || getDefaultImage(item.category),
        category: item.category || 'food',
        qty: 1,
        desc: item.description || item.desc || `Menu dari Arjes Kitchen`,
        stock: item.stock,
        is_available: item.is_available,
        // Safe access untuk tanggal
        ...(item.created_at && { created_at: item.created_at }),
        ...(item.updated_at && { updated_at: item.updated_at })
      };
      
      // Validasi dengan safe access
      const itemStock = item.stock;
      const isAvailable = item.is_available;
      
      if (itemStock !== null && itemStock !== undefined && itemStock <= 0) {
        alert(`❌ Maaf, ${item.name || 'menu ini'} sedang habis!`);
        return;
      }
      
      if (isAvailable === false || item.status === 'unavailable') {
        alert(`❌ Maaf, ${item.name || 'menu ini'} sedang tidak tersedia!`);
        return;
      }
      
      addToCart(cartItem);
      
      // Feedback visual
      const button = document.querySelector(`[data-menu-id="${item.id}"]`);
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Ditambahkan!</span>';
        button.classList.add('bg-green-600', 'hover:bg-green-700');
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove('bg-green-600', 'hover:bg-green-700');
        }, 1500);
      }
    } else {
      alert("🍽️ Silakan Login terlebih dahulu untuk memesan!");
      navigate('/login');
    }
  };

  // Helper function untuk default image
  const getDefaultImage = (category) => {
    const imageMap = {
      'coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      'non-coffee': 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop',
      'food': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      'snack': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
      'dessert': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
      'default': 'https://via.placeholder.com/400x300/0F1F18/D4AF37?text=Arjes+Kitchen'
    };
    const cat = (category || 'default').toLowerCase();
    return imageMap[cat] || imageMap.default;
  };

  // === 3. LOGIKA FILTER & SORT DENGAN SAFE ACCESS ===
  const filteredAndSortedItems = React.useMemo(() => {
    if (!menus || !Array.isArray(menus)) return [];
    
    let filtered = menus.filter((item) => {
      // SAFE ACCESS: Gunakan default value untuk menghindari undefined
      const itemName = item.name || '';
      const itemCategory = (item.category || 'food').toLowerCase();
      const itemDescription = item.description || '';
      const searchLower = searchTerm.toLowerCase();
      
      // Filter kategori
      const matchesCategory = activeCategory === 'all' || itemCategory === activeCategory;
      
      // Filter pencarian (nama, deskripsi, kategori)
      const matchesSearch = 
        itemName.toLowerCase().includes(searchLower) ||
        itemDescription.toLowerCase().includes(searchLower) ||
        itemCategory.includes(searchLower);
      
      // Filter ketersediaan
      const isAvailable = 
        item.is_available !== false && 
        item.status !== 'unavailable' &&
        (item.stock === null || item.stock === undefined || item.stock > 0);
      
      return matchesCategory && matchesSearch && isAvailable;
    });

    // Sorting dengan safe access
    filtered.sort((a, b) => {
      const aName = a.name || '';
      const bName = b.name || '';
      const aCategory = a.category || '';
      const bCategory = b.category || '';
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      
      switch (sortBy) {
        case 'price-low':
          return aPrice - bPrice;
        case 'price-high':
          return bPrice - aPrice;
        case 'name':
          return aName.localeCompare(bName);
        case 'category':
          return aCategory.localeCompare(bCategory);
        default:
          return 0;
      }
    });

    return filtered;
  }, [menus, activeCategory, searchTerm, sortBy]);

  // === 4. EKSTRAK KATEGORI DENGAN SAFE ACCESS ===
  const categories = React.useMemo(() => {
    if (!menus || !Array.isArray(menus)) {
      return [{ id: 'all', label: 'Semua', count: 0 }];
    }
    
    const uniqueCategories = ['all'];
    const categoryCount = {};
    
    menus.forEach(item => {
      // SAFE ACCESS untuk category
      const cat = (item.category || 'food').toLowerCase();
      if (cat && !uniqueCategories.includes(cat)) {
        uniqueCategories.push(cat);
      }
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    return uniqueCategories.map(cat => ({
      id: cat,
      label: cat === 'all' ? 'Semua' : 
             cat.charAt(0).toUpperCase() + cat.slice(1),
      count: cat === 'all' ? menus.length : categoryCount[cat] || 0
    }));
  }, [menus]);

  // === 5. LOADING STATE ===
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] flex flex-col items-center justify-center pt-24 px-4">
        <div className="text-center max-w-md">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-[#D4AF37] mx-auto mb-6" />
            <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-xl"></div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#D4AF37] mb-3">
            Memuat Menu...
          </h2>
          <p className="text-gray-300">
            Sedang mengambil daftar menu terbaru dari database
          </p>
        </div>
      </div>
    );
  }

  // === 6. ERROR STATE ===
  if (isError) {
    console.error('Error fetching menus:', error);
    return (
      <div className="min-h-screen bg-[#0F1F18] text-white pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Gagal Memuat Menu
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            {error?.response?.status === 404 
              ? 'Endpoint menu tidak ditemukan.' 
              : error?.response?.status === 500
              ? 'Server mengalami masalah.'
              : error?.message?.includes('Network')
              ? 'Tidak dapat terhubung ke server.'
              : 'Terjadi kesalahan saat mengambil data menu.'}
          </p>
          <button 
            onClick={() => refetch()}
            className="bg-[#D4AF37] text-[#0F1F18] px-6 py-3 rounded-xl font-bold hover:bg-white transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // === 7. NO DATA STATE ===
  if (!menus || menus.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F1F18] text-white pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag size={48} className="text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Belum Ada Menu Tersedia
          </h2>
          <p className="text-gray-400 mb-6">
            Admin belum menambahkan menu ke dalam sistem.
          </p>
          <button 
            onClick={() => refetch()}
            className="bg-[#D4AF37] text-[#0F1F18] px-6 py-3 rounded-xl font-bold hover:bg-white transition-all"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] text-white pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Menu */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-[#D4AF37] mb-4"
          >
            Menu Arjes Kitchen
          </motion.h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {menus.length} menu spesial siap memanjakan lidah Anda
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-[#D4AF37] text-[#0F1F18] border-[#D4AF37]'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
              >
                {cat.label} ({cat.count})
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
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        {(activeCategory !== 'all' || searchTerm) && (
          <div className="mb-6 text-center">
            <p className="text-gray-400 text-sm">
              Menampilkan {filteredAndSortedItems.length} dari {menus.length} menu
              {activeCategory !== 'all' && ` • Kategori: ${categories.find(c => c.id === activeCategory)?.label}`}
              {searchTerm && ` • Pencarian: "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Grid Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.length > 0 ? (
            filteredAndSortedItems.map((item) => (
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
                      alt={item.name || 'Menu'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = getDefaultImage(item.category);
                      }}    
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-5xl">🍽️</span>
                      <p className="text-xs text-gray-400 mt-2">No Image</p>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.category || 'food'}
                  </div>
                  
                  {/* Stock Badge */}
                  {item.stock > 0 && item.stock < 5 && (
                    <div className="absolute top-3 right-3 bg-yellow-500/90 text-[#0F1F18] text-xs font-bold px-2 py-1 rounded-full">
                      Sisa {item.stock}
                    </div>
                  )}
                  
                  {item.stock === 0 && (
                    <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Habis
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                      {item.name || 'Menu Tanpa Nama'}
                    </h3>
                    <span className="text-[#D4AF37] font-bold whitespace-nowrap ml-2">
                      Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                    </span>
                  </div>
                  
                  {/* Deskripsi */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {item.description || item.desc || 'Menu spesial Arjes Kitchen.'}
                  </p>

                  {/* Tombol Add to Cart */}
                  <button 
                    data-menu-id={item.id}
                    onClick={() => handleAddToCart(item)} 
                    disabled={item.stock === 0 || item.is_available === false}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      item.stock === 0 || item.is_available === false
                        ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-[#D4AF37] hover:text-[#0F1F18] active:scale-95'
                    }`}
                  >
                    <ShoppingCart size={18} />
                    {item.stock === 0 ? 'Stok Habis' : 
                     item.is_available === false ? 'Tidak Tersedia' : 
                     'Masukan Keranjang'}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Menu tidak ditemukan</h3>
              <p className="text-gray-400 mb-4">
                Tidak ada menu yang sesuai dengan filter Anda.
              </p>
              <div className="space-x-4">
                <button 
                  onClick={() => setSearchTerm('')}
                  className="bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all"
                >
                  Hapus Pencarian
                </button>
                <button 
                  onClick={() => setActiveCategory('all')}
                  className="bg-[#D4AF37] text-[#0F1F18] px-4 py-2 rounded-xl font-bold hover:bg-white transition-all"
                >
                  Lihat Semua Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {filteredAndSortedItems.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              Menemukan {filteredAndSortedItems.length} menu yang cocok
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Menu;