import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VoucherAdminPage from './VoucherAdminPage';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Ticket, 
  Coffee, CheckCircle, XCircle, Users, Package,
  Eye, Store, Plus, Trash2, MapPin, 
  DollarSign, Calendar, LogOut, FileText, Upload, Filter, Menu, X, ArrowRight,
  Table, RefreshCw, Loader2, AlertCircle, TrendingUp, BarChart, Activity,
  ArrowUpRight, ArrowDownRight, CheckSquare, XSquare, Clock, ShoppingCart
} from 'lucide-react';
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
    case 'paid':
    case 'dibayar':
    case 'selesai':
    case 'completed':
    case 'ready':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending':
    case 'menunggu':
    case 'waiting':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'processing':
    case 'diproses':
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
    case 'paid':
    case 'dibayar':
    case 'selesai':
    case 'completed':
    case 'ready':
      return <CheckSquare size={14} className="text-green-400" />;
    case 'pending':
    case 'menunggu':
    case 'waiting':
      return <Clock size={14} className="text-yellow-400" />;
    case 'processing':
    case 'diproses':
      return <Package size={14} className="text-blue-400" />;
    case 'cancelled':
    case 'dibatalkan':
    case 'canceled':
      return <XSquare size={14} className="text-red-400" />;
    default:
      return <Clock size={14} className="text-gray-400" />;
  }
};

