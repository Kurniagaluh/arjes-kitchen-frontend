import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, MapPin, Clock, Ticket, 
  QrCode, CheckCircle, AlertCircle, Utensils 
} from 'lucide-react';
import { useCart } from '../../context/CartContext'; // Pastikan path ke context benar (naik 2 level)

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart(); 
  
  // State Form
  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' atau 'pickup'
  const [pickupTime, setPickupTime] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  
  // State Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // State Payment
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Perhitungan Harga
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax - discount;

  // Redirect jika keranjang kosong
  useEffect(() => {
    if (cart.length === 0 && !isPaid) {
      navigate('/menu');
    }
  }, [cart, navigate, isPaid]);

  // Logic Voucher Sederhana (Simulasi)
  const handleApplyVoucher = () => {
    setVoucherError('');
    if (!voucherCode) return;

    if (voucherCode === 'ARJES20') {
      const discValue = subtotal * 0.2; 
      setDiscount(discValue);
      setAppliedVoucher('ARJES20');
    } else if (voucherCode === 'PICKUPHEMAT' && orderType === 'pickup') {
      setDiscount(15000); 
      setAppliedVoucher('PICKUPHEMAT');
    } else if (voucherCode === 'PICKUPHEMAT' && orderType !== 'pickup') {
      setVoucherError('Voucher ini khusus untuk pesanan Pickup!');
    } else {
      setVoucherError('Kode voucher tidak valid.');
    }
  };

  // Logic Bayar (Simulasi)
  const handlePayment = () => {
    if (orderType === 'pickup' && !pickupTime) {
      alert("Mohon isi jam pengambilan!");
      return;
    }
    
    setIsLoading(true);

    // Simulasi loading 2 detik
    setTimeout(() => {
      setIsLoading(false);
      setIsPaid(true);
      clearCart(); 
    }, 2000);
  };

  // Tampilan Sukses Bayar
  if (isPaid) {
    return (
      <div className="min-h-screen bg-arjes-bg flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 animate-bounce">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-arjes-gold mb-2">Pembayaran Berhasil!</h2>
        <p className="text-gray-400 max-w-md mb-8">
          Terima kasih. Pesanan Anda sedang kami siapkan. Silakan {orderType === 'pickup' ? 'datang sesuai jam pengambilan' : 'tunggu di meja Anda'}.
        </p>
        <Link to="/user/dashboard" className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">
          Cek Status di Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arjes-bg text-white pb-20">
      {/* Header */}
      <div className="p-6 border-b border-white/10 sticky top-0 bg-arjes-bg/95 backdrop-blur-sm z-10 flex items-center gap-4">
        <button onClick={() => navigate('/menu')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-serif">Checkout Pesanan</h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
        
        {/* KOLOM KIRI: Form Order */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Metode Pesanan */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-arjes-gold mb-4 flex items-center gap-2">
              <Utensils size={20} /> Metode Pesanan
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setOrderType('dine-in')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === 'dine-in' ? 'border-arjes-gold bg-arjes-gold/10 text-arjes-gold' : 'border-white/10 hover:border-white/30 text-gray-400'}`}
              >
                <MapPin size={28} />
                <span className="font-bold">Makan di Tempat</span>
              </button>
              
              <button 
                onClick={() => setOrderType('pickup')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === 'pickup' ? 'border-arjes-gold bg-arjes-gold/10 text-arjes-gold' : 'border-white/10 hover:border-white/30 text-gray-400'}`}
              >
                <ShoppingBag size={28} />
                <span className="font-bold">Ambil Sendiri (Pickup)</span>
              </button>
            </div>

            {/* Input Tambahan */}
            <div className="mt-6 animate-fade-in">
              {orderType === 'pickup' ? (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Jam Pengambilan</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="time" 
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-arjes-gold outline-none"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nomor Meja (Opsional)</label>
                  <input 
                    type="number" 
                    placeholder="Contoh: 12" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-arjes-gold outline-none"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}
            </div>
          </section>

          {/* 2. Metode Pembayaran (QRIS) */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-arjes-gold mb-4 flex items-center gap-2">
              <QrCode size={20} /> Pembayaran QRIS
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center bg-black/20 p-6 rounded-xl border border-white/5">
              <div className="bg-white p-4 rounded-xl">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BayarArjesKitchen" 
                  alt="QRIS Arjes" 
                  className="w-40 h-40 object-contain"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-gray-400 text-sm mb-2">Scan QR code di samping menggunakan aplikasi e-wallet (GoPay, OVO, Dana) atau Mobile Banking.</p>
                <div className="bg-arjes-gold/10 border border-arjes-gold/20 p-3 rounded-lg inline-block">
                  <p className="text-arjes-gold font-bold text-lg">Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: Ringkasan Order */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>
            
            {/* --- BAGIAN YANG TADI ERROR (Sudah diperbaiki) --- */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image || "https://via.placeholder.com/50"} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold truncate">{item.name}</h4>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{item.qty}x</span>
                      <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Input */}
            <div className="mb-6">
              <label className="text-xs text-gray-500 mb-1 block">Kode Voucher</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Kode Promo" 
                  className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-arjes-gold outline-none uppercase"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  disabled={appliedVoucher !== null}
                />
                <button 
                  onClick={handleApplyVoucher}
                  disabled={appliedVoucher !== null}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {appliedVoucher ? 'OK' : 'Pakai'}
                </button>
              </div>
              {voucherError && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle size={10} /> {voucherError}</p>}
              {appliedVoucher && <p className="text-green-400 text-xs mt-2 flex items-center gap-1"><CheckCircle size={10} /> Voucher berhasil!</p>}
            </div>

            {/* Kalkulasi */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Pajak (11%)</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 font-bold">
                  <span>Diskon</span>
                  <span>- {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-arjes-gold border-t border-white/10 pt-3 mt-2">
                <span>Total Bayar</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-arjes-gold to-yellow-600 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;