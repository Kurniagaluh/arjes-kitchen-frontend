// src/context/CartContext.jsx - PERBAIKAN UNTUK INKONSISTENSI DATA
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // --- STATE ---
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('arjes_cart') || '[]');
    } catch (e) {
      console.error('Gagal load cart:', e);
      return [];
    }
  });

  const [activeVoucher, setActiveVoucher] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('arjes_voucher') || 'null');
    } catch (e) {
      console.error('Gagal load voucher:', e);
      return null;
    }
  });

  // Sync ke localStorage
  useEffect(() => {
    localStorage.setItem('arjes_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('arjes_voucher', JSON.stringify(activeVoucher));
  }, [activeVoucher]);

  // --- ACTIONS ---
  const addToCart = useCallback((product) => {
    const id = product.menu_id || product.id || `temp-${Date.now()}`;
    setCartItems(prev => {
      const existing = prev.find(item => item.menu_id === product.menu_id);
      if (existing) {
        return prev.map(item =>
          item.menu_id === product.menu_id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { ...product, id, qty: 1 }];
    });
  }, []);

  const decreaseQty = useCallback((id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      ).filter(item => item.id !== id || item.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setActiveVoucher(null);
  }, []);

  // ✅ PERBAIKAN BESAR: Handle inkonsistensi tipe voucher
  const applyVoucher = useCallback((voucherData) => {
    if (!voucherData || voucherData.code === 'REMOVE') {
      setActiveVoucher(null);
      return { success: false, message: 'Voucher dihapus' };
    }

    console.log('🔄 APPLY VOUCHER RAW DATA:', voucherData);
    
    // ✅ FIX: Deteksi tipe voucher secara otomatis berdasarkan data yang ada
    let type = 'fixed'; // default
    let value = 0;
    
    // ✅ LOGIC: Jika ada diskon_nominal, itu voucher nominal (fixed)
    // Jika ada diskon_persen, itu voucher persen (percentage)
    if (voucherData.diskon_nominal !== null && voucherData.diskon_nominal !== undefined) {
      type = 'fixed';
      value = Number(voucherData.diskon_nominal) || 0;
      console.log('💰 Voucher NOMINAL detected:', value);
    } 
    else if (voucherData.diskon_persen !== null && voucherData.diskon_persen !== undefined) {
      type = 'percentage';
      value = Number(voucherData.diskon_persen) || 0;
      console.log('📊 Voucher PERSEN detected:', value + '%');
    }
    // Fallback ke tipe_diskon jika tidak ada data nominal/persen
    else if (voucherData.tipe_diskon) {
      const tipe = voucherData.tipe_diskon.trim().toLowerCase();
      if (tipe === 'persen' || tipe === 'percentage') {
        type = 'percentage';
        value = Number(voucherData.value) || 0;
      } else if (tipe === 'nominal' || tipe === 'fixed') {
        type = 'fixed';
        value = Number(voucherData.value) || 0;
      }
    }
    
    // Konversi tipe data
    const v = {
      id: voucherData.id,
      code: voucherData.kode || voucherData.code,
      name: voucherData.nama || voucherData.name || voucherData.kode || voucherData.code,
      description: voucherData.deskripsi || '',
      
      // ✅ FIX: Gunakan tipe yang sudah dideteksi
      type: type,
      value: value,
      
      min_pembelian: Number(voucherData.minimum_order) || 0,
      max_diskon: voucherData.maksimum_diskon ? Number(voucherData.maksimum_diskon) : null,
      limit_penggunaan: Number(voucherData.limit_penggunaan) || 0,
      penggunaan_sekarang: Number(voucherData.penggunaan_sekarang) || 0,
      status: voucherData.status,
      tanggal_mulai: voucherData.tanggal_mulai,
      berlaku_hingga: voucherData.expired_at,
      hanya_untuk_user_tertentu: voucherData.hanya_untuk_user_tertentu || false,
      user_ids: voucherData.user_ids,
      
      // Simpan data original untuk debugging
      _raw: voucherData
    };

    console.log('✅ VOUCHER PROCESSED FINAL:', {
      code: v.code,
      type: v.type,
      value: v.value,
      min_pembelian: v.min_pembelian,
      max_diskon: v.max_diskon,
      status: v.status,
      expired: v.berlaku_hingga
    });

    // Simpan voucher data ke state
    setActiveVoucher(v);
    return { success: true, voucher: v };
  }, []);

  const removeVoucher = useCallback(() => {
    console.log('🗑️ Removing voucher');
    setActiveVoucher(null);
  }, []);

  // --- CALCULATIONS dengan useMemo ---
  const calculations = useMemo(() => {
    console.log('🧮 RECALCULATING CART...');
    
    // Pisahkan food items dan booking item
    const foodItems = cartItems.filter(item => item.category !== 'booking');
    const bookingItem = cartItems.find(item => item.category === 'booking');
    
    // Hitung subtotal
    const subtotal = foodItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      return sum + (price * qty);
    }, 0);
    
    console.log('📦 Food items:', foodItems.length);
    console.log('💰 Subtotal:', subtotal);
    
    // ✅ PERHITUNGAN DISKON REAL-TIME
    let discount = 0;
    let voucherValid = true;
    let validationMessage = '';
    
    if (activeVoucher) {
      console.log('🎫 ACTIVE VOUCHER DETAILS:', activeVoucher);
      console.log('📊 Voucher code:', activeVoucher.code);
      console.log('📊 Voucher type:', activeVoucher.type);
      console.log('📊 Voucher value:', activeVoucher.value);
      console.log('📊 Min pembelian:', activeVoucher.min_pembelian);
      console.log('📊 Status:', activeVoucher.status);
      console.log('📊 Expired at:', activeVoucher.berlaku_hingga);
      
      // ✅ FIX: Validasi status (case insensitive)
      const status = activeVoucher.status ? activeVoucher.status.trim().toLowerCase() : '';
      if (status !== 'aktif') {
        voucherValid = false;
        validationMessage = 'Voucher tidak aktif';
        console.log('❌ Voucher status invalid:', status);
      }
      
      // Validasi minimal pembelian
      if (activeVoucher.min_pembelian > 0 && subtotal < activeVoucher.min_pembelian) {
        voucherValid = false;
        validationMessage = `Minimal pembelian Rp${activeVoucher.min_pembelian.toLocaleString('id-ID')}`;
        console.log('❌ Min pembelian not met:', subtotal, '<', activeVoucher.min_pembelian);
      }
      
      // Validasi tanggal berlaku
      if (activeVoucher.berlaku_hingga) {
        const expireDate = new Date(activeVoucher.berlaku_hingga);
        const today = new Date();
        
        console.log('📅 Date check:', {
          expireDate: expireDate.toISOString(),
          today: today.toISOString(),
          expired: expireDate < today
        });
        
        if (expireDate < today) {
          voucherValid = false;
          validationMessage = 'Voucher sudah kadaluarsa';
          console.log('❌ Voucher expired');
        }
      }
      
      // Validasi limit penggunaan
      if (activeVoucher.limit_penggunaan > 0 && 
          activeVoucher.penggunaan_sekarang >= activeVoucher.limit_penggunaan) {
        voucherValid = false;
        validationMessage = 'Voucher sudah habis digunakan';
        console.log('❌ Voucher limit reached:', 
          activeVoucher.penggunaan_sekarang, '/', activeVoucher.limit_penggunaan);
      }
      
      // ✅ FIX: Hitung diskon berdasarkan tipe
      if (voucherValid) {
        if (activeVoucher.type === 'percentage') {
          discount = subtotal * (activeVoucher.value / 100);
          console.log(`📈 Percentage discount: ${activeVoucher.value}% of ${subtotal} = ${discount}`);
        } else if (activeVoucher.type === 'fixed') {
          discount = Math.min(activeVoucher.value, subtotal);
          console.log(`📈 Fixed discount: min(${activeVoucher.value}, ${subtotal}) = ${discount}`);
        } else {
          console.warn('⚠️ Unknown voucher type:', activeVoucher.type);
          voucherValid = false;
          validationMessage = 'Tipe voucher tidak valid';
        }
        
        // Batasi dengan max_diskon jika ada
        if (activeVoucher.max_diskon && discount > activeVoucher.max_diskon) {
          console.log(`📉 Capping discount from ${discount} to max ${activeVoucher.max_diskon}`);
          discount = activeVoucher.max_diskon;
        }
        
        // Pastikan tidak negatif
        discount = Math.max(0, discount);
        console.log('✅ Final discount:', discount);
        
        // Jika diskon 0 tapi voucher valid, mungkin ada issue
        if (discount === 0 && voucherValid) {
          console.warn('⚠️ Valid voucher but discount is 0. Check voucher value.');
        }
      } else {
        // Auto-remove voucher jika tidak valid
        console.log('⚠️ Auto-removing invalid voucher:', validationMessage);
        setTimeout(() => setActiveVoucher(null), 100);
      }
    } else {
      console.log('ℹ️ No active voucher');
    }
    
    const total = Math.max(0, subtotal - discount);
    
    // Hitung booking
    const tablePrice = bookingItem ? Number(bookingItem.price) || 0 : 0;
    const isBookingFree = bookingItem && subtotal >= 25000;
    const tablePriceFinal = isBookingFree ? 0 : tablePrice;
    const totalBayar = total + tablePriceFinal;
    
    // Get total items
    const getTotalItems = () => cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
    
    return {
      foodItems,
      bookingItem,
      subtotal,
      discount,
      total,
      tablePriceFinal,
      isBookingFree,
      totalBayar,
      getTotalItems,
      voucherValid,
      validationMessage
    };
  }, [cartItems, activeVoucher]);

  // ✅ Debug log untuk memantau perubahan
  useEffect(() => {
    console.log('===================================');
    console.log('🛒 CART CONTEXT STATE UPDATE');
    console.log('===================================');
    console.log('Cart items:', cartItems.length);
    console.log('Active voucher code:', activeVoucher?.code || 'None');
    if (activeVoucher) {
      console.log('Voucher details:', {
        type: activeVoucher.type,
        value: activeVoucher.value,
        min: activeVoucher.min_pembelian,
        max: activeVoucher.max_diskon,
        status: activeVoucher.status,
        expired: activeVoucher.berlaku_hingga,
        valid: calculations.voucherValid
      });
    }
    console.log('Subtotal:', calculations.subtotal);
    console.log('Discount:', calculations.discount);
    console.log('Total:', calculations.total);
    console.log('Total bayar:', calculations.totalBayar);
    console.log('Voucher valid:', calculations.voucherValid);
    if (!calculations.voucherValid && calculations.validationMessage) {
      console.log('Validation message:', calculations.validationMessage);
    }
    console.log('===================================');
  }, [cartItems, activeVoucher, calculations]);

  return (
    <CartContext.Provider value={{
      cart: cartItems,
      activeVoucher,
      subtotal: calculations.subtotal,
      discount: calculations.discount,
      total: calculations.total,
      totalBayar: calculations.totalBayar,
      tablePriceFinal: calculations.tablePriceFinal,
      isBookingFree: calculations.isBookingFree,
      voucherValid: calculations.voucherValid,
      validationMessage: calculations.validationMessage,
      addToCart,
      decreaseQty,
      removeFromCart,
      clearCart,
      applyVoucher,
      removeVoucher,
      getTotalItems: calculations.getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be inside CartProvider');
  return context;
};