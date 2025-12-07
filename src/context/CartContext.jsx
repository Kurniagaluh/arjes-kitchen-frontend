import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Buat Context
const CartContext = createContext();

// 2. Buat Provider
export const CartProvider = ({ children }) => {
  // --- STATE ---
  // Ambil data dari LocalStorage saat awal load (biar tidak hilang pas refresh)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('arjes_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Untuk sidebar keranjang
  const [activeVoucher, setActiveVoucher] = useState(null);  // Untuk simpan voucher yg dipakai

  // Simpan ke LocalStorage setiap kali cart berubah
  useEffect(() => {
    localStorage.setItem('arjes_cart', JSON.stringify(cart));
  }, [cart]);


  // --- FUNGSI AKSI (ACTIONS) ---

  // A. Tambah Item (Add to Cart)
  const addToCart = (product) => {
    const price = Number(product.price); // Wajib dikonversi ke Angka biar aman

    setCart((prevCart) => {
      // Cek apakah item sudah ada?
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Kalau sudah ada, tambah jumlahnya (qty + 1)
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        // Kalau belum ada, masukkan item baru dengan qty 1
        return [...prevCart, { ...product, price: price, qty: 1 }];
      }
    });

    // Buka sidebar/notifikasi otomatis (opsional)
    // setIsSidebarOpen(true); 
    // alert(`${product.name} berhasil masuk keranjang!`);
  };

  // B. Kurangi Item (Tombol Minus)
  const decreaseQty = (itemId) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      }).filter(item => item.qty > 0); // Jika 0, otomatis dihapus
    });
  };

  // C. Hapus Item (Tombol Sampah)
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // D. Kosongkan Keranjang (Reset)
  const clearCart = () => {
    setCart([]);
    setActiveVoucher(null); // Reset voucher juga
    localStorage.removeItem('arjes_cart');
  };


  // --- FUNGSI PERHITUNGAN (CALCULATIONS) ---
  // Ini dihitung otomatis setiap ada perubahan state, jadi tidak perlu useEffect manual.

  // 1. Hitung Subtotal (Harga Asli Barang)
  const calculateSubtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);

  // 2. Hitung Nilai Diskon
  const calculateDiscount = () => {
    if (!activeVoucher) return 0;
    
    // Jika tipe persen (contoh 0.10 untuk 10%)
    if (activeVoucher.type === 'percentage') {
        return calculateSubtotal * activeVoucher.value; 
    }
    // Jika tipe potongan tetap (contoh Rp 15.000)
    if (activeVoucher.type === 'fixed') {
        return activeVoucher.value;
    }
    return 0;
  };

  const discountAmount = calculateDiscount();

  // 3. Hitung Total Akhir (Bayar)
  const calculateTotal = calculateSubtotal - discountAmount;


  // --- VOUCHER LOGIC ---
  const applyVoucher = (code) => {
    // Simulasi Logic Voucher (Nanti diganti API ke Backend)
    const upperCode = code.toUpperCase();

    if (upperCode === "ARJES20") {
      setActiveVoucher({ code: "ARJES20", type: 'percentage', value: 0.20, name: "Diskon Opening 20%" });
      alert("Voucher ARJES20 berhasil dipakai!");
    } 
    else if (upperCode === "PICKUPHEMAT") {
      setActiveVoucher({ code: "PICKUPHEMAT", type: 'fixed', value: 15000, name: "Potongan Rp 15.000" });
      alert("Voucher PICKUPHEMAT berhasil dipakai!");
    } 
    else {
      setActiveVoucher(null);
      alert("Kode voucher tidak valid.");
    }
  };


  // --- RETURN PROVIDER ---
  return (
    <CartContext.Provider value={{
      // Data State
      cart,
      isSidebarOpen,
      setIsSidebarOpen,
      activeVoucher,

      // Aksi Cart
      addToCart,
      decreaseQty,     // Gunakan ini untuk tombol (-)
      removeFromCart,  // Gunakan ini untuk tombol Hapus/Sampah
      clearCart,
      
      // Data Angka (Hasil Perhitungan)
      subtotal: calculateSubtotal, // Mengirim NILAI (Angka), bukan fungsi
      discount: discountAmount,    // Mengirim NILAI (Angka)
      total: calculateTotal,       // Mengirim NILAI (Angka)

      // Voucher
      applyVoucher
    }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Custom Hook biar gampang dipanggil
export const useCart = () => useContext(CartContext);