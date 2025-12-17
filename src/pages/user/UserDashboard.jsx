import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  Coffee, LayoutDashboard, Ticket, LogOut, Home, ChevronRight, 
  Settings, Save, Lock, X, ShoppingBag, Calendar, Menu,
  Copy, Check, Clock, Loader2, AlertCircle, Filter, ChevronDown,
  ChevronUp, CreditCard, RefreshCw, Package, MapPin, CreditCard as CardIcon,
  CheckCircle, Clock as TimeIcon, AlertTriangle, Receipt, Users,
  TrendingUp, DollarSign, Star, Bell, FileText, BarChart, Grid, List
} from 'lucide-react';
import voucherAPI from '../../api/voucher';
import dashboardAPI from '../../api/dashboardApi';
import { getMyOrders, getMyPickups, cancelOrder, markOrderAsPaid } from '../../api/orderApi';
import apiClient from '../../api/axiosConfig';

// --- HELPER FORMAT RUPIAH ---
const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// --- HELPER FORMAT TANGGAL ---
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (err) {
    return dateString;
  }
};

const formatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return dateString;
  }
};

// --- HELPER: GET STATUS COLOR ---
const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'completed':
    case 'selesai':
    case 'paid':
    case 'dibayar':
    case 'confirmed':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending':
    case 'menunggu':
    case 'waiting':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'processing':
    case 'diproses':
    case 'ready':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'cancelled':
    case 'dibatalkan':
    case 'canceled':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

// --- HELPER: GET STATUS ICON ---
const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case 'completed':
    case 'selesai':
    case 'paid':
    case 'dibayar':
    case 'confirmed':
      return <CheckCircle size={14} className="text-green-400" />;
    case 'pending':
    case 'menunggu':
    case 'waiting':
      return <TimeIcon size={14} className="text-yellow-400" />;
    case 'processing':
    case 'diproses':
    case 'ready':
      return <Package size={14} className="text-blue-400" />;
    case 'cancelled':
    case 'dibatalkan':
    case 'canceled':
      return <AlertTriangle size={14} className="text-red-400" />;
    default:
      return <Clock size={14} className="text-gray-400" />;
  }
};

