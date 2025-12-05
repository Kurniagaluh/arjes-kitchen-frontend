import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // [ {id, name, price, qty} ]
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]); 
  const [activeVoucher, setActiveVoucher] = useState(null); 

  useEffect(() => {
    const savedCart = localStorage.getItem('arjes_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('arjes_cart', JSON.stringify(cart));
  }, [cart]);


  // --- Fungsi Utama Cart ---
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    const price = Number(item.price);
    if (isNaN(price)) {
        console.error("Harga item tidak valid:", item.price);
        alert("Harga item tidak valid!");
        return;
    }

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, price: price, qty: 1 }]);
    }
    setIsSidebarOpen(true); 
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(cart.map(cartItem =>
      cartItem.id === itemId ? { ...cartItem, qty: newQuantity } : cartItem
    ));
  };
  
  const clearCart = () => {
    setCart([]);
    setActiveVoucher(null);
  };

  // --- Fungsi Perhitungan ---
  const calculateSubtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  
  const calculateDiscount = () => {
    if (!activeVoucher) return 0;
    if (activeVoucher.type === 'percentage') {
        return calculateSubtotal * activeVoucher.value; 
    }
    if (activeVoucher.type === 'fixed') {
        return activeVoucher.value;
    }
    return 0;
  };

  const calculateTotal = calculateSubtotal - calculateDiscount();


  // --- Fungsi Voucher (Integrasi ke Backend di tahap berikutnya) ---
  const applyVoucher = (voucherCode) => {
    // Simulasi Cek Voucher (Nanti ganti API POST /api/voucher/check)
    if (voucherCode === "UNSPROMO") {
      setActiveVoucher({ code: voucherCode, type: 'percentage', value: 0.10, name: "Diskon 10% Mahasiswa" });
      alert("Voucher berhasil diterapkan! (Contoh)");
    } else {
      setActiveVoucher(null);
      alert("Voucher tidak valid! (Coba UNSPROMO)");
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      calculateSubtotal,
      calculateTotal,
      isSidebarOpen,
      setIsSidebarOpen,
      vouchers,
      activeVoucher,
      calculateDiscount,
      applyVoucher
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);