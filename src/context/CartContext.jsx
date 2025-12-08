// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // --- STATE ---
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('arjes_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return []; // Jaga-jaga jika data corrupt, kembalikan array kosong biar gak blank
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState(null);

  // Simpan ke LocalStorage
  useEffect(() => {
    localStorage.setItem('arjes_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- ACTIONS ---
  const addToCart = (product) => {
    const price = Number(product.price);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, price: price, qty: 1 }];
    });
    alert("Berhasil masuk keranjang! 🛒");
  };

  const decreaseQty = (itemId) => {
    setCartItems((prev) => {
      return prev.map(item => {
        if (item.id === itemId) return { ...item, qty: item.qty - 1 };
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // FUNGSI PENTING: CLEAR CART (Dipanggil saat Logout)
  const clearCart = () => {
    setCartItems([]);
    setActiveVoucher(null);
    localStorage.removeItem('arjes_cart');
  };

  // --- CALCULATIONS ---
  const calculateSubtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);

  const calculateDiscount = () => {
    if (!activeVoucher) return 0;
    if (activeVoucher.type === 'percentage') return calculateSubtotal * activeVoucher.value;
    if (activeVoucher.type === 'fixed') return activeVoucher.value;
    return 0;
  };

  const discountAmount = calculateDiscount();
  const calculateTotal = calculateSubtotal - discountAmount;

  const applyVoucher = (code) => {
    const upperCode = code.toUpperCase();
    if (upperCode === "ARJES20") {
      setActiveVoucher({ code: "ARJES20", type: 'percentage', value: 0.20, name: "Diskon Opening 20%" });
      alert("Voucher ARJES20 berhasil dipakai!");
    } else if (upperCode === "PICKUPHEMAT") {
      setActiveVoucher({ code: "PICKUPHEMAT", type: 'fixed', value: 15000, name: "Potongan Rp 15.000" });
      alert("Voucher PICKUPHEMAT berhasil dipakai!");
    } else {
      setActiveVoucher(null);
      alert("Kode voucher tidak valid.");
    }
  };

  return (
    <CartContext.Provider value={{
      // --- PENYELAMAT BIAR GAK BLANK ---
      cart: cartItems,       // UNTUK KODE LAMA (Navbar, Checkout)
      cartItems: cartItems,  // UNTUK KODE BARU (UserDashboard)
      
      isSidebarOpen, setIsSidebarOpen, activeVoucher,
      addToCart, decreaseQty, removeFromCart, 
      clearCart, // <--- Sudah ada
      
      subtotal: calculateSubtotal,
      discount: discountAmount,
      total: calculateTotal,
      applyVoucher
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);