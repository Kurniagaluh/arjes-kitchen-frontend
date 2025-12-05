import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Clock, CheckCircle, LogOut, MapPin, Calendar, Coffee, Home } from 'lucide-react';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  // Data Dummy User (Nanti dari Database user.php)
  const user = {
    name: "Kurnia Galuh",
    email: "kurnia@student.uns.ac.id",
    role: "Mahasiswa Vokasi",
    avatar: "K"
  };

  // Data Dummy Riwayat Booking (Nanti dari booking.php & orderitem.php)
  const bookings = [
    {
      id: "BK-001",
      date: "2025-12-01",
      time: "19:00",
      table: "Meja T3 (Round)",
      status: "Pending", // Pending, Confirmed, Completed
      items: ["Kopi Susu Arjes", "Nasi Goreng Special"],
      total: "Rp 43.000"
    },
    {
      id: "BK-002",
      date: "2025-11-28",
      time: "13:00",
      table: "Meja VIP",
      status: "Completed",
      items: ["Americano", "Matcha Latte", "French Fries"],
      total: "Rp 65.000"
    }
  ];

  return (
    <div className="min-h-screen bg-arjes-bg text-white flex flex-col md:flex-row font-sans">
      
      {/* --- SIDEBAR KIRI --- */}
      <aside className="w-full md:w-64 bg-black/20 border-r border-white/5 p-6 flex flex-col justify-between">
        <div>
          {/* Logo Kecil */}
          <Link to="/" className="flex items-center gap-2 mb-10 text-arjes-gold hover:opacity-80 transition-opacity">
            <Coffee size={24} />
            <span className="font-serif font-bold text-xl">Arjes User</span>
          </Link>

          {/* Profil Singkat */}
          <div className="flex items-center gap-3 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-arjes-gold to-yellow-600 flex items-center justify-center font-bold text-black">
              {user.avatar}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm truncate">{user.name}</h4>
              <p className="text-xs text-arjes-muted truncate">{user.role}</p>
            </div>
          </div>

          {/* Menu Navigasi */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'bookings' ? 'bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}
              `}
            >
              <Calendar size={18} /> Riwayat Booking
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'profile' ? 'bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}
              `}
            >
              <User size={18} /> Edit Profil
            </button>
            <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-arjes-muted hover:bg-white/5 hover:text-white transition-all">
              <Home size={18} /> Kembali ke Home
            </Link>
          </nav>
        </div>

        {/* Tombol Logout */}
        <Link to="/login" className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 mt-6">
          <LogOut size={18} /> Logout
        </Link>
      </aside>


      {/* --- KONTEN KANAN --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">
            {activeTab === 'bookings' ? 'Booking Saya' : 'Profil Pengguna'}
          </h1>
          <span className="text-sm text-arjes-muted bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>

        {/* TAB 1: BOOKING HISTORY */}
        {activeTab === 'bookings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-arjes-surface/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-arjes-gold/30 transition-colors group">
                
                {/* Info Utama */}
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${booking.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                  `}>
                    {booking.status === 'Completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-arjes-gold transition-colors">{booking.table}</h3>
                    <p className="text-sm text-arjes-muted flex items-center gap-2 mt-1">
                      <Calendar size={14} /> {booking.date} • {booking.time}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {booking.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-black/30 px-2 py-1 rounded text-white/70">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status & Harga */}
                <div className="flex flex-col items-end justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-2
                    ${booking.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}
                  `}>
                    {booking.status}
                  </span>
                  <span className="text-xl font-bold text-white">{booking.total}</span>
                </div>

              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 2: PROFILE EDIT */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="bg-arjes-surface/50 border border-white/5 rounded-2xl p-8 max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl font-bold">
                    {user.avatar}
                  </div>
                  <button className="text-sm text-arjes-gold border border-arjes-gold px-4 py-2 rounded-lg hover:bg-arjes-gold hover:text-arjes-bg transition-all">
                    Ubah Foto
                  </button>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-arjes-muted mb-2">Nama Depan</label>
                      <input type="text" defaultValue="Kurnia" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold" />
                    </div>
                    <div>
                      <label className="block text-sm text-arjes-muted mb-2">Nama Belakang</label>
                      <input type="text" defaultValue="Galuh" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-arjes-muted mb-2">Email</label>
                    <input type="email" defaultValue={user.email} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold" />
                  </div>
                  <div>
                    <label className="block text-sm text-arjes-muted mb-2">Status Mahasiswa</label>
                    <input type="text" defaultValue={user.role} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold" />
                  </div>
                  <button className="bg-arjes-gold text-arjes-bg font-bold px-6 py-3 rounded-xl mt-4 hover:bg-white transition-colors">
                    Simpan Perubahan
                  </button>
                </form>
             </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default UserDashboard;