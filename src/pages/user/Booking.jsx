import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, CheckCircle, Info, ArrowRight, Wallet } from 'lucide-react'; // Ganti Sparkles jadi Wallet
import { useCart } from '../../context/CartContext'; 

const Booking = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // State Form
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedTable, setSelectedTable] = useState(null);

  // Data Tipe Meja
  const tableTypes = [
    {
      id: 'regular',
      name: 'Meja Regular',
      price: 50000, 
      minOrder: 25000, 
      features: ['Kapasitas 2-4 Orang', 'Indoor / Outdoor', 'Stopkontak', 'Gratis jika order 25rb+'],
      color: 'border-white/20',
      bg: 'bg-white/5'
    },
    {
      id: 'vip',
      name: 'Meja VIP',
      price: 100000, 
      minOrder: 50000, 
      features: ['Kapasitas 4-8 Orang', 'Ruangan AC Private', 'Sofa Nyaman + View', 'Gratis jika order 50rb+'],
      color: 'border-arjes-gold',
      bg: 'bg-arjes-gold/10'
    }
  ];

  // --- FUNGSI BOOKING ---
  const handleBooking = () => {
    if (!date || !time || !selectedTable) {
      alert("Mohon lengkapi data reservasi (Tanggal, Jam, dan Tipe Meja)");
      return;
    }

    const user = localStorage.getItem('user');
    if (!user) {
      alert("Ups! Login dulu ya untuk booking meja. 😊");
      navigate('/login');
      return;
    }

    // Masukkan ke Keranjang
    const bookingItem = {
      id: `booking-${Date.now()}`,
      name: `Reservasi ${selectedTable.name} (${date} @ ${time})`,
      price: selectedTable.price,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
      qty: 1,
      category: 'reservation', 
      details: {
        date,
        time,
        guests,
        type: selectedTable.id // Kirim tipe meja biar Checkout tau minimal ordernya
      }
    };

    addToCart(bookingItem);
    
    // Pesan Konfirmasi yang Lebih Jelas (Bukan Promo)
    const confirmMsg = `Anda memilih ${selectedTable.name}.\n\nINFO PENTING:\nBiaya booking Rp ${selectedTable.price.toLocaleString()} adalah DP.\n\nDP ini otomatis GRATIS/DIKEMBALIKAN jika Anda memesan makanan minimal Rp ${selectedTable.minOrder.toLocaleString()} sekarang.\n\nLanjut pesan makan?`;

    if(window.confirm(confirmMsg)) {
        navigate('/menu');
    } else {
        navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-arjes-bg text-arjes-text pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-arjes-gold mb-4">Reservasi Meja</h1>
          <p className="text-white/80 max-w-lg mx-auto">
            Pastikan tempat nongkrongmu aman. Pilih meja favoritmu sekarang.
          </p>
        </div>

        {/* --- INFO DEPOSIT (BAHASA LEBIH TEGAS & JELAS) --- */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-5 mb-8 flex items-start gap-4 max-w-3xl mx-auto shadow-lg">
            <div className="bg-blue-500/20 p-3 rounded-full mt-1">
                <Wallet className="text-blue-400 w-6 h-6" />
            </div>
            <div>
                <h3 className="text-blue-300 font-bold text-lg mb-1">Ketentuan Deposit (DP)</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                    Harga meja yang tertera adalah <b>Deposit / Jaminan</b>. <br/>
                    Deposit ini akan otomatis <b>DIHAPUS (GRATIS)</b> pada total pembayaran akhir jika Anda sekalian memesan makanan/minuman dengan minimal order: <br/>
                    <span className="text-white font-bold">• Rp 25.000 (Regular)</span> <br/>
                    <span className="text-white font-bold">• Rp 50.000 (VIP)</span>
                </p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* 1. KOLOM KIRI: Form Input */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl h-fit"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Info className="text-arjes-gold" /> Detail Waktu
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pilih Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3 text-arjes-gold" size={20} />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-arjes-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Jam Datang</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3 text-arjes-gold" size={20} />
                    <input 
                      type="time" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-arjes-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Jumlah Orang</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-3 text-arjes-gold" size={20} />
                    <select 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-arjes-gold appearance-none"
                    >
                      {[2, 4, 6, 8, 10, 'More'].map(num => (
                        <option key={num} value={num} className="bg-gray-800">{num} Orang</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. KOLOM KANAN: Pilih Tipe Meja */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Pilih Tipe Meja</h2>
            
            {tableTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedTable(type)}
                className={`cursor-pointer p-6 rounded-2xl border-2 transition-all relative ${
                  selectedTable?.id === type.id 
                    ? `${type.bg} ${type.color} shadow-lg shadow-arjes-gold/10` 
                    : 'bg-white/5 border-transparent hover:border-white/20'
                }`}
              >
                {selectedTable?.id === type.id && (
                  <div className="absolute top-4 right-4 text-arjes-gold">
                    <CheckCircle size={24} fill="currentColor" className="text-white" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                      <h3 className="text-lg font-bold text-white">{type.name}</h3>
                      {/* Info kecil di bawah nama meja */}
                      <p className="text-xs text-gray-400 mt-1">
                          Deposit Gratis min. order {type.minOrder / 1000}K
                      </p>
                  </div>
                  <div className="text-right">
                      <span className="text-arjes-gold font-bold block">Rp {type.price.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-500">(DP)</span>
                  </div>
                </div>
                
                <ul className="space-y-1 mt-3 border-t border-white/10 pt-3">
                  {type.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" /> {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            <button 
              onClick={handleBooking}
              disabled={!selectedTable}
              className={`w-full py-4 rounded-xl font-bold text-lg mt-6 transition-all flex items-center justify-center gap-2 ${
                selectedTable 
                  ? 'bg-arjes-gold text-arjes-bg hover:bg-white shadow-xl shadow-arjes-gold/20' 
                  : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {selectedTable ? (
                  <> Lanjut Pesan Menu <ArrowRight size={20} /> </>
              ) : (
                  'Pilih Tipe Meja Dulu'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;