import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, Coffee, X, ShoppingBag, Plus, Minus, ArrowRight, Loader2, Tag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

const Menu = () => {
  const { 
    cart, addToCart, updateQuantity, 
    isSidebarOpen, setIsSidebarOpen
  } = useCart();
  
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA MENU ---
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu'); // GET /api/menu
      const data = response.data.data || response.data;
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal fetch menu:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const categories = ['All', 'Coffee', 'Non-Coffee', 'Food'];

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(number));
  };
  
  // Component Card Menu
  const MenuCard = ({ item }) => (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-arjes-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col group"
    >
      <div className="h-40 overflow-hidden relative">
        <img 
          src={item.image || "https://placehold.co/400x300/1A2F23/C5A059?text=Menu+Arjes"} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <span className="absolute top-3 left-3 bg-arjes-gold text-arjes-bg px-3 py-1 rounded text-xs font-bold">{item.category}</span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
        <p className="text-arjes-muted text-xs line-clamp-2 flex-grow">{item.description}</p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
          <span className="text-xl font-bold text-arjes-gold">{formatRupiah(item.price)}</span>
          <button 
            onClick={() => addToCart({ id: item.id, name: item.name, price: Number(item.price), image: item.image, category: item.category })}
            className="bg-white/10 text-white p-2 rounded-full hover:bg-arjes-gold hover:text-arjes-bg transition-colors shadow-md"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-arjes-bg text-white font-sans pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h1 className="text-5xl font-serif font-bold text-white mb-2">Our Full Menu</h1>
        <p className="text-arjes-muted text-lg mb-8">Pilih menu favoritmu, tambahkan ke keranjang, dan checkout!</p>

        {/* Tab Kategori */}
        <div className="flex flex-wrap justify-start gap-3 mb-10 border-b border-white/10 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${activeCategory === cat 
                  ? "bg-arjes-gold text-arjes-bg shadow-md" 
                  : "bg-white/5 text-arjes-muted hover:text-white"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List Menu */}
        {loading ? (
          <div className="text-center py-20 text-arjes-muted flex flex-col items-center">
            <Loader2 className="animate-spin mb-3" size={32} />
            <p>Memuat menu dari database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-center py-20 text-arjes-muted">Tidak ada menu di kategori ini.</p>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => <MenuCard key={item.id} item={item} />)}
          </motion.div>
        )}
      </div>
      
      {/* --- CART SIDEBAR --- */}
      <AnimatePresence>
        {isSidebarOpen && <CartSidebar />}
      </AnimatePresence>
    </div>
  );
};

// --- KOMPONEN SIDEBAR CART ---
const CartSidebar = () => {
    const { 
        cart, removeFromCart, updateQuantity, clearCart,
        calculateTotal, calculateSubtotal, applyVoucher,
        isSidebarOpen, setIsSidebarOpen, activeVoucher, calculateDiscount
    } = useCart();
    
    const navigate = useNavigate();
    const [voucherCode, setVoucherCode] = useState('');
    
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(number));
    };

    const handleCheckout = () => {
        if (!localStorage.getItem('token')) {
            alert("Harap login atau daftar untuk melanjutkan pembayaran!");
            navigate('/login');
            return;
        }
        if (cart.length === 0) {
            alert("Keranjang masih kosong!");
            return;
        }
        setIsSidebarOpen(false);
        navigate('/checkout');
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#111] z-[100] shadow-2xl border-l border-white/10 flex flex-col"
        >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/10">
                <h2 className="text-xl font-bold flex items-center gap-3">
                    <ShoppingBag size={24} className="text-arjes-gold" /> Keranjang Belanja
                </h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* List Item */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                    <div className="text-center py-20 text-arjes-muted">
                        <Utensils size={40} className="mx-auto mb-3" />
                        <p>Keranjang kosong. Pilih menu dulu!</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-arjes-gold rounded-full flex items-center justify-center text-arjes-bg text-sm font-bold flex-shrink-0">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold">{item.name}</h4>
                                    <p className="text-xs text-arjes-muted">{formatRupiah(item.price)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="bg-black/30 p-1 rounded-full hover:bg-red-500 transition-colors">
                                    <Minus size={14} />
                                </button>
                                <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="bg-black/30 p-1 rounded-full hover:bg-green-500 transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer Total */}
            <div className="p-6 border-t border-white/10 bg-[#0D1812]">
                {/* Input Voucher */}
                <div className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        placeholder="Kode Voucher (Ex: UNSPROMO)"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 bg-black/30 p-3 rounded-lg border border-white/10 text-sm focus:border-arjes-gold outline-none"
                    />
                    <button 
                        onClick={() => applyVoucher(voucherCode)}
                        className="bg-arjes-gold text-arjes-bg px-4 rounded-lg text-sm font-bold"
                    >
                        Apply
                    </button>
                </div>
                {activeVoucher && (
                    <div className="flex justify-between text-xs text-green-400 mb-2 p-2 bg-green-900/30 rounded">
                        <span>Voucher Applied: {activeVoucher.name}</span>
                    </div>
                )}


                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-arjes-muted">
                        <span>Subtotal:</span>
                        <span>{formatRupiah(calculateSubtotal)}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                         <div className="flex justify-between text-sm text-red-400">
                            <span>Diskon:</span>
                            <span>- {formatRupiah(calculateDiscount())}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/20">
                        <span>TOTAL:</span>
                        <span className="text-arjes-gold">{formatRupiah(calculateTotal)}</span>
                    </div>
                </div>

                <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full mt-4 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    Checkout & Bayar <ArrowRight size={20} />
                </button>
            </div>
        </motion.div>
    );
};

export default Menu;