// --- KOMPONEN KARTU STATISTIK ---
const StatCard = ({ title, value, subtext, icon: Icon, color, trend, loading }) => (
  <div className="bg-[#0F1F18] border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden group shadow-xl transition-all hover:border-arjes-gold/30 hover:scale-[1.02]">
    {loading ? (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="animate-spin text-arjes-gold" size={24} />
      </div>
    ) : (
      <>
        <div className={`absolute -right-6 -top-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color} transform rotate-12`}>
          <Icon size={100} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Icon size={14}/> {title}
            </p>
            {trend && (
              <span className={`text-xs font-bold flex items-center gap-1 ${
                trend.value > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend.value > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          <h3 className={`text-2xl md:text-3xl font-serif font-bold ${color} mb-2`}>
            {value}
          </h3>
          <p className="text-gray-500 text-xs">{subtext}</p>
        </div>
      </>
    )}
  </div>
);

// --- MODAL DETAIL PESANAN ---
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  // Base URL untuk gambar (pastikan VITE_API_URL sudah di .env)
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl scale-100 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-arjes-gold/10">
          <div>
            <h3 className="font-bold text-white text-xl">Detail Pesanan</h3>
            <p className="text-xs text-gray-400 mt-1">
              Order ID: {order.order_number || order.id} • {formatDate(order.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Customer */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <Users size={16} />
              Informasi Customer
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Nama Customer</p>
                <p className="text-white">{order.user?.name || 'Guest'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white">{order.user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Metode Order</p>
                <p className="text-white capitalize">{order.jenis_order}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* === PICKUP INFO === */}
              {order.jenis_order === 'pickup' && (
                <>
                  <div className="md:col-span-2">
                    <hr className="border-white/10 my-3" />
                    <p className="text-xs text-gray-400">Informasi Pickup</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Nama Penerima</p>
                    <p className="text-white font-bold">{order.nama_penerima || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Catatan</p>
                    <p className="text-white italic">{order.catatan || 'Tidak ada catatan'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bukti Pembayaran */}
          {order.bukti_bayar && (
            <div className="mb-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Upload size={16} />
                Bukti Pembayaran
              </h4>
              <div className="flex flex-col items-center">
                <img 
                  src={`${baseUrl}/storage/payment-proofs${order.bukti_bayar}`} 
                  alt="Bukti Pembayaran"
                  className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20 mb-3"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gambar+Tidak+Ditemukan'}
                />
                <a 
                  href={`${baseUrl}/storage/payment-proofs${order.bukti_bayar}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-arjes-gold hover:underline flex items-center gap-1"
                >
                  <Eye size={14} /> Lihat gambar penuh
                </a>
              </div>
            </div>
          )}

          {/* Items Pesanan */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <ShoppingCart size={16} />
                Items Pesanan
              </h4>
              <div className="space-y-2">
                {order.order_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <div>
                      <p className="text-white">{item.menu?.nama || 'Item'}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty} × {formatRp(item.harga)}</p>
                    </div>
                    <p className="text-white font-bold">
                      {formatRp(item.qty * item.harga)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ringkasan Pembayaran */}
          <div className="p-4 bg-black/20 rounded-xl">
            <h4 className="text-white font-bold mb-3">Ringkasan Pembayaran</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">{formatRp(order.total)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Diskon Voucher</span>
                  <span className="text-green-400">-{formatRp(order.discount_amount)}</span>
                </div>
              )}
              {order.voucher && (
                <div className="flex justify-between text-gray-400">
                  <span>Kode Voucher</span>
                  <span className="text-yellow-400">{order.voucher.kode}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Total Bayar</span>
                  <span className="font-bold text-arjes-gold text-xl">
                    {formatRp(order.total - (order.discount_amount || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Booking */}
          {order.booking && (
            <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Informasi Booking
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Meja</p>
                  <p className="text-white">Meja {order.booking.meja?.nomor || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tanggal</p>
                  <p className="text-white">{formatDate(order.booking.tanggal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Waktu</p>
                  <p className="text-white">{order.booking.jam_mulai} - {order.booking.jam_selesai}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Jumlah Orang</p>
                  <p className="text-white">{order.booking.jumlah_orang} orang</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            Tutup
          </button>
          {(order.status === 'pending' || order.status === 'menunggu') && (
            <div className="flex gap-2">
              <button className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                <CheckCircle size={16} />
                Setujui
              </button>
              <button className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                <XCircle size={16} />
                Tolak
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === MAIN DASHBOARD ===
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeUsers: 0,
    todayRevenue: 0,
    todayOrders: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'orders') {
      fetchDashboardData();
    }
  }, [activeTab, timeFilter]);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    const ordersResponse = await apiClient.get('/orders');
    
    // 🔥 DETEKSI STRUKTUR & EKSTRAK ARRAY ORDER
    let rawOrders = [];

    // Kasus 1: respons langsung array → [ {...}, {...} ]
    if (Array.isArray(ordersResponse.data)) {
      rawOrders = ordersResponse.data;
    }
    // Kasus 2: respons { data: [...] }
    else if (ordersResponse.data && Array.isArray(ordersResponse.data.data)) {
      rawOrders = ordersResponse.data.data;
    }
    // Kasus 3: respons { data: { ... } } (single object)
    else if (ordersResponse.data && ordersResponse.data.data && typeof ordersResponse.data.data === 'object') {
      rawOrders = [ordersResponse.data.data];
    }
    // Kasus 4: fallback — coba cari di root
    else if (typeof ordersResponse.data === 'object' && ordersResponse.data !== null) {
      // Cari properti yang berisi array (misal: orders, data, result)
      const keys = Object.keys(ordersResponse.data);
      for (let key of keys) {
        if (Array.isArray(ordersResponse.data[key])) {
          rawOrders = ordersResponse.data[key];
          break;
        }
      }
    }

    console.log('✅ Extracted orders:', rawOrders); // Untuk debug

    // Normalisasi: inject pickup & rename items → order_items
    const normalizedOrders = rawOrders.map(order => {
      // Ambil pickup dari order.pickup (jika ada)
      const pickup = order.pickup || {};

      return {
        ...order,
        // 🔁 items → order_items
        order_items: order.items || order.order_items || [],
        // 👤 user
        user: order.user || null,
        // 🎟️ voucher
        voucher: order.voucher || null,
        // 🚚 pickup fields
        nama_penerima: pickup.nama_penerima || order.nama_penerima || null,
        catatan: pickup.catatan || order.catatan || null,
        pickup_status: pickup.status || order.pickup_status || null,
        // 📸 bukti bayar
        bukti_bayar: order.bukti_bayar || null,
      };
    });

    setOrders(normalizedOrders);
      
    // Hitung stats
    const totalRevenue = normalizedOrders
      .filter(o => ['paid', 'dibayar'].includes((o.status || '').toLowerCase()))
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    
    const pendingOrders = normalizedOrders
      .filter(o => ['pending', 'menunggu'].includes((o.status || '').toLowerCase())).length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayRevenue = normalizedOrders
      .filter(o => 
        ['paid', 'dibayar'].includes((o.status || '').toLowerCase()) && 
        o.created_at?.includes(today)
      )
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    
    const todayOrders = normalizedOrders
      .filter(o => o.created_at?.includes(today)).length;
    
    setStats({
      totalRevenue,
      totalOrders: normalizedOrders.length,
      pendingOrders,
      activeUsers: normalizedOrders.filter(o => o.user_id).length,
      todayRevenue,
      todayOrders
    });
  } catch (err) {
    console.error('❌ Error fetching dashboard data:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url
    });
    alert('Gagal memuat data pesanan. Silakan cek konsol untuk detail error.');
  } finally {
    setLoading(false);
  }
};

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await apiClient.put(`/orders/${orderId}/pay`);
      alert(`Order berhasil diupdate menjadi "paid"`);
      fetchDashboardData();
    } catch (err) {
      alert('Gagal mengupdate status order: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      try {
        await apiClient.put(`/orders/${orderId}/cancel`);
        alert('Pesanan berhasil dibatalkan');
        fetchDashboardData();
      } catch (err) {
        alert('Gagal membatalkan pesanan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleLogout = () => { 
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'orders') return true;
    if (activeTab === 'pending') return ['pending', 'menunggu'].includes(order.status?.toLowerCase());
    if (activeTab === 'completed') return ['paid', 'dibayar', 'selesai'].includes(order.status?.toLowerCase());
    return true;
  });

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
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Semua Pesanan', icon: ShoppingBag, count: stats.totalOrders },
            { id: 'pending', label: 'Pending', icon: Clock, count: stats.pendingOrders },
            { id: 'completed', label: 'Selesai', icon: CheckCircle },
            { id: 'menu', label: 'Daftar Menu', icon: Utensils },
            { id: 'vouchers', label: 'Kelola Voucher', icon: Ticket },
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
        
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 bg-[#0F1F18] border border-white/10 rounded-lg text-white shadow-lg"
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
              {activeTab === 'dashboard' && 'Dashboard Admin'}
              {activeTab === 'orders' && 'Semua Pesanan'}
              {activeTab === 'pending' && 'Pesanan Pending'}
              {activeTab === 'completed' && 'Pesanan Selesai'}
              {activeTab === 'menu' && 'Daftar Menu'}
              {activeTab === 'vouchers' && 'Kelola Voucher'}
            </h2>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            className="p-2 bg-[#0F1F18] border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                title="Total Pendapatan" 
                value={formatRp(stats.totalRevenue)}
                subtext="Sejak awal"
                icon={DollarSign}
                color="text-arjes-gold"
                loading={loading}
              />
              <StatCard 
                title="Total Pesanan" 
                value={stats.totalOrders}
                subtext={`${stats.todayOrders} hari ini`}
                icon={ShoppingBag}
                color="text-white"
                trend={{ value: 12 }}
                loading={loading}
              />
              <StatCard 
                title="Pesanan Pending" 
                value={stats.pendingOrders}
                subtext="Menunggu konfirmasi"
                icon={Clock}
                color="text-yellow-400"
                loading={loading}
              />
              <StatCard 
                title="User Aktif" 
                value={stats.activeUsers}
                subtext="User dengan pesanan"
                icon={Users}
                color="text-blue-400"
                loading={loading}
              />
              <StatCard 
                title="Pendapatan Hari Ini" 
                value={formatRp(stats.todayRevenue)}
                subtext={`Dari ${stats.todayOrders} pesanan`}
                icon={TrendingUp}
                color="text-green-400"
                loading={loading}
              />
              <StatCard 
                title="Rata-rata Pesanan" 
                value={stats.totalOrders > 0 ? formatRp(stats.totalRevenue / stats.totalOrders) : formatRp(0)}
                subtext="Per pesanan"
                icon={BarChart}
                color="text-purple-400"
                loading={loading}
              />
            </div>

            {/* Recent Orders */}
            <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={20} />
                  Pesanan Terbaru
                </h3>
                <Link to="/admin/orders" className="text-sm text-arjes-gold hover:text-yellow-400">
                  Lihat semua →
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/30 text-xs uppercase font-bold text-gray-500">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center">
                          <Loader2 className="animate-spin text-arjes-gold mx-auto" size={24} />
                        </td>
                      </tr>
                    ) : orders.slice(0, 5).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500">
                          <AlertCircle className="mx-auto mb-2" size={32} />
                          <p>Belum ada pesanan</p>
                        </td>
                      </tr>
                    ) : orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-white/5">
                        <td className="p-4 font-mono text-arjes-gold">#{order.id}</td>
                        <td className="p-4">
                          <p className="text-white font-medium">{order.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-400">{order.user?.email || '-'}</p>
                          
                          {order.jenis_order === 'pickup' && (
                            <>
                              {order.nama_penerima && (
                                <p className="text-xs text-blue-400 mt-1 font-medium">
                                  🚶 {order.nama_penerima}
                                </p>
                              )}
                              {order.catatan && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                  "{order.catatan}"
                                </p>
                              )}
                            </>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-white">{formatDate(order.created_at)}</p>
                          <p className="text-xs text-gray-400">{formatTime(order.created_at)}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-bold">{formatRp(order.total)}</p>
                          {order.discount_amount > 0 && (
                            <p className="text-xs text-green-400">-{formatRp(order.discount_amount)}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {order.bukti_bayar && (
                              <button
                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/storage/payment-proofs/${order.bukti_bayar}`, '_blank')}
                                className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                                title="Lihat bukti bayar"
                              >
                                <Upload size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'paid')}
                                  className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {(activeTab === 'orders' || activeTab === 'pending' || activeTab === 'completed') && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-[#0F1F18] border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Filter Status</label>
                  <select 
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                  >
                    <option value="orders">Semua Pesanan</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Jenis Order</label>
                  <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold">
                    <option value="all">Semua Jenis</option>
                    <option value="dine_in">Dine In</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Tanggal</label>
                  <input 
                    type="date"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[1000px] md:min-w-0">
                  <thead className="bg-black/30 text-xs uppercase font-bold text-gray-500">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Jenis</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center">
                          <Loader2 className="animate-spin text-arjes-gold mx-auto" size={24} />
                          <p className="text-gray-400 mt-2">Memuat data pesanan...</p>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-500">
                          <AlertCircle className="mx-auto mb-2" size={32} />
                          <p>Tidak ada pesanan yang ditemukan</p>
                        </td>
                      </tr>
                    ) : filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5">
                        <td className="p-4 font-mono text-arjes-gold">#{order.id}</td>
                        <td className="p-4">
                          <p className="text-white font-medium">{order.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-400">{order.user?.email || '-'}</p>
                          
                          {order.jenis_order === 'pickup' && (
                            <>
                              {order.nama_penerima && (
                                <p className="text-xs text-blue-400 mt-1 font-medium">
                                  🚶 {order.nama_penerima}
                                </p>
                              )}
                              {order.catatan && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                  "{order.catatan}"
                                </p>
                              )}
                            </>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-white">{formatDate(order.created_at)}</p>
                          <p className="text-xs text-gray-400">{formatTime(order.created_at)}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.jenis_order === 'pickup' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {order.jenis_order === 'pickup' ? 'Pickup' : 'Dine In'}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-white font-bold">{formatRp(order.total)}</p>
                          {order.discount_amount > 0 && (
                            <p className="text-xs text-green-400">-{formatRp(order.discount_amount)}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {order.bukti_bayar && (
                              <button
                                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/storage/payment-proofs/${order.bukti_bayar}`, '_blank')}
                                className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                                title="Lihat bukti bayar"
                              >
                                <Upload size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                            >
                              <Eye size={14} /> Detail
                            </button>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'paid')}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircle size={14} /> Setujui
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                >
                                  <XCircle size={14} /> Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB LAINNYA (menu, vouchers) tetap sama */}
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

        {activeTab === 'vouchers' && <VoucherAdminPage />}

        {/* Modal */}
        {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </main>
    </div>
  );
};

export default AdminDashboard;