// src/pages/user/Checkout.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext'; 
import { 
  Trash2, CreditCard, Upload, ArrowLeft, Ticket, CheckCircle, 
  Store, Banknote, Utensils, ShoppingBag, AlertTriangle, Lock, 
  PartyPopper, Plus, Minus, Calendar, Clock, Users, Home, 
  Loader2, AlertCircle, ShoppingCart, Info, Shield, Check, 
  ChevronDown, ChevronUp, QrCode, Eye, EyeOff, Copy, XCircle,
  Percent, DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  createOrder, 
  createPickupOrder, 
  uploadPaymentProof, 
  checkVoucher 
} from '../../api/orderApi';

// QR Generator client-side (tanpa dependency)
const QRCode = ({ value, size = 200 }) => {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  return <img src={url} alt="QRIS" className="w-full h-full object-contain" />;
};

// Generate QRIS content (EMVCo static — ganti MID sesuai merchant Anda)
const generateQRIS = (amount) => {
  const mid = "0012345678901234"; // 🔑 GANTI DENGAN MID ANDA
  const amountStr = Math.round(amount).toString();
  return `00020101021129370016ID.CO.QRIS.WWW0115${mid}5204531153033605802ID5914ARJES CAFE6013JAKARTA62430325ARJES${Date.now().toString().slice(-6)}540${amountStr.length}${amountStr}6304`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    addToCart,      
    decreaseQty,    
    removeFromCart, 
    clearCart, 
    activeVoucher, 
    applyVoucher,
    removeVoucher,
    getTotalItems,
    subtotal,
    discount,
    total,
    totalBayar,
    tablePriceFinal,
    isBookingFree,
    voucherValid,
    validationMessage
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('qris'); 
  const [diningOption, setDiningOption] = useState('dine_in'); 
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [inputVoucher, setInputVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [pickupData, setPickupData] = useState({
    nama_penerima: '',
    catatan: ''
  });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cek apakah ada booking di cart
  const bookingItem = cart.find(item => item.category === 'booking');
  const foodItems = cart.filter(item => item.category !== 'booking');
  const hasBooking = !!bookingItem;

  // Hitung statistik
  const totalItems = getTotalItems();
  const totalFoodItems = foodItems.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Aturan untuk booking gratis
  const minOrderThreshold = 25000;
  const isBookingFreeActual = hasBooking && subtotal >= minOrderThreshold;
  const kurangJajan = minOrderThreshold - subtotal;

  // Hitung biaya meja final
  const tablePriceOriginal = bookingItem ? bookingItem.price : 0;
  const tablePriceFinalActual = isBookingFreeActual ? 0 : tablePriceOriginal;

  // ✅ QRIS content — update real-time
  const qrContent = useMemo(() => 
    totalBayar > 0 ? generateQRIS(totalBayar) : '',
    [totalBayar]
  );

  // === API FUNCTIONS ===
// Di Checkout.jsx - Perbaiki handleCheckVoucher
const handleCheckVoucher = async (code) => {
  if (!code.trim()) {
    setVoucherError('Masukkan kode voucher');
    return;
  }
  
  setCheckingVoucher(true);
  setVoucherError('');
  
  console.log('🔍 Checking voucher:', code);
  
  try {
    const response = await checkVoucher(code);
    console.log('✅ Voucher API response:', response.data);
    
    if (response.data.valid) {
      const voucher = response.data.voucher;
      
      // ✅ FIX: Debug raw voucher data dari backend
      console.log('📦 RAW VOUCHER FROM BACKEND:', {
        id: voucher.id,
        kode: voucher.kode,
        nama: voucher.nama,
        tipe_diskon: voucher.tipe_diskon,
        diskon_persen: voucher.diskon_persen,
        diskon_nominal: voucher.diskon_nominal,
        minimum_order: voucher.minimum_order,
        maksimum_diskon: voucher.maksimum_diskon,
        status: voucher.status,
        expired_at: voucher.expired_at
      });
      
      // ✅ FIX: Kirim data voucher MENTAH ke applyVoucher
      // Biarkan applyVoucher yang melakukan normalisasi
      const result = applyVoucher(voucher);
      
      if (result.success) {
        console.log('🎉 Voucher applied successfully:', result.voucher);
        setInputVoucher('');
        setVoucherError('');
        
        // Tampilkan notifikasi sukses
        setTimeout(() => {
          if (result.voucher.type === 'percentage') {
            alert(`✅ Voucher "${result.voucher.code}" berhasil diterapkan!\nDiskon: ${result.voucher.value}%`);
          } else {
            alert(`✅ Voucher "${result.voucher.code}" berhasil diterapkan!\nDiskon: Rp${result.voucher.value.toLocaleString('id-ID')}`);
          }
        }, 100);
      } else {
        setVoucherError(result.message || 'Gagal menerapkan voucher');
      }
      
    } else {
      const errorMsg = response.data.message || 'Voucher tidak valid';
      setVoucherError(errorMsg);
      console.log('❌ Voucher invalid:', errorMsg);
    }
  } catch (error) {
    console.error('❌ Error checking voucher:', error);
    console.error('Error details:', {
      response: error.response?.data,
      status: error.response?.status,
      message: error.message
    });
    
    let errorMsg = 'Gagal memeriksa voucher';
    if (error.response) {
      if (error.response.status === 404) {
        errorMsg = 'Voucher tidak ditemukan';
      } else if (error.response.status === 400) {
        errorMsg = error.response.data.message || 'Voucher tidak valid';
      } else if (error.response.status === 422) {
        const errors = error.response.data.errors;
        if (errors && errors.kode) {
          errorMsg = errors.kode[0];
        } else {
          errorMsg = 'Format voucher tidak valid';
        }
      }
    }
    
    setVoucherError(errorMsg);
    removeVoucher(); // Pastikan voucher dihapus jika error
  } finally {
    setCheckingVoucher(false);
  }
};

  // --- ATURAN PEMBAYARAN ---
  useEffect(() => {
    if (hasBooking) {
      setPaymentMethod('qris');
      setDiningOption('dine_in'); 
    }
  }, [hasBooking]);

  // ✅ Validasi voucher real-time
  useEffect(() => {
    if (activeVoucher && !voucherValid && validationMessage) {
      console.log('⚠️ Voucher validation issue:', validationMessage);
      setVoucherError(validationMessage);
      
      // Auto-remove voucher setelah beberapa detik
      const timer = setTimeout(() => {
        removeVoucher();
        setVoucherError('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [activeVoucher, voucherValid, validationMessage, removeVoucher]);

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseFloat(price || 0));
  };

  // Handle input change for pickup data
  const handlePickupDataChange = (e) => {
    const { name, value } = e.target;
    setPickupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- HANDLE BAYAR ---
  const handlePayment = async () => {
    // Validasi login
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      alert("❌ Silakan login terlebih dahulu!");
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    // Validasi untuk pickup
    if (diningOption === 'pickup' && !pickupData.nama_penerima.trim()) {
      alert("Mohon isi nama penerima untuk pickup!");
      return;
    }
    // Validasi bukti transfer untuk QRIS
    if (paymentMethod === 'qris' && totalBayar > 0 && !buktiTransfer) {
      alert("⚠️ Mohon upload bukti pembayaran terlebih dahulu!");
      return;
    }
    // Validasi item harus memiliki menu_id
    const invalidItems = foodItems.filter(item => !item.menu_id && !item.id);
    if (invalidItems.length > 0) {
      alert(`❌ Beberapa item tidak memiliki ID menu yang valid: ${invalidItems.map(i => i.name).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Debug: log data yang akan dikirim
      console.log("=== DEBUG ORDER DATA ===");
      console.log("Active voucher:", activeVoucher);
      console.log("Voucher code:", activeVoucher?.code);
      console.log("Subtotal:", subtotal);
      console.log("Discount:", discount);
      console.log("Total:", total);
      console.log("Total bayar:", totalBayar);

      // Siapkan data order sesuai dengan format backend
      const orderData = {
        jenis_order: diningOption === 'pickup' ? 'pickup' : 'dine_in',
        items: foodItems.map(item => ({
          menu_id: item.menu_id || item.id,
          qty: item.qty || 1
        }))
      };

      // Hanya tambahkan voucher_code jika ada dan berupa string
      if (activeVoucher?.code && typeof activeVoucher.code === 'string') {
        orderData.voucher_code = activeVoucher.code;
        console.log("✅ Adding voucher code to order:", activeVoucher.code);
      }

      // Hanya tambahkan booking_id jika ada
      if (bookingItem?.details?.booking_id) {
        orderData.booking_id = bookingItem.details.booking_id;
      }

      console.log("Full order data to send:", orderData);

      let response;
      if (diningOption === 'pickup') {
        // Order pickup dengan format yang sesuai controller
        const pickupOrderData = {
          ...orderData,
          nama_penerima: pickupData.nama_penerima.trim(),
          catatan: pickupData.catatan?.trim() || ''
        };
        console.log("Pickup order data:", pickupOrderData);
        response = await createPickupOrder(pickupOrderData);
      } else {
        // Order dine-in
        console.log("Dine-in order data:", orderData);
        response = await createOrder(orderData);
      }

      // Cek response berdasarkan controller
      const orderResponse = response.data.order || response.data;
      const orderId = orderResponse.id;

      // Upload bukti pembayaran jika menggunakan QRIS
      if (paymentMethod === 'qris' && buktiTransfer && orderId) {
        try {
          await uploadPaymentProof(orderId, buktiTransfer);
        } catch (uploadError) {
          console.error("Error uploading payment proof:", uploadError);
          // Tetap lanjutkan karena order sudah dibuat
          alert("✅ Pesanan berhasil dibuat, namun upload bukti bayar gagal. Silakan upload manual di halaman order.");
        }
      }

      // Tampilkan notifikasi sukses berdasarkan response
      const totalAmount = orderResponse.total || totalBayar;
      const discountAmount = orderResponse.discount_amount || discount || 0;
      const voucherUsed = orderResponse.voucher_id ? true : false;

      let successMessage = `🎉 Pesanan Berhasil!`;
      successMessage += `\nID Order: ${orderId}`;
      successMessage += `\nTotal: ${formatPrice(totalAmount)}`;
      if (voucherUsed || discount > 0) {
        successMessage += `\nDiskon: -${formatPrice(discountAmount)}`;
      }
      if (diningOption === 'pickup') {
        successMessage += `\nNama Penerima: ${pickupData.nama_penerima}`;
        if (pickupData.catatan) {
          successMessage += `\nCatatan: ${pickupData.catatan}`;
        }
        successMessage += `\nSilakan tunggu notifikasi ketika pesanan siap diambil.`;
      } else {
        successMessage += `\nSilakan tunjukkan ID order ke kasir.`;
      }

      alert(successMessage);

      // Clear cart dan redirect
      clearCart();
      navigate('/user/orders');
    } catch (error) {
      console.error("Gagal membuat order:", error);
      let errorMessage = "❌ Gagal membuat pesanan.";
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        if (error.response.status === 422) {
          const errorData = error.response.data;
          console.error("Validation errors:", errorData);
          errorMessage = "❌ Validasi gagal:\n";
          if (errorData.errors) {
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              errorMessage += `- ${field}: ${messages.join(', ')}\n`;
            });
          } else if (errorData.message) {
            errorMessage += errorData.message;
          }
        } else if (error.response.status === 400) {
          errorMessage += "\n" + (error.response.data.message || "Data tidak valid");
        } else if (error.response.status === 401) {
          errorMessage = "❌ Silakan login terlebih dahulu!";
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        } else if (error.response.status === 404) {
          errorMessage = "❌ Menu tidak ditemukan!";
        } else if (error.response.status === 500) {
          errorMessage = "❌ Server error. Silakan coba lagi nanti.";
        } else {
          errorMessage += "\n" + (error.response.data?.message || "Terjadi kesalahan");
        }
      } else if (error.message.includes('Network')) {
        errorMessage = "❌ Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message) {
        errorMessage += "\n" + error.message;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debug component untuk testing
  const DebugPanel = () => (
    <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
      <p className="text-sm font-bold text-yellow-400 mb-2">🔧 DEBUG PANEL</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Subtotal:</span>
          <span className="ml-2 font-bold">Rp{subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-gray-400">Discount:</span>
          <span className="ml-2 font-bold text-green-400">Rp{discount.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-gray-400">Total:</span>
          <span className="ml-2 font-bold">Rp{total.toLocaleString('id-ID')}</span>
        </div>
        <div>
          <span className="text-gray-400">Voucher:</span>
          <span className="ml-2 font-bold">{activeVoucher?.code || 'None'}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400">Voucher Type:</span>
          <span className="ml-2 font-bold">{activeVoucher?.type || '-'}</span>
          {activeVoucher && (
            <>
              <span className="ml-4 text-gray-400">Value:</span>
              <span className="ml-2 font-bold">
                {activeVoucher.type === 'percentage' ? `${activeVoucher.value}%` : `Rp${activeVoucher.value.toLocaleString('id-ID')}`}
              </span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => {
          console.log('=== MANUAL DEBUG ===');
          console.log('Cart:', cart);
          console.log('Active Voucher:', activeVoucher);
          console.log('Calculations:', { subtotal, discount, total, totalBayar });
        }}
        className="mt-2 text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
      >
        Log to Console
      </button>
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] flex flex-col items-center justify-center text-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Keranjangmu Kosong</h2>
          <p className="text-gray-400 mb-6">Tambahkan menu untuk memulai pesanan</p>
          <div className="flex gap-4 justify-center">
            <Link to="/menu" className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] px-6 py-3 rounded-xl font-bold hover:from-white hover:to-gray-200 transition-all">
              <Utensils className="inline mr-2" size={18} />
              Lihat Menu
            </Link>
            <Link to="/" className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">
              <Home className="inline mr-2" size={18} />
              Ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* === KOLOM KIRI: DAFTAR ITEM === */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-white/5 rounded-full hover:bg-white/20 text-white transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-3xl font-serif font-bold text-white">Checkout</h1>
            <span className="bg-gradient-to-r from-[#D4AF37]/20 to-[#F4D03F]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm font-bold">
              {totalItems} item
            </span>
          </div>

          {/* ALERT PROMO */}
          {hasBooking && !isBookingFree && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 p-4 rounded-2xl flex gap-3 text-yellow-200"
            >
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-bold text-yellow-100 mb-1">
                  Promo Booking
                </p>
                <p className="text-sm">
                  Jajan <span className="font-bold">{formatPrice(kurangJajan)}</span> lagi untuk mendapatkan meja gratis!
                </p>
                <Link 
                  to="/menu" 
                  className="text-[#D4AF37] hover:text-white font-medium mt-2 inline-flex items-center gap-1 transition-colors text-sm"
                >
                  <Plus size={14} /> Tambah Menu
                </Link>
              </div>
            </motion.div>
          )}

          {hasBooking && isBookingFree && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 p-4 rounded-2xl flex gap-3 text-green-200"
            >
              <PartyPopper className="flex-shrink-0 mt-0.5 text-green-400" size={20} />
              <div>
                <p className="font-bold text-green-100">Booking Meja GRATIS! 🎉</p>
                <p className="text-sm">Total pesanan Anda sudah memenuhi syarat untuk mendapatkan meja gratis.</p>
              </div>
            </motion.div>
          )}

          {/* DAFTAR ITEM */}
          <div className="space-y-4">
            {cart.map((item) => {
              const isBooking = item.category === 'booking';
              const itemTotal = (item.price || 0) * (item.qty || 1);
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={item.id || `${item.menu_id}-${item.category}`} 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl hover:border-[#D4AF37]/30 transition-all group"
                >
                  <div className="flex gap-4">
                    {/* Gambar */}
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isBooking ? (
                            <Calendar className="text-gray-400" size={24} />
                          ) : (
                            <Utensils className="text-gray-400" size={24} />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isBooking ? (
                              <span className="text-xs uppercase font-bold bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                                📅 Booking
                              </span>
                            ) : (
                              <span className="text-xs uppercase font-bold bg-gradient-to-r from-[#D4AF37]/20 to-[#F4D03F]/20 text-[#D4AF37] px-2 py-1 rounded-full border border-[#D4AF37]/30">
                                🍽️ Menu
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>

                          {/* Info tambahan untuk booking */}
                          {isBooking && item.details && (
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400">
                              {item.details.meja && (
                                <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
                                  <Utensils size={10} /> Meja: {item.details.meja}
                                </span>
                              )}
                              {item.details.tanggal && (
                                <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
                                  <Calendar size={10} /> {new Date(item.details.tanggal).toLocaleDateString('id-ID')}
                                </span>
                              )}
                              {item.details.waktu && (
                                <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
                                  <Clock size={10} /> {item.details.waktu}
                                </span>
                              )}
                              {item.details.jumlah_orang && (
                                <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full">
                                  <Users size={10} /> {item.details.jumlah_orang} orang
                                </span>
                              )}
                            </div>
                          )}

                          {/* Deskripsi untuk menu */}
                          {!isBooking && item.desc && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.desc}</p>
                          )}
                        </div>

                        {/* Harga & Actions */}
                        <div className="text-right ml-2">
                          <div className="mb-2">
                            {isBooking && isBookingFreeActual ? (
                              <>
                                <span className="block text-xs text-gray-500 line-through">
                                  {formatPrice(item.price)}
                                </span>
                                <span className="font-bold text-lg text-green-400">GRATIS</span>
                              </>
                            ) : (
                              <span className="font-bold text-lg text-[#D4AF37]">
                                {formatPrice(itemTotal)}
                              </span>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatPrice(item.price)} × {item.qty}
                            </p>
                          </div>

                          {/* Quantity controls untuk menu */}
                          {!isBooking && (
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 border border-white/10">
                                <button 
                                  onClick={() => decreaseQty(item.id)}
                                  className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-md hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  disabled={item.qty <= 1}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="font-bold text-sm min-w-[24px] text-center">{item.qty}</span>
                                <button 
                                  onClick={() => addToCart(item)}
                                  className="w-6 h-6 flex items-center justify-center bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] rounded-md hover:from-white hover:to-gray-200 transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* DEBUG PANEL (Hanya di development) */}
          {process.env.NODE_ENV === 'development' && <DebugPanel />}
        </div>

        {/* === KOLOM KANAN: OPSI & BAYAR === */}
        <div className="space-y-6">
          {/* OPSI PESANAN */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl"
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Utensils size={20} className="text-[#D4AF37]" /> 
              Opsi Pesanan
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => !hasBooking && setDiningOption('dine_in')}
                disabled={hasBooking}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all relative ${
                  diningOption === 'dine_in' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] border-[#D4AF37] text-[#0F1F18] font-bold' 
                    : hasBooking 
                      ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed' 
                      : 'bg-white/5 border-white/10 text-white hover:border-[#D4AF37] hover:bg-white/10'
                }`}
              >
                <Utensils size={24} />
                <span className="text-sm font-bold">Dine In</span>
                {hasBooking && diningOption !== 'dine_in' && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <Lock size={12} />
                  </div>
                )}
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => !hasBooking && setDiningOption('pickup')}
                disabled={hasBooking}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all relative ${
                  diningOption === 'pickup'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] border-[#D4AF37] text-[#0F1F18] font-bold'
                    : hasBooking
                      ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 text-white hover:border-[#D4AF37] hover:bg-white/10'
                }`}
              >
                <ShoppingBag size={24} />
                <span className="text-sm font-bold">Pick Up</span>
                {hasBooking && diningOption !== 'pickup' && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                    <Lock size={12} />
                  </div>
                )}
              </motion.button>
            </div>
            {hasBooking && (
              <p className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-1">
                <Info size={12} />
                Booking meja wajib Dine-In
              </p>
            )}

            {/* Form untuk pickup */}
            <AnimatePresence>
              {diningOption === 'pickup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3 overflow-hidden"
                >
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nama Penerima *</label>
                    <input
                      type="text"
                      name="nama_penerima"
                      value={pickupData.nama_penerima}
                      onChange={handlePickupDataChange}
                      placeholder="Masukkan nama penerima"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Catatan (opsional)</label>
                    <textarea
                      name="catatan"
                      value={pickupData.catatan}
                      onChange={handlePickupDataChange}
                      placeholder="Contoh: Jangan pakai sambal, extra panas, dll."
                      rows="2"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* VOUCHER SECTION - DIPERBAIKI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl"
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Ticket size={20} className="text-[#D4AF37]" /> 
              Kode Promo
            </h3>
            
            <AnimatePresence>
              {activeVoucher ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 p-4 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle size={16} />
                      <div>
                        <span className="font-bold">{activeVoucher.name}</span>
                        <p className="text-xs text-green-400/80">
                          {activeVoucher.type === 'percentage' 
                            ? `Diskon ${activeVoucher.value}%` 
                            : `Diskon Rp${activeVoucher.value.toLocaleString('id-ID')}`
                          }
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={removeVoucher}
                      className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-white/10 rounded"
                    >
                      Hapus
                    </button>
                  </div>
                  
                  {/* Tampilkan info penggunaan */}
                  {activeVoucher.min_pembelian > 0 && (
                    <p className="text-xs text-gray-400">
                      Min. pembelian: Rp{activeVoucher.min_pembelian.toLocaleString('id-ID')}
                    </p>
                  )}
                  
                  {/* Tampilkan info diskon saat ini */}
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal saat ini:</span>
                      <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>Diskon diterapkan:</span>
                      <span className="font-bold">-Rp{discount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode promo"
                      value={inputVoucher}
                      onChange={(e) => setInputVoucher(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleCheckVoucher(inputVoucher)}
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCheckVoucher(inputVoucher)}
                      disabled={checkingVoucher || !inputVoucher.trim()}
                      className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] px-4 py-3 rounded-xl font-bold hover:from-white hover:to-gray-200 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                    >
                      {checkingVoucher ? (
                        <Loader2 size={18} className="animate-spin mx-auto" />
                      ) : 'Pakai'}
                    </motion.button>
                  </div>
                  {voucherError && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-xs flex items-center gap-1"
                    >
                      <AlertCircle size={12} /> {voucherError}
                    </motion.p>
                  )}
                  <p className="text-xs text-gray-500">
                    Contoh: DISKON25K, PROMO50, dll.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RINGKASAN PEMBAYARAN - DIPERBAIKI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl"
          >
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-[#D4AF37]" /> 
              Ringkasan Pembayaran
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({totalFoodItems} item)</span>
                <span>Rp{subtotal.toLocaleString('id-ID')}</span>
              </div>
              
              {hasBooking && (
                <div className="flex justify-between text-gray-400">
                  <span>Biaya Meja</span>
                  <span className={isBookingFreeActual ? "text-green-400" : ""}>
                    {isBookingFreeActual ? (
                      <span className="flex items-center gap-1">
                        <Check size={14} /> GRATIS
                      </span>
                    ) : (
                      `Rp${tablePriceOriginal.toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
              )}
              
              {/* ✅ TAMPILKAN DISKON DENGAN BENAR */}
              {activeVoucher && discount > 0 && (
                <div className="flex justify-between items-center text-green-400">
                  <div className="flex items-center gap-1">
                    {activeVoucher.type === 'percentage' ? (
                      <Percent size={12} />
                    ) : (
                      <DollarSign size={12} />
                    )}
                    <span>Diskon ({activeVoucher.code})</span>
                  </div>
                  <span className="font-bold">-Rp{discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Bayar</span>
                  <span className="text-[#D4AF37]">Rp{totalBayar.toLocaleString('id-ID')}</span>
                </div>
                
                {/* ✅ BREAKDOWN JIKA ADA VOUCHER */}
                {activeVoucher && discount > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <span className="text-right text-gray-400">Subtotal:</span>
                      <span className="text-right">Rp{subtotal.toLocaleString('id-ID')}</span>
                      <span className="text-right text-gray-400">Diskon:</span>
                      <span className="text-right text-green-400">-Rp{discount.toLocaleString('id-ID')}</span>
                      {hasBooking && (
                        <>
                          <span className="text-right text-gray-400">Biaya meja:</span>
                          <span className="text-right">{isBookingFreeActual ? 'GRATIS' : `Rp${tablePriceFinal.toLocaleString('id-ID')}`}</span>
                        </>
                      )}
                      <span className="text-right text-gray-400 font-bold">Total:</span>
                      <span className="text-right font-bold">Rp{totalBayar.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
                
                {totalBayar === 0 && (
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <Shield size={12} /> Pesanan ini gratis!
                  </p>
                )}
              </div>
            </div>

            {/* QRIS — Otomatis muncul */}
            {paymentMethod === 'qris' && totalBayar > 0 && (
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm flex items-center gap-1">
                    <QrCode size={16} /> QRIS
                  </h4>
                  <button 
                    onClick={() => setShowQRIS(!showQRIS)}
                    className="text-xs text-[#D4AF37] flex items-center gap-1"
                  >
                    {showQRIS ? <EyeOff size={12} /> : <Eye size={12} />}  
                    {showQRIS ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>

                <AnimatePresence>
                  {showQRIS && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 bg-black/20 rounded-lg"
                    >
                      <div className="aspect-square w-full max-w-xs mx-auto mb-3 bg-white p-2 rounded-lg">
                        <QRCode value={qrContent} size={200} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Scan untuk bayar</p>
                        <div className="flex justify-center gap-2">
                          <code className="text-xs bg-black/40 px-2 py-1 rounded truncate max-w-[180px]">
                            {qrContent.substring(0, 30)}...
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(qrContent);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-[#D4AF37] hover:text-white"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        {copied && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-green-400 text-xs mt-1"
                          >
                            ✅ Disalin!
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center text-xs text-gray-500">
                  <p>Bayar tepat <strong>Rp{totalBayar.toLocaleString('id-ID')}</strong></p>
                  <p className="mt-1">⚠️ Jangan kurang/lebih</p>
                </div>
              </div>
            )}

            {/* METODE PEMBAYARAN */}
            {totalBayar > 0 && (
              <>
                <h4 className="font-bold text-white mb-3 text-sm">Metode Pembayaran</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'qris'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] border-[#D4AF37] text-[#0F1F18] font-bold'
                        : 'bg-white/5 border-white/10 text-white hover:border-[#D4AF37] hover:bg-white/10'
                    }`}
                  >
                    <CreditCard size={20} />
                    <span className="text-xs font-bold">QRIS</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !hasBooking && setPaymentMethod('cash')}
                    disabled={hasBooking}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all relative ${
                      paymentMethod === 'cash'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] border-[#D4AF37] text-[#0F1F18] font-bold'
                        : hasBooking
                          ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
                          : 'bg-white/5 border-white/10 text-white hover:border-[#D4AF37] hover:bg-white/10'
                    }`}
                  >
                    <Banknote size={20} />
                    <span className="text-xs font-bold">Tunai</span>
                    {hasBooking && paymentMethod !== 'cash' && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <Lock size={12} />
                      </div>
                    )}
                  </motion.button>
                </div>

                {/* Upload Bukti untuk QRIS */}
                <AnimatePresence>
                  {paymentMethod === 'qris' && totalBayar > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <label className="block text-sm text-gray-400 mb-3">Upload Bukti Transfer *</label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-4 hover:border-[#D4AF37] transition-colors">
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                          {buktiTransfer ? (
                            <div className="text-center">
                              <div className="mb-2 p-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full inline-block">
                                <CheckCircle size={24} className="text-green-400" />
                              </div>
                              <p className="text-green-400 font-bold text-sm">
                                {buktiTransfer.name.substring(0, 20)}...
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBuktiTransfer(null);
                                }}
                                className="text-xs text-gray-400 hover:text-white mt-2"
                              >
                                Ganti File
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="text-gray-400 mb-2" size={24} />
                              <p className="text-sm text-gray-400">Klik untuk upload bukti</p>
                              <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 2MB)</p>
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size <= 2 * 1024 * 1024) {
                                  setBuktiTransfer(file);
                                } else {
                                  alert("❌ File terlalu besar! Maksimal 2MB.");
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info untuk pembayaran tunai */}
                {paymentMethod === 'cash' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Store size={16} />
                      <span className="font-bold text-sm">Bayar di Kasir</span>
                    </div>
                    <p className="text-xs text-yellow-400/80">
                      Silakan lakukan pembayaran di kasir saat mengambil pesanan.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* TOMBOL BAYAR */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={loading || (paymentMethod === 'qris' && totalBayar > 0 && !buktiTransfer)}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden group ${
                loading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : paymentMethod === 'qris' && totalBayar > 0 && !buktiTransfer
                    ? 'bg-gray-500 cursor-not-allowed'
                    : totalBayar === 0
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-[#0F1F18] hover:from-white hover:to-gray-200'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  Memproses...
                </span>
              ) : totalBayar === 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={20} /> Konfirmasi Pesanan Gratis
                </span>
              ) : paymentMethod === 'qris' ? (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard size={20} /> Bayar & Konfirmasi
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart size={20} /> Buat Pesanan
                </span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            </motion.button>

            {/* Informasi tambahan */}
            <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
              <Shield size={12} />
              Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;