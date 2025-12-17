// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkVoucher } from '../api/orderApi'; // Import dari orderApi

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // --- STATE ---
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('arjes_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
      return [];
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState(() => {
    try {
      const savedVoucher = localStorage.getItem('arjes_voucher');
      return savedVoucher ? JSON.parse(savedVoucher) : null;
    } catch (e) {
      console.error('Error loading voucher from localStorage:', e);
      return null;
    }
  });

  // Simpan ke LocalStorage
  useEffect(() => {
    localStorage.setItem('arjes_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (activeVoucher) {
      localStorage.setItem('arjes_voucher', JSON.stringify(activeVoucher));
    } else {
      localStorage.removeItem('arjes_voucher');
    }
  }, [activeVoucher]);

  // --- ACTIONS ---
  const addToCart = (product) => {  
    // Pastikan product memiliki menu_id (sesuai backend)
    const productId = product.menu_id || product.id || `item-${Date.now()}`;
    const menuId = product.menu_id || product.id;
    
    setCartItems(prevCart => {
      // Cari item berdasarkan menu_id (untuk makanan) atau id (untuk booking)
      const existingItemIndex = prevCart.findIndex(item => 
        (item.menu_id && item.menu_id === menuId) || item.id === productId
      );
      
      if (existingItemIndex !== -1) {
        // Item sudah ada, update quantity
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        
        // Cek stok tersedia
        if (product.stok && existingItem.qty >= product.stok) {
          alert(`⚠️ Stok ${product.name} terbatas. Hanya tersisa ${product.stok}`);
          return prevCart;
        }
        
        updatedCart[existingItemIndex] = {
          ...existingItem,
          qty: existingItem.qty + 1,
          subtotal: (existingItem.price || 0) * (existingItem.qty + 1)
        };
        
        return updatedCart;
      } else {
        // Item baru, tambahkan ke cart
        const newItem = {
          ...product,
          id: productId,
          menu_id: menuId, // Pastikan ada menu_id untuk backend
          qty: 1,
          subtotal: product.price || 0
        };
        
        return [...prevCart, newItem];
      }
    });
  };

  const decreaseQty = (itemId) => {
    setCartItems((prev) => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.qty - 1;
          if (newQty <= 0) {
            return null; // Hapus item jika qty 0
          }
          return {
            ...item,
            qty: newQty,
            subtotal: (item.price || 0) * newQty
          };
        }
        return item;
      }).filter(item => item !== null);
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Fungsi untuk update quantity langsung
  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? {
              ...item,
              qty: newQty,
              subtotal: (item.price || 0) * newQty
            }
          : item
      )
    );
  };

  // Fungsi untuk mengosongkan cart
  const clearCart = () => {
    setCartItems([]);
    setActiveVoucher(null);
  };

  // --- CALCULATIONS ---
  const calculateSubtotal = cartItems.reduce((total, item) => 
    total + (parseFloat(item.price || 0) * (item.qty || 1)), 0);

  const calculateDiscount = () => {
    if (!activeVoucher) return 0;
    
    let discount = 0;
    
    if (activeVoucher.type === 'percentage') {
      // Untuk diskon persentase
      discount = calculateSubtotal * (parseFloat(activeVoucher.value) / 100);
      
      // Cek maksimum diskon jika ada
      if (activeVoucher.max_diskon && discount > parseFloat(activeVoucher.max_diskon)) {
        discount = parseFloat(activeVoucher.max_diskon);
      }
    } else if (activeVoucher.type === 'fixed') {
      // Untuk diskon nominal
      discount = parseFloat(activeVoucher.value);
      
      // Pastikan diskon tidak melebihi subtotal
      if (discount > calculateSubtotal) {
        discount = calculateSubtotal;
      }
    }
    
    return discount;
  };

  const discountAmount = calculateDiscount();
  const calculateTotal = calculateSubtotal - discountAmount;

  // Fungsi untuk mengaplikasikan voucher dari backend
  const applyVoucher = async (code) => {
    if (!code || code === "REMOVE") {
      setActiveVoucher(null);
      return;
    }

    const upperCode = code.toUpperCase();
    
    try {
      // Cek voucher melalui API
      const response = await checkVoucher(upperCode);
      
      if (response.data.valid) {
        const voucher = response.data.voucher;
        
        // Convert format dari backend ke frontend sesuai response yang diberikan
        const voucherData = {
          code: voucher.kode,
          name: voucher.nama || voucher.kode, // Jika nama null, gunakan kode
          type: voucher.tipe_diskon === 'persen' ? 'percentage' : 'fixed',
          value: voucher.tipe_diskon === 'persen' 
            ? parseFloat(voucher.diskon_persen) 
            : parseFloat(voucher.diskon_nominal),
          min_pembelian: parseFloat(voucher.minimum_order || 0),
          max_diskon: voucher.maksimum_diskon ? parseFloat(voucher.maksimum_diskon) : null,
          berlaku_hingga: voucher.expired_at, // Sesuai field dari response
          status: voucher.status,
          limit_penggunaan: voucher.limit_penggunaan,
          penggunaan_sekarang: voucher.penggunaan_sekarang || 0,
          tipe_diskon: voucher.tipe_diskon,
          diskon_persen: voucher.diskon_persen ? parseFloat(voucher.diskon_persen) : null,
          diskon_nominal: voucher.diskon_nominal ? parseFloat(voucher.diskon_nominal) : null
        };
        
        // Validasi minimal pembelian
        if (voucherData.min_pembelian > 0 && calculateSubtotal < voucherData.min_pembelian) {
          alert(`❌ Minimal pembelian Rp ${voucherData.min_pembelian.toLocaleString('id-ID')} untuk menggunakan voucher ini.`);
          return;
        }
        
        // Validasi tanggal berlaku
        if (voucherData.berlaku_hingga) {
          const expireDate = new Date(voucherData.berlaku_hingga);
          const today = new Date();
          if (expireDate < today) {
            alert('❌ Voucher sudah kadaluarsa!');
            return;
          }
        }
        
        // Validasi status
        if (voucherData.status !== 'aktif') {
          alert('❌ Voucher tidak aktif!');
          return;
        }
        
        // Validasi limit penggunaan
        if (voucherData.limit_penggunaan > 0 && 
            voucherData.penggunaan_sekarang >= voucherData.limit_penggunaan) {
          alert('❌ Voucher sudah habis digunakan!');
          return;
        }
        
        setActiveVoucher(voucherData);
        alert(`✅ Voucher "${voucherData.name}" berhasil diaplikasikan!`);
      } else {
        alert(`❌ ${response.data.message || 'Kode voucher tidak valid'}`);
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      if (error.response?.status === 404) {
        alert('❌ Voucher tidak ditemukan!');
      } else if (error.response?.status === 400) {
        alert(`❌ ${error.response.data.message || 'Voucher tidak valid!'}`);
      } else {
        alert('❌ Gagal memeriksa voucher. Coba lagi nanti.');
      }
    }
  };

  // Fungsi untuk menghapus voucher
  const removeVoucher = () => {
    setActiveVoucher(null);
  };

  // Hitung total item di cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.qty || 1), 0);
  };

  // Fungsi untuk menambahkan booking ke cart
  const addBookingToCart = (bookingData) => {
    const bookingItem = {
      id: `booking-${bookingData.id || Date.now()}`,
      menu_id: bookingData.id, // Pastikan ada menu_id
      name: bookingData.meja?.nama || 'Booking Meja',
      price: parseFloat(bookingData.meja?.harga_per_jam || 0),
      category: 'booking',
      qty: 1,
      subtotal: parseFloat(bookingData.meja?.harga_per_jam || 0),
      details: {
        meja: bookingData.meja?.nama,
        tanggal: bookingData.tanggal,
        waktu: `${new Date(bookingData.tanggal).toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} - ${new Date(bookingData.waktu_selesai).toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`,
        jumlah_orang: bookingData.jumlah_orang,
        catatan: bookingData.catatan,
        booking_id: bookingData.id
      }
    };

    addToCart(bookingItem);
  };

  // Fungsi untuk mendapatkan cart items dalam format yang sesuai dengan backend
  const getCartItemsForBackend = () => {
    return cartItems
      .filter(item => item.category !== 'booking') // Hanya item makanan/minuman
      .map(item => ({
        menu_id: item.menu_id || item.id,
        qty: item.qty || 1
      }));
  };

  // Fungsi untuk mendapatkan booking_id jika ada
  const getBookingId = () => {
    const bookingItem = cartItems.find(item => item.category === 'booking');
    return bookingItem?.details?.booking_id || null;
  };

  return (
    <CartContext.Provider value={{
      // State
      cart: cartItems,
      cartItems,
      isSidebarOpen,
      setIsSidebarOpen,
      activeVoucher,
      setActiveVoucher,
      
      // Actions
      addToCart,
      decreaseQty,
      removeFromCart,
      clearCart,
      updateQuantity,
      addBookingToCart,
      applyVoucher,
      removeVoucher,
      
      // Calculations
      subtotal: calculateSubtotal,
      discount: discountAmount,
      total: calculateTotal,
      getTotalItems,
      
      // Helper functions for backend
      getCartItemsForBackend,
      getBookingId
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};