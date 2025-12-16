import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VoucherAdminPage from './VoucherAdminPage';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Ticket, 
  Coffee, CheckCircle, XCircle, 
  Eye, Store, Plus, Trash2, MapPin, 
  DollarSign, Calendar, LogOut, FileText, Upload, Filter, Menu, X, ArrowRight,
  Table // ✅ Tambahkan icon Table
} from 'lucide-react';

// --- HELPER FORMAT RUPIAH ---
const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// --- KOMPONEN KARTU STATISTIK ---
const RevenueCard = ({ title, value, subtext, color }) => (
  <div className="bg-[#0F1F18] border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden group shadow-xl transition-all hover:border-arjes-gold/30">
    <div className={`absolute -right-6 -top-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color} transform rotate-12`}>
        <DollarSign size={100} />
    </div>
    <div className="relative z-10">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Calendar size={14}/> {title}
        </p>
        <h3 className={`text-2xl md:text-3xl font-serif font-bold ${color === 'green' ? 'text-green-400' : 'text-white'} mb-2`}>{value}</h3>
        <p className="text-gray-500 text-xs">{subtext}</p>
    </div>
  </div>
);

// --- MODAL BUKTI TRANSFER ---
const ProofModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl scale-100">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-white">Bukti Transfer</h3>
          <button onClick={onClose}><XCircle className="text-gray-400 hover:text-red-500 transition-colors"/></button>
        </div>
        <div className="p-6 md:p-8 bg-black/40 flex flex-col items-center justify-center min-h-[250px] md:min-h-[300px]">
           <div className="w-full h-40 md:h-48 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10">
              <Eye size={40} className="text-gray-500" />
           </div>
           <p className="text-xs text-gray-500">Preview Bukti Transfer</p>
        </div>
        <div className="p-5 bg-[#0F1F18] border-t border-white/10 flex justify-between items-center">
           <span className="text-sm text-gray-400">Total Tagihan</span>
           <span className="text-xl font-bold text-arjes-gold">{formatRp(order.total)}</span>
        </div>
      </div>
    </div>
  );
};

