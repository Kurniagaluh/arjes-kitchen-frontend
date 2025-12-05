import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Clock, CheckCircle, LogOut, Calendar, Coffee, Home, 
  Loader2, Ticket, Copy, Check // Import Icon Tambahan
} from 'lucide-react';
import api from '../../api/axios'; 

// --- DATA DUMMY VOUCHER (Bisa dipindah ke Database nanti) ---
const vouchersData = [
  {
    id: 1,
    title: "Diskon Opening",
    desc: "Potongan harga untuk semua menu kopi & main course.",
    minPurchase: "Min. belanja Rp 50.000",
    validUntil: "31 Des 2024",
    code: "ARJES20",
    discount: "20%"
  },
  {
    id: 2,
    title: "Hemat Pickup",
    desc: "Khusus pemesanan ambil sendiri (Self Pickup).",
    minPurchase: "Min. belanja Rp 40.000",
    validUntil: "15 Jan 2025",
    code: "PICKUPHEMAT",
    discount: "Rp 15rb"
  },
  {
    id: 3,
    title: "Traktiran Teman",
    desc: "Beli 2 Kopi Susu Arjes gratis 1 Snack.",
    minPurchase: "Tanpa minimum",
    validUntil: "20 Des 2024",
    code: "TRAKTIRARJES",
    discount: "Free Item"
  }
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings'); // Default tab
  
  // State Data User
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "...",
    phone: "...",
    role: "...",
    avatar: "U"
  });

  // State Data Booking
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // State untuk Copy Voucher
  const [copiedCode, setCopiedCode] = useState(null);

  // 1. EFEK: CEK LOGIN & AMBIL PROFIL
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
    } else {
      try {
        const user = JSON.parse(storedUser);
        setUserData({
          name: user.name || "User",
          email: user.email || "-",
          phone: user.phone || "-",
          role: user.role === 'customer' ? 'Member Arjes' : user.role,
          avatar: (user.name || "U").charAt(0).toUpperCase()
        });
      } catch (error) {
        console.error("Gagal parse user", error);
      }
    }
  }, [navigate]);

  // 2. EFEK: AMBIL DATA BOOKING
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await api.get('/booking/me'); 
      setBookings(response.data.data || response.data); 
    } catch (error) {
      console.error("Gagal ambil booking:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  }

  // Logic Copy Code Voucher
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-arjes-bg text-white flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-black/20 border-r border-white/5 p-6 flex flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-10 text-arjes-gold hover:opacity-80 transition-opacity">
            <Coffee size={24} />
            <span className="font-serif font-bold text-xl">Arjes User</span>
          </Link>

          <div className="flex items-center gap-3 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-arjes-gold to-yellow-600 flex items-center justify-center font-bold text-black shadow-lg">
              {userData.avatar}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm truncate">{userData.name}</h4>
              <p className="text-xs text-arjes-muted truncate">{userData.email}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-arjes-gold text-arjes-bg' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}`}>
              <Calendar size={18} /> Riwayat Booking
            </button>
            
            {/* TOMBOL BARU: VOUCHER */}
            <button onClick={() => setActiveTab('vouchers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'vouchers' ? 'bg-arjes-gold text-arjes-bg' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}`}>
              <Ticket size={18} /> Info Voucher
            </button>

            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-arjes-gold text-arjes-bg' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}`}>
              <User size={18} /> Profil Saya
            </button>
            
            <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-arjes-muted hover:bg-white/5 hover:text-white transition-all">
              <Home size={18} /> Kembali ke Home
            </Link>
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 mt-6 w-full text-left transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* KONTEN KANAN */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">
            {activeTab === 'bookings' && `Halo, ${userData.name.split(' ')[0]}!`}
            {activeTab === 'vouchers' && 'Voucher Spesial'}
            {activeTab === 'profile' && 'Profil Pengguna'}
          </h1>
        </header>

        {/* --- TAB 1: BOOKING (DATA DARI API) --- */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            {loadingBookings && (
              <div className="text-center py-10 text-arjes-muted flex flex-col items-center">
                <Loader2 className="animate-spin mb-2" />
                <p>Mengambil data booking...</p>
              </div>
            )}

            {!loadingBookings && bookings.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-arjes-muted">
                  <Calendar size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Belum Ada Reservasi</h3>
                <p className="text-arjes-muted mb-6">Kamu belum pernah melakukan booking meja. Yuk pesan sekarang!</p>
                <Link to="/booking" className="bg-arjes-gold text-arjes-bg px-6 py-3 rounded-xl font-bold hover:bg-white transition-colors inline-block">
                  Booking Meja Baru
                </Link>
              </div>
            )}

            {!loadingBookings && bookings.map((booking) => (
              <div key={booking.id} className="bg-arjes-surface/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-arjes-gold/30 transition-colors">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                  `}>
                    {booking.status === 'confirmed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {booking.meja ? booking.meja.name : `Meja #${booking.meja_id}`}
                    </h3>
                    <p className="text-sm text-arjes-muted flex items-center gap-2 mt-1">
                      <Calendar size={14} /> {booking.tanggal} • {booking.jam}
                    </p>
                    {booking.order_items && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs bg-black/30 px-2 py-1 rounded text-white/70">
                          {booking.order_items.length} Item Pesanan
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-2
                    ${booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}
                  `}>
                    {booking.status}
                  </span>
                  <span className="text-xl font-bold text-white">
                    {booking.total_harga ? formatRupiah(booking.total_harga) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* --- TAB 2: VOUCHER (FITUR BARU) --- */}
        {activeTab === 'vouchers' && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <p className="text-arjes-muted mb-6">Salin kode di bawah ini dan gunakan saat checkout.</p>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {vouchersData.map((voucher) => (
                 <div key={voucher.id} className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-arjes-gold/50 transition-all hover:-translate-y-1">
                   {/* Bagian Atas */}
                   <div className="p-5 flex-1">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <h3 className="text-xl font-bold text-white group-hover:text-arjes-gold transition-colors">
                           {voucher.title}
                         </h3>
                         <span className="inline-block px-2 py-0.5 mt-1 text-xs font-semibold bg-arjes-gold/20 text-arjes-gold rounded">
                           {voucher.discount}
                         </span>
                       </div>
                       <Ticket className="text-white/20 group-hover:text-arjes-gold/40 transition-colors" size={40} />
                     </div>
                     <p className="text-sm text-gray-400 mb-4">{voucher.desc}</p>
                     <div className="flex flex-col gap-1 text-xs text-gray-500">
                       <div className="flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-arjes-gold"></span>
                         {voucher.minPurchase}
                       </div>
                       <div className="flex items-center gap-2">
                         <Clock size={12} /> Berlaku s/d {voucher.validUntil}
                       </div>
                     </div>
                   </div>

                   {/* Garis Putus-putus */}
                   <div className="relative h-4 bg-black/20">
                     <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-white/20"></div>
                     <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#0a0a0a] rounded-full -translate-y-1/2"></div>
                     <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#0a0a0a] rounded-full -translate-y-1/2"></div>
                   </div>

                   {/* Bagian Bawah: Copy Code */}
                   <div className="p-4 bg-black/20 flex items-center justify-between gap-4">
                     <div className="flex-1 bg-black/40 border border-white/10 border-dashed rounded px-3 py-2 text-center font-mono text-arjes-gold tracking-widest font-bold">
                       {voucher.code}
                     </div>
                     <button
                       onClick={() => handleCopy(voucher.code)}
                       className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                         ${copiedCode === voucher.code 
                           ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                           : 'bg-arjes-gold text-black hover:bg-yellow-500 active:scale-95'
                         }`}
                     >
                       {copiedCode === voucher.code ? <><Check size={16} /> Salin</> : <><Copy size={16} /> Salin</>}
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </motion.div>
        )}

        {/* --- TAB 3: PROFIL (DATA LOKAL) --- */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="bg-arjes-surface/50 border border-white/5 rounded-2xl p-8 max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-arjes-gold to-yellow-700 flex items-center justify-center text-4xl font-bold text-white shadow-2xl border-4 border-arjes-bg">
                    {userData.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{userData.name}</h2>
                    <p className="text-arjes-muted">{userData.role}</p>
                  </div>
                </div>
                <div className="grid gap-6">
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <label className="block text-xs text-arjes-gold uppercase tracking-wider mb-1">Email</label>
                    <p className="font-medium text-white">{userData.email}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <label className="block text-xs text-arjes-gold uppercase tracking-wider mb-1">No. Handphone</label>
                    <p className="font-medium text-white">{userData.phone}</p>
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;