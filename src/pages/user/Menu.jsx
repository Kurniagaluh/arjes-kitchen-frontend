// src/pages/user/Menu.jsx
import React, { useState, useRef } from 'react';
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
  AlertCircle,
  Coffee,
  Utensils,
  Cake,
  IceCream,
  ChevronDown,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  Home,
  ArrowLeft,
  Check,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Menu = () => {
  const { addToCart, cart, getTotalItems } = useCart();
  const navigate = useNavigate();
  const buttonRefs = useRef({});

  // State untuk Filter & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [addingItemId, setAddingItemId] = useState(null);

  // === 1. AMBIL DATA DARI DATABASE via menuAPI ===
  const { 
    data: menus = [], 
    isLoading, 
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuAPI.getAll(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // === 2. LOGIKA PROTEKSI LOGIN & ADD TO CART ===
  const handleAddToCart = async (item) => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      alert("🍽️ Silakan Login terlebih dahulu untuk memesan!");
      navigate('/login');
      return;
    }

    // Buat cart item dengan struktur yang benar
    const cartItem = {
      id: item.id.toString(),
      menu_id: item.id,
      name: item.nama || 'Menu Tanpa Nama',
      price: item.harga || 0,
      image: item.gambar_url || getDefaultImage(item.kategori),
      category: item.kategori || 'makanan',
      desc: item.deskripsi || `Menu spesial Arjes Kitchen`,
      stok: item.stok || 10,
      tersedia: item.tersedia,
      qty: 1
    };
    
    console.log('Adding to cart:', cartItem);

    // Validasi ketersediaan
    if (cartItem.stok <= 0) {
      alert(`❌ Maaf, ${cartItem.name} sedang habis!`);
      return;
    }
    
    if (cartItem.tersedia === false || cartItem.tersedia === 0) {
      alert(`❌ Maaf, ${cartItem.name} sedang tidak tersedia!`);
      return;
    }
    
    // Cek apakah item sudah ada di cart
    const existingItem = cart.find(cartItem => cartItem.id === item.id.toString());
    if (existingItem) {
      if (existingItem.qty >= cartItem.stok) {
        alert(`❌ Maaf, stok ${item.nama || 'menu ini'} tidak mencukupi!`);
        return;
      }
    }
    
    // Set loading state untuk item ini
    setAddingItemId(item.id);
    
    // Tambahkan ke keranjang dengan timeout untuk animasi
    setTimeout(() => {
      addToCart(cartItem);
      setAddingItemId(null);
    }, 500);
  };

  // Helper function untuk default image
  const getDefaultImage = (kategori) => {
    const imageMap = {
      'kopi': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      'minuman': 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop',
      'makanan': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      'snack': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
      'dessert': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop',
      'default': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&q=80'
    };
    const cat = (kategori || 'default').toLowerCase();
    return imageMap[cat] || imageMap.default;
  };

  // Helper untuk icon kategori
  const getCategoryIcon = (kategori) => {
    const kategoriLower = (kategori || '').toLowerCase();
    
    if (kategoriLower.includes('kopi') || kategoriLower.includes('coffee')) {
      return <Coffee className="inline mr-1" size={14} />;
    } else if (kategoriLower.includes('minuman') || kategoriLower.includes('drink')) {
      return <Coffee className="inline mr-1" size={14} />;
    } else if (kategoriLower.includes('makanan') || kategoriLower.includes('food')) {
      return <Utensils className="inline mr-1" size={14} />;
    } else if (kategoriLower.includes('dessert') || kategoriLower.includes('sweet')) {
      return <Cake className="inline mr-1" size={14} />;
    } else if (kategoriLower.includes('snack')) {
      return <IceCream className="inline mr-1" size={14} />;
    }
    return <Utensils className="inline mr-1" size={14} />;
  };

  // Helper untuk format harga
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // === 3. LOGIKA FILTER & SORT DENGAN SAFE ACCESS ===
  const filteredAndSortedItems = React.useMemo(() => {
    if (!menus || !Array.isArray(menus)) return [];
    
    let filtered = menus.filter((item) => {
      const itemName = item.nama || '';
      const itemKategori = (item.kategori || 'makanan').toLowerCase();
      const itemDeskripsi = item.deskripsi || '';
      const searchLower = searchTerm.toLowerCase();
      
      const matchesCategory = activeCategory === 'all' || itemKategori === activeCategory;
      const matchesSearch = 
        itemName.toLowerCase().includes(searchLower) ||
        itemDeskripsi.toLowerCase().includes(searchLower) ||
        itemKategori.includes(searchLower);
      const isTersedia = item.tersedia === true || item.tersedia === 1;
      
      return matchesCategory && matchesSearch && isTersedia;
    });

    // Sorting dengan safe access
    filtered.sort((a, b) => {
      const aName = a.nama || '';
      const bName = b.nama || '';
      const aKategori = a.kategori || '';
      const bKategori = b.kategori || '';
      const aHarga = a.harga || 0;
      const bHarga = b.harga || 0;
      const aCreated = new Date(a.created_at || 0);
      const bCreated = new Date(b.created_at || 0);
      
      switch (sortBy) {
        case 'harga-rendah':
          return aHarga - bHarga;
        case 'harga-tinggi':
          return bHarga - aHarga;
        case 'nama':
          return aName.localeCompare(bName);
        case 'kategori':
          return aKategori.localeCompare(bKategori);
        case 'terbaru':
          return bCreated - aCreated;
        case 'terlama':
          return aCreated - bCreated;
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
    const kategoriCount = {};
    
    menus.forEach(item => {
      const kat = (item.kategori || 'makanan').toLowerCase();
      if (kat && !uniqueCategories.includes(kat)) {
        uniqueCategories.push(kat);
      }
      kategoriCount[kat] = (kategoriCount[kat] || 0) + 1;
    });
    
    return uniqueCategories.map(kat => ({
      id: kat,
      label: kat === 'all' ? 'Semua' : 
             kat.charAt(0).toUpperCase() + kat.slice(1),
      count: kat === 'all' ? menus.length : kategoriCount[kat] || 0,
      icon: getCategoryIcon(kat)
    }));
  }, [menus]);

  // === 5. LOADING STATE ===
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] flex flex-col items-center justify-center text-white">
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

  // Hitung statistik
  const availableMenus = menus.filter(item => item.tersedia === true || item.tersedia === 1).length;
  const averagePrice = menus.length > 0 
    ? menus.reduce((sum, item) => sum + (item.harga || 0), 0) / menus.length 
    : 0;
  const uniqueCategoriesCount = new Set(menus.map(item => item.kategori?.toLowerCase())).size;

  // Total items dan harga di cart
  const totalCartItems = getTotalItems();
  const totalCartPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] text-white">
      {/* Cart Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0F1F18]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <ArrowLeft size={16} />
              </div>
              <span className="text-sm">Kembali</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Home size={16} />
                </div>
                <span>Beranda</span>
              </button>
              
              {totalCartItems > 0 && (
                <button
                  onClick={() => navigate('/cart')}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] px-4 py-2 rounded-lg font-bold hover:from-white hover:to-gray-200 transition-all shadow-lg group"
                >
                  <ShoppingCart size={18} />
                  <span>Keranjang</span>
                  <span className="bg-[#0F1F18] text-[#D4AF37] text-xs rounded-full px-2 py-1 font-bold min-w-[24px]">
                    {totalCartItems}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-20 px-4">
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
              {availableMenus} menu spesial siap memanjakan lidah Anda
            </p>
            
            {/* Stats Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-wrap justify-center gap-4"
            >
              <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                <Package size={16} className="text-[#D4AF37]" />
                <span className="text-sm">{menus.length} Menu</span>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                <Tag size={16} className="text-[#D4AF37]" />
                <span className="text-sm">{uniqueCategoriesCount} Kategori</span>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                <DollarSign size={16} className="text-[#D4AF37]" />
                <span className="text-sm">Rata-rata {formatPrice(averagePrice)}</span>
              </div>
            </motion.div>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border flex-shrink-0 flex items-center gap-2 ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] border-[#D4AF37] shadow-lg'
                      : 'bg-white/5 backdrop-blur-sm text-gray-300 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
                >
                  {cat.icon}
                  {cat.label} 
                  <span className="text-xs opacity-75 bg-black/20 px-1.5 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari menu..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder-gray-500"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white px-4 py-3 rounded-xl hover:bg-white/10 transition-all"
                >
                  <Filter size={18} />
                  <span>Urutkan</span>
                  <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-[#0F1F18]/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        {[
                          { id: 'nama', label: 'Nama A-Z', icon: null },
                          { id: 'harga-rendah', label: 'Harga Terendah', icon: <TrendingDown size={14} /> },
                          { id: 'harga-tinggi', label: 'Harga Tertinggi', icon: <TrendingUp size={14} /> },
                          { id: 'kategori', label: 'Kategori', icon: null },
                          { id: 'terbaru', label: 'Terbaru', icon: null },
                          { id: 'terlama', label: 'Terlama', icon: null }
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSortBy(option.id);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                              sortBy === option.id 
                                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#F4D03F]/20 text-[#D4AF37] border border-[#D4AF37]/30' 
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {option.icon && <span className="opacity-70">{option.icon}</span>}
                            {option.label}
                            {sortBy === option.id && <Check size={14} className="ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Results Info */}
          {(activeCategory !== 'all' || searchTerm) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-gray-400 text-sm">
                  Menampilkan <span className="text-white font-bold">{filteredAndSortedItems.length}</span> dari {menus.length} menu
                  {activeCategory !== 'all' && (
                    <span className="ml-2 text-[#D4AF37]">
                      • Kategori: {categories.find(c => c.id === activeCategory)?.label}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="ml-2 text-[#D4AF37]">
                      • Pencarian: "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>
            </motion.div>
          )}

          {/* Grid Menu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => {
                const isAdding = addingItemId === item.id;
                const isOutOfStock = item.stok === 0;
                const isUnavailable = item.tersedia === false || item.tersedia === 0;
                const isLowStock = item.stok > 0 && item.stok < 5;
                const existingInCart = cart.find(cartItem => cartItem.id === item.id.toString());
                const currentQty = existingInCart?.qty || 0;
                const maxReached = currentQty >= item.stok;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={item.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-[#D4AF37]/5"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                      {item.gambar_url ? (
                        <img 
                          src={item.gambar_url} 
                          alt={item.nama || 'Menu'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = getDefaultImage(item.kategori);
                          }}    
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
                          <div className="text-5xl mb-2 text-gray-600">
                            {getCategoryIcon(item.kategori)}
                          </div>
                          <p className="text-xs text-gray-500">Gambar tidak tersedia</p>
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        {getCategoryIcon(item.kategori)}
                        <span className="capitalize">{item.kategori || 'makanan'}</span>
                      </div>
                      
                      {/* Stock Badge */}
                      {isLowStock && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#0F1F18] text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          ⚠️ Sisa {item.stok}
                        </div>
                      )}
                      
                      {isOutOfStock && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          Habis
                        </div>
                      )}
                      
                      {/* Cart Quantity Badge */}
                      {existingInCart && (
                        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          {currentQty} di keranjang
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Title and Price */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                            {item.nama || 'Menu Tanpa Nama'}
                          </h3>
                          {existingInCart && (
                            <p className="text-xs text-[#D4AF37] mt-1">
                              ✓ {currentQty} item di keranjang
                            </p>
                          )}
                        </div>
                        <span className="text-[#D4AF37] font-bold whitespace-nowrap ml-2 text-lg">
                          {formatPrice(item.harga || 0)}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {item.deskripsi || 'Menu spesial dari Arjes Kitchen.'}
                      </p>

                      {/* Additional Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          {item.created_at && (
                            <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
                              <Clock size={10} />
                              {new Date(item.created_at).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                        {item.stok !== null && item.stok !== undefined && (
                          <span className={`px-2 py-1 rounded-full ${
                            item.stok > 10 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : item.stok > 0 
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            Stok: {item.stok}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button 
                        whileTap={{ scale: 0.97 }}
                        data-menu-id={item.id}
                        onClick={() => !isAdding && handleAddToCart(item)} 
                        disabled={isOutOfStock || isUnavailable || isAdding || maxReached}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden group/btn ${
                          isOutOfStock || isUnavailable
                            ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed'
                            : isAdding
                            ? 'bg-[#D4AF37] text-[#0F1F18] cursor-wait'
                            : maxReached
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#F4D03F] hover:text-[#0F1F18]'
                        }`}
                      >
                        {isAdding ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={18} className="animate-spin" />
                            Menambahkan...
                          </span>
                        ) : isOutOfStock ? (
                          <span className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            Stok Habis
                          </span>
                        ) : isUnavailable ? (
                          <span className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            Tidak Tersedia
                          </span>
                        ) : maxReached ? (
                          <span className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            Stok Maksimal
                          </span>
                        ) : (
                          <>
                            <span className="relative z-10 flex items-center gap-2">
                              <ShoppingCart size={18} />
                              {existingInCart ? 'Tambah Lagi' : 'Masukan Keranjang'}
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Menu tidak ditemukan</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Tidak ada menu yang sesuai dengan filter Anda. Coba gunakan kata kunci lain atau pilih kategori berbeda.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/10"
                  >
                    Hapus Pencarian
                  </button>
                  <button 
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchTerm('');
                    }}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] px-5 py-2.5 rounded-xl font-bold hover:from-white hover:to-gray-200 transition-all shadow-lg"
                  >
                    Lihat Semua Menu
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Info */}
          {filteredAndSortedItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-400 text-sm">
                Menemukan <span className="text-white font-bold">{filteredAndSortedItems.length}</span> menu yang cocok
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <div className="text-xs text-gray-400 flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Tersedia
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  Stok Terbatas
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  Habis
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Cart Indicator Button */}
      {totalCartItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={() => navigate('/cart')}
            className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] px-6 py-3 rounded-xl font-bold hover:from-white hover:to-gray-200 transition-all shadow-2xl flex items-center gap-3 group relative overflow-hidden"
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                {totalCartItems}
              </span>
            </div>
            <span>Keranjang</span>
            <span className="ml-2 px-2 py-1 bg-[#0F1F18] text-[#D4AF37] text-xs rounded-full font-bold min-w-[80px]">
              {formatPrice(totalCartPrice)}
            </span>
            <svg 
              className="w-4 h-4 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </motion.div>
      )}

      {/* Cart Notification (Floating) */}
      <AnimatePresence>
        {totalCartItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className="fixed top-24 right-6 z-50"
          >
            <div className="bg-gradient-to-br from-[#0F1F18]/90 to-[#1a2d25]/90 backdrop-blur-lg border border-[#D4AF37]/20 rounded-2xl p-4 shadow-2xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/20 to-[#F4D03F]/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-[#D4AF37]/30">
                    <ShoppingCart size={18} className="text-[#D4AF37]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {totalCartItems}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Keranjang aktif</p>
                  <p className="text-xs text-gray-300">
                    {formatPrice(totalCartPrice)} • {cart.length} item
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full text-center text-sm bg-gradient-to-r from-[#D4AF37]/20 to-[#F4D03F]/20 text-[#D4AF37] hover:from-[#D4AF37]/30 hover:to-[#F4D03F]/30 px-3 py-2 rounded-lg transition-all"
                >
                  Lihat Keranjang
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;