// === MAIN DASHBOARD ===
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('orders'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  // Data State
  const [orders, setOrders] = useState([]);
  // Filter State
  const [revenueFilter, setRevenueFilter] = useState('today');

  // Modal States
  const [selectedProof, setSelectedProof] = useState(null);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('arjes_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  // --- LOGIC FUNCTIONS ---
  const updateOrderStatus = (id, status) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('arjes_orders', JSON.stringify(updated));
  };

  

  // --- HELPER UNTUK MENDAPATKAN LABEL TANGGAL ---
  const getDateRangeLabel = (filter) => {
    const today = new Date();
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    if (filter === 'today') return today.toLocaleDateString('id-ID', options);
    if (filter === 'week') {
       const lastWeek = new Date(today);
       lastWeek.setDate(today.getDate() - 7);
       return `${lastWeek.toLocaleDateString('id-ID', options)} - ${today.toLocaleDateString('id-ID', options)}`;
    }
    if (filter === 'month') return `Bulan ${today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    if (filter === 'year') return `Tahun ${today.getFullYear()}`;
    return "Sejak Awal";
  };

  // --- LOGIKA FILTER PENDAPATAN ---
  const getFilteredRevenue = () => {
      const finished = orders.filter(o => o.status === 'Selesai');
      let label = "";
      if (revenueFilter === 'today') label = "Hari Ini";
      else if (revenueFilter === 'week') label = "Minggu Ini";
      else if (revenueFilter === 'month') label = "Bulan Ini";
      else if (revenueFilter === 'year') label = "Tahun Ini";
      else label = "Total Keseluruhan";

      const baseTotal = finished.reduce((acc, curr) => acc + (curr.total || 0), 0);
      // Simulasi angka
      const total = revenueFilter === 'today' ? baseTotal : 
                    revenueFilter === 'week' ? baseTotal * 7 : 
                    revenueFilter === 'month' ? baseTotal * 30 : 
                    revenueFilter === 'year' ? baseTotal * 365 : baseTotal * 500;
      
      const count = revenueFilter === 'today' ? finished.length : finished.length * 5; 
      return { total, count, label };
  };

  const revenueData = getFilteredRevenue();
  const pendingCount = orders.filter(o => o.status === 'Menunggu Verifikasi' || o.status === 'Menunggu Pembayaran').length;

  const handleLogout = () => { 
    logout();
  };

  return (
    <div className="flex h-screen bg-arjes-bg text-arjes-text overflow-hidden font-sans selection:bg-arjes-gold selection:text-black">
      
      {/* --- OVERLAY MOBILE --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR ADMIN --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#0F1F18] border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        <div className="p-8 flex items-center justify-between md:justify-start gap-3 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-arjes-gold rounded-xl flex items-center justify-center text-arjes-bg font-bold shadow-lg">
                <Coffee size={24} />
             </div>
             <div>
               <h1 className="text-xl font-serif font-bold text-white tracking-wide">Arjes Admin</h1>
               <p className="text-xs text-gray-400">{user?.email}</p>
             </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'orders', label: 'Pesanan Masuk', icon: ShoppingBag, count: pendingCount },
            { id: 'revenue', label: 'Pendapatan', icon: FileText },
            { id: 'menu', label: 'Daftar Menu', icon: Utensils },
            { id: 'vouchers', label: 'Kode Promo', icon: Ticket },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                activeTab === item.id 
                ? 'bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20 font-bold translate-x-1' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={18} /> {item.label}
              {item.count > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{item.count}</span>}
            </button>
          ))}
          
          {/* Link ke Halaman Manajemen Meja Lengkap */}
          <Link 
            to="/admin/tables"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1 transition-all group"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Table size={18} />
            <span>Manajemen Meja</span>
            <ArrowRight size={16} className="ml-auto text-gray-500 group-hover:text-arjes-gold group-hover:translate-x-1" />
          </Link>
        </nav>

        <div className="p-6 border-t border-white/5 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative z-10 scroll-smooth">
        
        {/* HEADER RESPONSIVE */}
        <div className="mb-8 flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="md:hidden p-2 bg-[#0F1F18] border border-white/10 rounded-lg text-white shadow-lg"
            >
                <Menu size={24} />
            </button>
            
            {activeTab !== 'revenue' && (
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
                    {activeTab === 'orders' && 'Pesanan Masuk'}
                    {activeTab === 'tables' && 'Manajemen Meja'}
                    {activeTab === 'menu' && 'Daftar Menu'}
                    {activeTab === 'vouchers' && 'Kelola Promo'}
                </h2>
            )}
        </div>

        {/* --- 1. TAB PESANAN MASUK --- */}
        {activeTab === 'orders' && (
            <div className="bg-[#0F1F18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px] md:min-w-0">
                        <thead className="bg-black/30 text-gray-400 text-xs uppercase tracking-wider font-bold">
                            <tr><th className="px-6 py-5">Order ID</th><th className="px-6 py-5">Nama Customer</th><th className="px-6 py-5">Tipe</th><th className="px-6 py-5">Total & Metode</th><th className="px-6 py-5 text-right">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                            {orders.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500 italic">Belum ada pesanan masuk.</td></tr>
                            ) : (
                                orders.map(order => {
                                    const hasBooking = order.items.some(i => i.category === 'reservation');
                                    let typeBadge = hasBooking ? <span className="text-blue-400 font-bold text-xs">Booking</span> : (order.type === 'pickup' ? <span className="text-purple-400 font-bold text-xs">Pick Up</span> : <span className="text-yellow-400 font-bold text-xs">Dine In</span>);

                                    return (
                                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-5 font-mono text-arjes-gold font-bold">#{order.id.slice(-6)}</td>
                                            <td className="px-6 py-5 text-white font-medium">{order.customerName || 'Guest User'}</td>
                                            <td className="px-6 py-5">
                                                {typeBadge}
                                                <div className="text-xs text-gray-500 mt-1">{order.date} • {order.time}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white text-base">{formatRp(order.total)}</div>
                                                {order.method === 'qris' ? (
                                                    <button onClick={() => setSelectedProof(order)} className="mt-1 flex items-center gap-1.5 text-xs text-green-400 hover:underline"><Eye size={12}/> Cek Bukti</button>
                                                ) : (
                                                    <span className="text-xs text-yellow-500 flex items-center gap-1 mt-1"><Store size={12}/> Tunai</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right flex justify-end gap-2">
                                                {order.status === 'Selesai' ? <span className="text-green-500 font-bold text-xs">✅ Selesai</span> : 
                                                 order.status === 'Dibatalkan' ? <span className="text-red-500 font-bold text-xs">❌ Ditolak</span> :
                                                 <>
                                                    <button onClick={() => updateOrderStatus(order.id, 'Selesai')} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"><CheckCircle size={18}/></button>
                                                    <button onClick={() => updateOrderStatus(order.id, 'Dibatalkan')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><XCircle size={18}/></button>
                                                 </>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {selectedProof && <ProofModal order={selectedProof} onClose={() => setSelectedProof(null)} />}
            </div>
        )}

        {/* --- 2. TAB PENDAPATAN --- */}
        {activeTab === 'revenue' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">Laporan Pendapatan</h2>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative w-full sm:w-auto">
                            <select 
                                value={revenueFilter} 
                                onChange={(e) => setRevenueFilter(e.target.value)}
                                className="w-full sm:w-48 bg-[#0F1F18] border border-white/20 text-white pl-4 pr-10 py-2.5 rounded-xl appearance-none cursor-pointer hover:border-arjes-gold outline-none focus:border-arjes-gold transition-all font-bold text-sm"
                            >
                                <option value="today">Hari Ini</option>
                                <option value="week">Minggu Ini</option>
                                <option value="month">Bulan Ini</option>
                                <option value="year">Tahun Ini</option>
                                <option value="all">Total Keseluruhan</option>
                            </select>
                            <Filter size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl text-sm border border-white/5 w-full sm:w-auto">
                            <Calendar size={16} className="text-arjes-gold" />
                            <span className="text-gray-300 font-medium">{getDateRangeLabel(revenueFilter)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RevenueCard title={`Pendapatan (${revenueData.label})`} value={formatRp(revenueData.total)} color="green" subtext="Akumulasi total pesanan selesai." />
                    <RevenueCard title={`Transaksi (${revenueData.label})`} value={`${revenueData.count} Order`} color="white" subtext="Jumlah transaksi berhasil." />
                </div>

                <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10"><h3 className="font-bold text-white">Log Transaksi Masuk</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400 min-w-[600px] md:min-w-0">
                            <thead className="bg-black/30 text-xs uppercase font-bold text-gray-500">
                                <tr><th className="p-4">Tanggal</th><th className="p-4">ID Transaksi</th><th className="p-4">Customer</th><th className="p-4">Nominal</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.filter(o => o.status === 'Selesai').map(o => (
                                    <tr key={o.id}>
                                        <td className="p-4">{o.date} {o.time}</td>
                                        <td className="p-4 font-mono text-arjes-gold">{o.id}</td>
                                        <td className="p-4">{o.customerName || 'Guest'}</td>
                                        <td className="p-4 font-bold text-white">{formatRp(o.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- 3. TAB MANAJEMEN MEJA (MENU LINK KE HALAMAN KHUSUS) --- */}
        {activeTab === 'tables' && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 animate-in fade-in">
                <div className="bg-white/5 p-6 rounded-full border border-white/5">
                    <Table size={48} className="text-arjes-gold" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Manajemen Meja Restoran</h3>
                    <p className="text-gray-400 mt-2 max-w-md mx-auto">
                        Masuk ke halaman manajemen meja tingkat lanjut untuk menambah, mengedit, atau menghapus meja dan tipe meja.
                    </p>
                </div>
                
                <Link 
                  to="/admin/tables" 
                  className="flex items-center gap-4 rounded-2xl bg-[#0F1F18] p-5 pr-8 shadow-xl border border-arjes-gold/30 hover:border-arjes-gold transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-arjes-gold text-[#0F1F18] group-hover:scale-110 transition-transform">
                    <Table size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white group-hover:text-arjes-gold transition-colors">Buka Manajemen Meja</h3>
                    <p className="text-sm text-gray-500">Kelola Meja & Tipe Meja</p>
                  </div>
                  <ArrowRight className="ml-4 text-gray-500 group-hover:text-arjes-gold group-hover:translate-x-1 transition-all" />
                </Link>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Total Meja</p>
                    <p className="text-2xl font-bold text-white mt-1">8</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Tersedia</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">5</p>
                  </div>
                </div>
            </div>
        )}

        {/* --- 4. TAB MANAJEMEN MENU --- */}
        {activeTab === 'menu' && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 animate-in fade-in">
                <div className="bg-white/5 p-6 rounded-full border border-white/5">
                    <Utensils size={48} className="text-arjes-gold" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Kelola Menu Restoran</h3>
                    <p className="text-gray-400 mt-2 max-w-md mx-auto">
                        Masuk ke halaman manajemen menu tingkat lanjut untuk menambah, mengedit, atau menghapus menu.
                    </p>
                </div>
                
                <Link 
                  to="/admin/menu" 
                  className="flex items-center gap-4 rounded-2xl bg-[#0F1F18] p-5 pr-8 shadow-xl border border-arjes-gold/30 hover:border-arjes-gold transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-arjes-gold text-[#0F1F18] group-hover:scale-110 transition-transform">
                    <Utensils size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white group-hover:text-arjes-gold transition-colors">Buka Manajemen Menu</h3>
                    <p className="text-sm text-gray-500">Tambah & Hapus Makanan</p>
                  </div>
                  <ArrowRight className="ml-4 text-gray-500 group-hover:text-arjes-gold group-hover:translate-x-1 transition-all" />
                </Link>
            </div>
        )}

        {/* --- 5. TAB PROMO VOUCHER --- */}
        {activeTab === 'vouchers' && (
         <VoucherAdminPage />
         )}
      </main>
    </div>
  );
};

export default AdminDashboard;