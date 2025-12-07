import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext'; 
import { Trash2, CreditCard, Upload, ArrowLeft, Ticket, CheckCircle, Store, Banknote, Utensils, ShoppingBag, AlertTriangle, Lock, PartyPopper, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  
  const { 
    cart, 
    addToCart,      
    decreaseQty,    
    removeFromCart, 
    clearCart, 
    activeVoucher, 
    applyVoucher 
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('qris'); 
  const [diningOption, setDiningOption] = useState('dine-in'); 
  const [buktiTransfer, setBuktiTransfer] = useState(null);
  const [inputVoucher, setInputVoucher] = useState('');

  // --- 1. LOGIKA "TIERED PRICING" (Regular vs VIP) ---
  const bookingItem = cart.find(item => item.category === 'reservation');
  const foodItems = cart.filter(item => item.category !== 'reservation');
  const hasBooking = !!bookingItem;

  // Hitung Total Makanan Saja
  const subtotalFood = foodItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  // Tentukan Target Minimum Berdasarkan Tipe Meja
  let minOrderThreshold = 0;
  if (bookingItem) {
      if (bookingItem.details.type === 'vip') {
          minOrderThreshold = 50000; // VIP min 50k
      } else {
          minOrderThreshold = 25000; // Regular min 25k
      }
  }

  // Cek apakah Syarat Gratis Terpenuhi?
  const isBookingFree = hasBooking && subtotalFood >= minOrderThreshold;
  
  // Hitung Harga Akhir Meja
  const tablePriceOriginal = bookingItem ? bookingItem.price : 0;
  const tablePriceFinal = isBookingFree ? 0 : tablePriceOriginal;

  // Hitung Diskon Voucher
  let discountAmount = 0;
  if (activeVoucher) {
      if (activeVoucher.type === 'percentage') discountAmount = subtotalFood * activeVoucher.value;
      if (activeVoucher.type === 'fixed') discountAmount = activeVoucher.value;
  }

  // TOTAL FINAL YANG HARUS DIBAYAR
  const totalBayar = subtotalFood + tablePriceFinal - discountAmount;
  
  // Hitung kekurangan jajan (untuk alert)
  const kurangJajan = minOrderThreshold - subtotalFood;

  // --- 2. ATURAN PEMBAYARAN ---
  useEffect(() => {
    if (hasBooking) {
      setPaymentMethod('qris');
      setDiningOption('dine-in'); 
    }
  }, [hasBooking]);

  // --- HANDLE BAYAR (DENGAN PENYIMPANAN DATA) ---
  const handlePayment = () => {
    if (cart.length === 0) return;

    // Validasi Upload Bukti
    if (paymentMethod === 'qris' && totalBayar > 0 && !buktiTransfer) {
      alert("⚠️ Mohon upload bukti pembayaran dulu ya!");
      return;
    }

    const methodText = paymentMethod === 'qris' ? 'Pembayaran QRIS' : 'Pembayaran Tunai';
    const confirmMsg = `Total Rp ${totalBayar.toLocaleString()} akan diproses.\nMetode: ${methodText}\n\nLanjutkan?`;

    if (window.confirm(confirmMsg)) {
      
      // 1. BUAT DATA ORDER BARU (Untuk Riwayat Dashboard)
      const newOrder = {
        id: `ORD-${Date.now()}`, // ID Unik
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        items: cart, // Simpan item yang dibeli
        total: totalBayar,
        status: paymentMethod === 'qris' ? 'Menunggu Verifikasi' : 'Menunggu Pembayaran',
        method: paymentMethod,
        type: diningOption
      };

      // 2. SIMPAN KE LOCALSTORAGE (Gabungkan dengan data lama)
      const existingOrders = JSON.parse(localStorage.getItem('arjes_orders') || '[]');
      localStorage.setItem('arjes_orders', JSON.stringify([newOrder, ...existingOrders]));

      alert("🎉 Pesanan Berhasil! Silakan cek status di Dashboard.");
      clearCart(); 
      navigate('/user/dashboard'); 
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-arjes-bg flex flex-col items-center justify-center text-white p-4">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <CreditCard size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Keranjangmu Kosong</h2>
        <Link to="/menu" className="mt-4 bg-arjes-gold text-arjes-bg px-8 py-3 rounded-xl font-bold hover:bg-white transition-all">
            Pesan Menu Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arjes-bg text-arjes-text pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* === KOLOM KIRI: DAFTAR ITEM === */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/20 text-white transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-serif font-bold text-white">Review Pesanan</h1>
          </div>

          {/* ALERT PROMO */}
          {hasBooking && !isBookingFree && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl flex gap-3 text-yellow-200 text-sm animate-pulse">
                <AlertTriangle className="flex-shrink-0" />
                <div>
                    <p className="font-bold text-yellow-100">
                        Promo Booking {bookingItem?.details.type === 'vip' ? 'VIP' : 'Regular'}
                    </p>
                    <p>
                        Ayo jajan <b>Rp {kurangJajan.toLocaleString()}</b> lagi biar biaya meja jadi <b>GRATIS!</b> 
                        (Min. order Rp {minOrderThreshold.toLocaleString()})
                    </p>
                    <Link to="/menu" className="text-white underline font-bold mt-1 inline-block">Tambah Menu +</Link>
                </div>
            </div>
          )}

          {hasBooking && isBookingFree && (
             <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl flex gap-3 text-green-200 text-sm">
                <PartyPopper className="flex-shrink-0 text-green-400" />
                <div>
                    <p className="font-bold text-green-100">Booking Meja GRATIS! 🥳</p>
                    <p>Total jajanmu sudah di atas Rp {minOrderThreshold.toLocaleString()}. Nikmati fasilitas kami!</p>
                </div>
            </div>
          )}

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="w-24 h-24 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                        {item.category === 'reservation' ? (
                            <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full mb-2 inline-block border border-blue-500/30">
                                📅 {item.name}
                            </span>
                        ) : (
                            <span className="text-[10px] uppercase font-bold bg-arjes-gold/20 text-arjes-gold px-2 py-0.5 rounded-full mb-2 inline-block border border-arjes-gold/30">
                                🍔 Menu
                            </span>
                        )}
                        <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                        {item.details && (
                            <p className="text-xs text-gray-400 mt-1">
                                {item.details.date} • {item.details.time} • {item.details.guests} Orang
                            </p>
                        )}
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-3">
                    
                    {/* TOMBOL KUANTITAS */}
                    {item.category !== 'reservation' ? (
                        <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1">
                            <button onClick={() => decreaseQty(item.id)} className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-md hover:bg-white/20 text-white"><Minus size={14} /></button>
                            <span className="font-bold text-sm min-w-[20px] text-center">{item.qty}</span>
                            <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-arjes-gold text-arjes-bg rounded-md hover:bg-white hover:text-arjes-bg transition-colors"><Plus size={14} /></button>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">1 Unit</div>
                    )}

                    {/* HARGA */}
                    {item.category === 'reservation' ? (
                        <div className="text-right">
                            {isBookingFree ? (
                                <><span className="block text-xs text-gray-500 line-through">Rp {item.price.toLocaleString()}</span><span className="font-bold text-lg text-green-400">FREE</span></>
                            ) : (
                                <span className="font-bold text-lg text-arjes-gold">Rp {item.price.toLocaleString()}</span>
                            )}
                        </div>
                    ) : (
                        <span className="font-bold text-lg text-arjes-gold">Rp {(item.price * item.qty).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === KOLOM KANAN: OPSI & BAYAR === */}
        <div className="space-y-6">
            
          {/* OPSI PESANAN */}
          <div className="bg-white text-gray-900 p-6 rounded-3xl shadow-lg">
             <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Utensils size={16} className="text-arjes-gold" /> Opsi Pesanan</h3>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => !hasBooking && setDiningOption('dine-in')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${diningOption === 'dine-in' ? 'bg-arjes-bg text-white border-arjes-bg' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}><Utensils size={20} /><span className="text-xs font-bold">Dine In</span></button>
                <button onClick={() => !hasBooking && setDiningOption('pickup')} disabled={hasBooking} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative ${diningOption === 'pickup' ? 'bg-arjes-bg text-white border-arjes-bg' : hasBooking ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{hasBooking && <Lock size={14} className="absolute top-2 right-2 text-gray-400"/>}<ShoppingBag size={20} /><span className="text-xs font-bold">Pick Up</span></button>
             </div>
             {hasBooking && <p className="text-[10px] text-gray-500 mt-2 text-center italic">*Booking meja wajib Dine-In</p>}
          </div>

          {/* VOUCHER */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Ticket size={16} className="text-arjes-gold" /> Kode Promo</h3>
            {activeVoucher ? (
                <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-xl flex justify-between items-center text-green-400 text-sm">
                    <span className="font-bold flex items-center gap-2"><CheckCircle size={14}/> {activeVoucher.name}</span>
                    <button onClick={() => applyVoucher("REMOVE")} className="text-xs hover:text-white underline">Hapus</button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input type="text" placeholder="Masukan kode..." value={inputVoucher} onChange={(e) => setInputVoucher(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-arjes-gold uppercase" />
                    <button onClick={() => applyVoucher(inputVoucher)} className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-arjes-gold hover:text-arjes-bg transition-colors">Pakai</button>
                </div>
            )}
          </div>

          {/* STRUK & METODE BAYAR */}
          <div className="bg-white text-gray-900 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Store size={100} /></div>
            
            <div className="space-y-3 mb-6 text-sm relative z-10 border-b border-gray-100 pb-4">
              <div className="flex justify-between text-gray-600"><span>Total Makanan</span><span>Rp {subtotalFood.toLocaleString()}</span></div>
              {hasBooking && (<div className="flex justify-between font-medium"><span className={isBookingFree ? "text-green-600" : "text-gray-600"}>Biaya Meja {isBookingFree && "(Promo)"}</span>{isBookingFree ? (<span className="text-green-600 font-bold">GRATIS</span>) : (<span>Rp {tablePriceOriginal.toLocaleString()}</span>)}</div>)}
              {activeVoucher && (<div className="flex justify-between text-green-600 font-medium"><span>Diskon</span><span>-Rp {discountAmount.toLocaleString()}</span></div>)}
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2"><span>Total Bayar</span><span>Rp {totalBayar.toLocaleString()}</span></div>
            </div>

            {totalBayar > 0 ? (
                <div className="mb-6 relative z-10">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => setPaymentMethod('qris')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'qris' ? 'border-arjes-bg bg-arjes-bg/5 text-arjes-bg font-bold ring-1 ring-arjes-bg' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}><CreditCard size={18} /> <span className="text-xs">QRIS</span></button>
                    <button onClick={() => !hasBooking && setPaymentMethod('cash')} disabled={hasBooking} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative ${paymentMethod === 'cash' ? 'border-arjes-bg bg-arjes-bg/5 text-arjes-bg font-bold ring-1 ring-arjes-bg' : hasBooking ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>{hasBooking && <Lock size={14} className="absolute top-2 right-2 text-gray-400"/>}<Banknote size={18} /> <span className="text-xs">Tunai/Kasir</span></button>
                </div>

                {paymentMethod === 'qris' && (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-300">
                        <p className="text-center text-xs text-gray-500 mb-3">Scan QRIS:</p>
                        <div className="bg-white p-2 rounded-lg border border-gray-200 w-32 h-32 mx-auto mb-4 shadow-sm"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BayarKeArjesKitchen" alt="QRIS" className="w-full h-full" /></div>
                        <div className="space-y-2"><label className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors bg-white/50"><div className="flex flex-col items-center justify-center pt-1">{buktiTransfer ? (<div className="text-green-600 flex items-center gap-1 font-bold text-xs"><CheckCircle size={14}/> {buktiTransfer.name.substring(0, 10)}...</div>) : (<><Upload className="w-4 h-4 mb-1 text-gray-400" /><p className="text-[9px] text-gray-500">Upload Bukti</p></>)}</div><input type="file" className="hidden" accept="image/*" onChange={(e) => setBuktiTransfer(e.target.files[0])} /></label></div>
                    </div>
                )}

                {paymentMethod === 'cash' && (<div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-yellow-800 text-sm animate-in fade-in zoom-in-95 duration-300"><p className="font-bold flex items-center justify-center gap-2 mb-1"><Store size={18} /> Bayar di Kasir</p><p className="text-xs opacity-80">Silakan menuju kasir untuk menyelesaikan pembayaran.</p></div>)}
                </div>
            ) : (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-center text-sm font-bold border border-green-200"><p>✨ Pesananmu Gratis!</p></div>
            )}

            <button onClick={handlePayment} className="w-full bg-arjes-gold text-arjes-bg py-4 rounded-xl font-bold text-lg hover:bg-gray-900 hover:text-white transition-all shadow-xl shadow-arjes-gold/20">
              {totalBayar === 0 ? 'Konfirmasi Reservasi' : (paymentMethod === 'qris' ? 'Kirim Bukti Bayar' : 'Buat Pesanan')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;