// --- SUB-KOMPONEN: DASHBOARD SUMMARY ---
const DashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getDashboardSummary();
      
      if (response.data && response.data.success) {
        setSummary(response.data.data);
      } else {
        setError('Gagal memuat data dashboard');
      }
      
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError('Terjadi kesalahan saat memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-arjes-gold" size={40} />
          <span className="ml-3 text-lg">Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 bg-red-500/10 rounded-xl border border-red-500/30">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-center text-red-400 text-lg mb-2">{error}</p>
          <button 
            onClick={fetchDashboardSummary}
            className="mt-4 px-6 py-2.5 bg-arjes-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all group hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <ShoppingBag className="text-blue-400" size={24} />
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Total</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {summary?.summary?.total_orders || 0}
          </h3>
          <p className="text-gray-400 text-sm">Total Pesanan</p>
          <div className="mt-4 pt-4 border-t border-blue-500/10">
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Calendar size={12} />
              <span>{summary?.summary?.today_orders || 0} hari ini</span>
            </div>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all group hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <DollarSign className="text-green-400" size={24} />
            </div>
            <div className="text-right">
              <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Total</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {formatRp(summary?.summary?.total_spent || 0)}
          </h3>
          <p className="text-gray-400 text-sm">Total Pengeluaran</p>
          <div className="mt-4 pt-4 border-t border-green-500/10">
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle size={12} />
              <span>{summary?.summary?.pending_orders || 0} pending</span>
            </div>
          </div>
        </div>

        {/* Active Vouchers Card */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all group hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Ticket className="text-yellow-400" size={24} />
            </div>
            <div className="text-right">
              <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Aktif</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {summary?.summary?.active_vouchers || 0}
          </h3>
          <p className="text-gray-400 text-sm">Voucher Aktif</p>
          <div className="mt-4 pt-4 border-t border-yellow-500/10">
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <Star size={12} />
              <span>Lihat semua</span>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all group hover:scale-[1.02] duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Calendar className="text-purple-400" size={24} />
            </div>
            <div className="text-right">
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Akan Datang</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            {summary?.summary?.upcoming_bookings || 0}
          </h3>
          <p className="text-gray-400 text-sm">Booking Mendatang</p>
          <div className="mt-4 pt-4 border-t border-purple-500/10">
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <Bell size={12} />
              <span>Pengingat aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag size={20} />
              Pesanan Terbaru
            </h3>
            <Link to="/dashboard/orders" className="text-xs text-arjes-gold hover:text-yellow-400">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.recent_orders?.length > 0 ? (
              summary.recent_orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-arjes-gold font-bold">{formatRp(order.total)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">Belum ada pesanan</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Vouchers */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket size={20} />
              Voucher Aktif
            </h3>
            <Link to="/dashboard/vouchers" className="text-xs text-arjes-gold hover:text-yellow-400">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.active_vouchers_list?.length > 0 ? (
              summary.active_vouchers_list.map((voucher) => (
                <div key={voucher.id} className="p-3 bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-medium">{voucher.nama}</p>
                      <p className="text-xs text-gray-400">{voucher.kode}</p>
                    </div>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      {voucher.tipe_diskon === 'person' ? `${voucher.diskon_persen}%` : formatRp(voucher.diskon_nominal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Berlaku hingga: {formatDate(voucher.expired_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">Tidak ada voucher aktif</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Pickups */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin size={20} />
              Pickup Terbaru
            </h3>
            <Link to="/dashboard/pickups" className="text-xs text-arjes-gold hover:text-yellow-400">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.recent_pickups?.length > 0 ? (
              summary.recent_pickups.map((pickup) => (
                <div key={pickup.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-medium">{pickup.nama_penexima}</p>
                      <p className="text-xs text-gray-400">{pickup.catatan || 'Tanpa catatan'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pickup.status)}`}>
                      {pickup.status}
                    </span>
                  </div>
                  {pickup.order && (
                    <p className="text-xs text-arjes-gold">
                      Total: {formatRp(pickup.order.total)}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">Belum ada pickup</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-arjes-gold/10 via-transparent to-arjes-gold/5 border border-arjes-gold/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-arjes-gold mb-4 flex items-center gap-2">
          <Zap size={20} />
          Akses Cepat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link 
            to="/menu" 
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-arjes-gold/50 transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-arjes-gold/20 rounded-lg">
                <ShoppingBag className="text-arjes-gold" size={20} />
              </div>
              <div>
                <p className="text-white font-medium">Pesan Menu</p>
                <p className="text-xs text-gray-400">Order makanan & minuman</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/bookings" 
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-white font-medium">Booking Meja</p>
                <p className="text-xs text-gray-400">Reservasi dine-in</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/vouchers" 
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/50 transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Ticket className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-white font-medium">Voucher Saya</p>
                <p className="text-xs text-gray-400">Lihat semua voucher</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/profile" 
            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/50 transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-white font-medium">Profil Saya</p>
                <p className="text-xs text-gray-400">Kelola akun</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Tambahkan icon Zap jika belum ada
const Zap = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// (KEEP ALL EXISTING SUB-COMPONENTS: OrderDetailModal, OrderHistory, VoucherList, EditProfile)

// === MAIN USER DASHBOARD ===
const UserDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { clearCart } = useCart();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // Changed default to dashboard
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Jika user tidak ada (belum login), redirect ke login
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // --- LOGOUT DENGAN MEMBERSIHKAN KERANJANG ---
  const handleLogout = () => { 
    if(window.confirm('Apakah Anda yakin ingin keluar dari akun Anda?')) {
      logout();
      clearCart();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-arjes-bg">
        <Loader2 className="animate-spin text-arjes-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-arjes-bg text-arjes-text overflow-hidden font-sans selection:bg-arjes-gold selection:text-black">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR RESPONSIVE --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-[#0F1F18] to-black border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        <div className="p-8 flex items-center justify-between md:justify-start gap-3 mb-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-arjes-gold to-yellow-500 rounded-xl flex items-center justify-center text-arjes-bg font-bold shadow-lg">
                <Coffee size={24} />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-arjes-gold">Arjes User</h1>
                <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
              </div>
           </div>
           <button 
             onClick={() => setIsSidebarOpen(false)} 
             className="md:hidden text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
           >
             <X size={24} />
           </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Riwayat Pesanan', icon: ShoppingBag },
            { id: 'vouchers', label: 'Voucher Saya', icon: Ticket },
            { id: 'bookings', label: 'Booking Saya', icon: Calendar },
            { id: 'profile', label: 'Edit Profil', icon: Settings },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-arjes-gold/20 to-arjes-gold/10 text-arjes-gold border border-arjes-gold/30 font-bold shadow-lg' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:border hover:border-white/10'
              }`}
            >
              <item.icon size={18} /> 
              {item.label}
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-arjes-gold rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 mt-auto">
          <Link 
            to="/" 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-all hover:bg-white/5 group"
          >
            <Home size={18} /> 
            <span>Ke Menu Utama</span>
            <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium hover:text-red-300 group"
          >
            <LogOut size={18} /> 
            <span>Keluar</span>
            <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 overflow-y-auto h-full p-6 md:p-12 relative z-10 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        <div className="md:hidden flex items-center gap-4 mb-6">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <Menu size={24}/>
            </button>
            <h1 className="text-xl font-bold text-white">Dashboard Pengguna</h1>
        </div>

        <div className="mb-8 animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
              Halo, <span className="text-arjes-gold">{user.name.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Selamat datang kembali di dashboard Arjes Kitchen.
              {activeTab === 'dashboard' && ' Lihat statistik dan aktivitas terbaru.'}
              {activeTab === 'orders' && ' Lihat riwayat pesanan Anda.'}
              {activeTab === 'vouchers' && ' Kelola voucher yang tersedia.'}
              {activeTab === 'bookings' && ' Kelola booking meja Anda.'}
              {activeTab === 'profile' && ' Perbarui informasi profil Anda.'}
            </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && <DashboardSummary />}
            {activeTab === 'orders' && <OrderHistory />}
            {activeTab === 'vouchers' && <VoucherList />}
            {activeTab === 'bookings' && <BookingHistory />}
            {activeTab === 'profile' && <EditProfile user={user} />}
        </div>
      </main>
    </div>
  );
};

// Add BookingHistory component
const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const response = await dashboardAPI.getBookingHistory(params);
      
      if (response.data && response.data.success) {
        setBookings(response.data.data);
      } else {
        setError('Gagal memuat riwayat booking');
      }
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Terjadi kesalahan saat memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-arjes-gold" size={40} />
          <span className="ml-3 text-lg">Memuat riwayat booking...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-12 bg-red-500/10 rounded-xl border border-red-500/30">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-center text-red-400 text-lg mb-2">{error}</p>
          <button 
            onClick={fetchBookings}
            className="mt-4 px-6 py-2.5 bg-arjes-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Riwayat Booking Meja</h2>
      
      {/* Filter Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Status Booking</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Tanggal Mulai</label>
            <input 
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Tanggal Akhir</label>
            <input 
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setFilters({status: 'all', start_date: '', end_date: ''})}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <Calendar className="mx-auto text-white/20 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">Belum ada riwayat booking</h3>
          <p className="text-gray-500 mb-6">Anda belum pernah melakukan booking meja.</p>
          <Link to="/bookings" className="inline-flex items-center gap-2 px-6 py-3 bg-arjes-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
            <Calendar size={20} />
            Booking Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-arjes-gold/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(booking.status)} flex items-center gap-1`}>
                      {getStatusIcon(booking.status)}
                      {booking.status || 'Pending'}
                    </span>
                    
                    {booking.meja?.nomor && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                        Meja {booking.meja.nomor}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-white font-bold text-base mb-1">
                    Booking untuk {formatDate(booking.tanggal)}
                  </h3>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock size={12}/>
                      {booking.jam_mulai} - {booking.jam_selesai}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {booking.jumlah_orang} orang
                    </p>
                    {booking.meja?.tipe?.nama && (
                      <p className="text-gray-400 text-xs">
                        Tipe: {booking.meja.tipe.nama}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-400 text-xs">
                    {formatDate(booking.created_at)}
                  </p>
                  {booking.catatan && (
                    <p className="text-gray-400 text-xs mt-1 max-w-xs truncate">
                      Catatan: {booking.catatan}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <span className="text-xs text-yellow-400 animate-pulse">
                      Menunggu konfirmasi
                    </span>
                  )}
                  {booking.status === 'confirmed' && (
                    <span className="text-xs text-green-400">
                      Terkonfirmasi ✓
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {(booking.status === 'pending') && (
                    <button
                      onClick={() => {
                        if (window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
                          // Implement cancel booking
                          alert('Fitur pembatalan booking akan segera tersedia');
                        }
                      }}
                      className="text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;