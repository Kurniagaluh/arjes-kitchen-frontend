import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Search, 
  TrendingUp, 
  DollarSign,
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // DATA DUMMY (Nanti dari Database orderadmincontroller.php)
  const stats = [
    { title: "Total Pendapatan", value: "Rp 2.5jt", icon: <DollarSign />, change: "+12%" },
    { title: "Pesanan Masuk", value: "45", icon: <ShoppingBag />, change: "+5%" },
    { title: "Pelanggan Baru", value: "12", icon: <Users />, change: "+2%" },
  ];

  const orders = [
    { id: "#ORD-001", customer: "Rizky Teknik", items: "Kopi Susu, Kentang", total: "35.000", status: "Pending", time: "10:30" },
    { id: "#ORD-002", customer: "Sari FISIP", items: "Nasi Goreng Arjes", total: "25.000", status: "Cooking", time: "10:45" },
    { id: "#ORD-003", customer: "Budi Vokasi", items: "Matcha Latte", total: "24.000", status: "Completed", time: "09:15" },
    { id: "#ORD-004", customer: "Dinda FEB", items: "Wagyu Steak", total: "85.000", status: "Pending", time: "11:00" },
  ];

  return (
    <div className="min-h-screen bg-arjes-bg text-white flex font-sans">
      
      {/* --- SIDEBAR ADMIN --- */}
      <aside className="w-64 bg-[#0D1812] border-r border-white/5 flex flex-col fixed h-full z-20">
        <div className="p-6">
          <h2 className="text-2xl font-serif font-bold text-arjes-gold mb-1">Arjes Admin</h2>
          <p className="text-xs text-arjes-muted">Kitchen Management</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-arjes-gold text-arjes-bg font-bold' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-arjes-gold text-arjes-bg font-bold' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}`}
          >
            <ShoppingBag size={20} /> Pesanan
            <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">3</span>
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'menu' ? 'bg-arjes-gold text-arjes-bg font-bold' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}`}
          >
            <Utensils size={20} /> Kelola Menu
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-arjes-gold text-arjes-bg font-bold' : 'text-arjes-muted hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={20} /> Pengaturan
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link to="/login" className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2">
            <LogOut size={18} /> Logout
          </Link>
        </div>
      </aside>

      {/* --- KONTEN UTAMA (Sebelah Kanan) --- */}
      <main className="flex-1 ml-64 p-8">
        
        {/* Header Konten */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Halo, Admin Arjes! 👋</h1>
            <p className="text-arjes-muted text-sm">Berikut update resto hari ini.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Cari data..." className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-arjes-gold" />
            </div>
            <div className="w-10 h-10 bg-arjes-gold rounded-full flex items-center justify-center font-bold text-arjes-bg">A</div>
          </div>
        </header>

        {/* --- VIEW 1: DASHBOARD STATS --- */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Kartu Statistik */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-arjes-surface/50 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-arjes-muted text-sm mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-arjes-gold/20 text-arjes-gold rounded-full flex items-center justify-center mb-2 ml-auto">
                      {stat.icon}
                    </div>
                    <span className="text-green-400 text-xs font-bold">{stat.change} vs kemarin</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Grafik Placeholder */}
            <div className="bg-arjes-surface/30 border border-white/5 rounded-2xl p-8 h-64 flex flex-col items-center justify-center text-arjes-muted">
              <TrendingUp size={48} className="mb-4 opacity-50" />
              <p>Grafik Penjualan akan muncul di sini (Integrasi Chart.js)</p>
            </div>
          </motion.div>
        )}

        {/* --- VIEW 2: ORDERS MANAGEMENT --- */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-arjes-surface/30 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-arjes-gold text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-4">ID Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Menu Item</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-white/70">{order.id}</td>
                      <td className="p-4 font-bold">{order.customer}<div className="text-xs text-arjes-muted">{order.time}</div></td>
                      <td className="p-4 text-arjes-muted">{order.items}</td>
                      <td className="p-4 font-bold">Rp {order.total}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold
                          ${order.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                            order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}
                        `}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all" title="Terima">
                          <CheckCircle size={18} />
                        </button>
                        <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Tolak">
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* --- VIEW 3: MENU MANAGEMENT --- */}
        {activeTab === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-arjes-surface/30 border border-white/5 rounded-2xl">
            <Utensils size={64} className="mx-auto text-arjes-gold mb-6 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">Kelola Menu Makanan</h3>
            <p className="text-arjes-muted mb-6">Fitur tambah, edit, dan hapus menu akan ada di sini.</p>
            <button className="bg-arjes-gold text-arjes-bg font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors">
              + Tambah Menu Baru
            </button>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;