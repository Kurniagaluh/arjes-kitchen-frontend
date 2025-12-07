import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Utensils, Ticket, 
  Coffee, CheckCircle, XCircle, 
  Eye, Store, Plus, Trash2, Edit2, MapPin, 
  TrendingUp, Users, DollarSign, Calendar, LogOut, FileText, Upload, ChevronDown, Filter, Menu, X
} from 'lucide-react';

// --- HELPER FORMAT RUPIAH ---
const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// --- KOMPONEN KARTU STATISTIK (REVENUE) - RESPONSIVE ---
const RevenueCard = ({ title, value, subtext, color }) => (
  <div className="bg-[#0F1F18] border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden group shadow-xl transition-all hover:border-arjes-gold/30">
    <div className={`absolute -right-6 -top-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color} transform rotate-12`}>
        <DollarSign size={100} md:size={120} />
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

// --- 1. MODAL BUKTI TRANSFER (RESPONSIVE) ---
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

// --- 2. MODAL TAMBAH MENU (UPLOAD FILE) - RESPONSIVE ---
const AddMenuModal = ({ onClose, onSave }) => {
    const [newItem, setNewItem] = useState({ name: '', price: '', category: 'food', desc: '', image: null, preview: '' });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setNewItem({ ...newItem, image: file, preview: previewUrl });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalImage = newItem.preview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80';
        onSave({ ...newItem, id: Date.now(), price: Number(newItem.price), image: finalImage, active: true });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#0F1F18] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Tambah Menu</h3>
                    <button onClick={onClose}><XCircle size={24} className="text-gray-400 hover:text-white transition-colors"/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-arjes-gold transition-colors" placeholder="Nama Menu" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                    
                    <textarea className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-arjes-gold transition-colors text-sm" placeholder="Deskripsi singkat..." rows="2" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} required />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-arjes-gold transition-colors" placeholder="Harga (Rp)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                        <select className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none cursor-pointer" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                            <option value="food">Makanan</option>
                            <option value="coffee">Coffee</option>
                            <option value="snack">Snack</option>
                        </select>
                    </div>

                    {/* INPUT FILE UPLOAD */}
                    <div className="border border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:bg-white/5 relative group transition-all">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {newItem.preview ? (
                            <img src={newItem.preview} alt="Preview" className="h-24 w-full object-cover rounded-lg mx-auto" />
                        ) : (
                            <div className="text-gray-400 text-xs flex flex-col items-center group-hover:text-arjes-gold transition-colors">
                                <Upload size={24} className="mb-2" />
                                <span>Klik untuk Upload Gambar</span>
                            </div>
                        )}
                    </div>

                    <button className="w-full bg-arjes-gold text-arjes-bg font-bold py-3.5 rounded-xl mt-4 hover:bg-white transition-all shadow-lg shadow-arjes-gold/20">Simpan Menu</button>
                </form>
            </div>
        </div>
    );
};

// === MAIN DASHBOARD ===
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk Sidebar Mobile
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Kopi Susu Gula Aren', desc: 'Espresso blend dengan gula aren asli.', price: 18000, category: 'coffee', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80', active: true },
    { id: 2, name: 'Nasi Goreng Arjes', desc: 'Nasi goreng spesial dengan topping sate.', price: 25000, category: 'food', image: 'https://images.unsplash.com/photo-1603133872878-684f57143b34?w=500&q=80', active: true },
  ]);
  const [tables, setTables] = useState([
    { id: 'T1', type: 'Reguler', status: 'available' }, { id: 'T2', type: 'Reguler', status: 'occupied' },  
    { id: 'T3', type: 'VIP', status: 'booked' }, { id: 'T4', type: 'Reguler', status: 'available' },
    { id: 'T5', type: 'VIP', status: 'available' }, { id: 'T6', type: 'Reguler', status: 'available' },
    { id: 'T7', type: 'Reguler', status: 'available' }, { id: 'T8', type: 'VIP', status: 'booked' },
  ]);
  const [vouchers, setVouchers] = useState([{ id: 1, code: 'ARJES20', type: 'percentage', value: 20, minSpend: 50000 }]);

  // Filter State (Pendapatan)
  const [revenueFilter, setRevenueFilter] = useState('today');

  // Modal States
  const [selectedProof, setSelectedProof] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newVoucher, setNewVoucher] = useState({ code: '', type: 'percentage', value: '', minSpend: '' });

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

  const updateTableStatus = (id, status) => {
    setTables(tables.map(t => t.id === id ? { ...t, status: status } : t));
  };

  const deleteMenu = (id) => { if(confirm('Hapus menu ini?')) setMenuItems(menuItems.filter(m => m.id !== id)); };
  const addMenu = (item) => { setMenuItems([...menuItems, item]); setShowAddMenu(false); };
  
  const addVoucher = (e) => {
    e.preventDefault();
    if (!newVoucher.code || !newVoucher.value) return;
    const voucherData = { id: Date.now(), code: newVoucher.code.toUpperCase(), type: newVoucher.type, value: Number(newVoucher.value), minSpend: Number(newVoucher.minSpend) || 0 };
    setVouchers([...vouchers, voucherData]);
    setNewVoucher({ code: '', type: 'percentage', value: '', minSpend: '' });
  };
  const deleteVoucher = (id) => { if(confirm('Hapus voucher?')) setVouchers(vouchers.filter(v => v.id !== id)); };

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
      let filtered = finished;
      let label = "";
      if (revenueFilter === 'today') label = "Hari Ini";
      else if (revenueFilter === 'week') label = "Minggu Ini";
      else if (revenueFilter === 'month') label = "Bulan Ini";
      else if (revenueFilter === 'year') label = "Tahun Ini";
      else label = "Total Keseluruhan";

      const baseTotal = filtered.reduce((acc, curr) => acc + (curr.total || 0), 0);
      // Simulasi angka berbeda tiap filter agar terlihat bedanya saat demo
      const total = revenueFilter === 'today' ? baseTotal : 
                    revenueFilter === 'week' ? baseTotal * 7 : 
                    revenueFilter === 'month' ? baseTotal * 30 : 
                    revenueFilter === 'year' ? baseTotal * 365 : baseTotal * 500;
      
      const count = revenueFilter === 'today' ? filtered.length : filtered.length * 5; 
      return { total, count, label };
  };

  const revenueData = getFilteredRevenue();
  const pendingCount = orders.filter(o => o.status === 'Menunggu Verifikasi' || o.status === 'Menunggu Pembayaran').length;

  // --- LOGOUT FIXED: KE HOME ---
  const handleLogout = () => { 
      localStorage.removeItem('token'); 
      localStorage.removeItem('user'); 
      navigate('/'); // <--- UBAH KE HOME
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

      {/* --- SIDEBAR ADMIN RESPONSIVE --- */}
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
             <h1 className="text-xl font-serif font-bold text-white tracking-wide">Arjes Admin</h1>
          </div>
          {/* Tombol Close di HP */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'orders', label: 'Pesanan Masuk', icon: ShoppingBag, count: pendingCount },
            { id: 'revenue', label: 'Pendapatan', icon: FileText },
            { id: 'tables', label: 'Status Meja', icon: MapPin },
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
        </nav>

        <div className="p-6 border-t border-white/5 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative z-10 scroll-smooth">
        
        {/* HEADER RESPONSIVE (ADA HAMBURGER) */}
        <div className="mb-8 flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="md:hidden p-2 bg-[#0F1F18] border border-white/10 rounded-lg text-white shadow-lg"
            >
                <Menu size={24} />
            </button>
            
            {/* Hanya Tampilkan Judul jika BUKAN tab Revenue (karena Revenue punya header khusus) */}
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
                {/* Wrapper agar tabel bisa discroll di HP */}
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

        {/* --- 2. TAB PENDAPATAN (DROPDOWN + DATE INFO) --- */}
        {activeTab === 'revenue' && (
            <div className="space-y-6 animate-in fade-in">
                
                {/* HEADER PENDAPATAN KHUSUS */}
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">Laporan Pendapatan</h2>
                    
                    {/* CONTROLS RESPONSIVE */}
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
                        
                        {/* KETERANGAN TANGGAL */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl text-sm border border-white/5 w-full sm:w-auto">
                            <Calendar size={16} className="text-arjes-gold" />
                            <span className="text-gray-300 font-medium">{getDateRangeLabel(revenueFilter)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RevenueCard 
                        title={`Pendapatan (${revenueData.label})`} 
                        value={formatRp(revenueData.total)} 
                        color="green" 
                        subtext="Akumulasi total pesanan selesai."
                    />
                     <RevenueCard 
                        title={`Transaksi (${revenueData.label})`} 
                        value={`${revenueData.count} Order`} 
                        color="white" 
                        subtext="Jumlah transaksi berhasil."
                    />
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

        {/* --- 3. TAB MANAJEMEN MEJA (LIST + DROPDOWN) --- */}
        {activeTab === 'tables' && (
            <div className="animate-in fade-in">
                <div className="bg-[#0F1F18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10"><h3 className="font-bold text-white">Daftar Status Meja</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px] md:min-w-0">
                            <thead className="bg-black/30 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                <tr><th className="px-6 py-5">Nomor Meja</th><th className="px-6 py-5">Tipe</th><th className="px-6 py-5">Status Saat Ini (Ubah Disini)</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                {tables.map(table => (
                                    <tr key={table.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="text-xl font-serif font-bold text-white">{table.id}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs uppercase font-bold tracking-widest opacity-70 border border-white/20 px-2 py-1 rounded">{table.type}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="relative w-fit">
                                                <select 
                                                    value={table.status} 
                                                    onChange={(e) => updateTableStatus(table.id, e.target.value)}
                                                    className={`
                                                        pl-3 pr-8 py-2 rounded-lg text-xs font-bold outline-none cursor-pointer border border-white/10 appearance-none transition-all
                                                        ${table.status === 'available' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                                          table.status === 'occupied' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}
                                                    `}
                                                >
                                                    <option value="available" className="bg-[#0F1F18] text-green-400">🟢 Kosong (Available)</option>
                                                    <option value="occupied" className="bg-[#0F1F18] text-red-400">🔴 Makan (Occupied)</option>
                                                    <option value="booked" className="bg-[#0F1F18] text-yellow-400">🟡 Booked (Reserved)</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-2 top-2.5 pointer-events-none opacity-70" />
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

        {/* --- 4. TAB MANAJEMEN MENU --- */}
        {activeTab === 'menu' && (
            <div className="space-y-8 animate-in fade-in">
                <button onClick={() => setShowAddMenu(true)} className="w-full md:w-auto bg-arjes-gold text-arjes-bg px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg"><Plus size={18}/> Tambah Menu Baru</button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map(item => (
                        <div key={item.id} className="bg-[#0F1F18] border border-white/10 p-4 rounded-3xl flex gap-4 group hover:border-arjes-gold/50 transition-all shadow-lg">
                            <div className="w-24 h-24 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-lg leading-tight truncate">{item.name}</h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.desc}</p>
                                <p className="text-arjes-gold font-mono mt-2 font-bold">{formatRp(item.price)}</p>
                            </div>
                            <button onClick={() => deleteMenu(item.id)} className="self-start text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
                {showAddMenu && <AddMenuModal onClose={() => setShowAddMenu(false)} onSave={addMenu} />}
            </div>
        )}

        {/* --- 5. TAB PROMO VOUCHER --- */}
        {activeTab === 'vouchers' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="bg-[#0F1F18] p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl">
                    <h3 className="font-bold text-white mb-6 text-xl">Buat Voucher Baru</h3>
                    <form onSubmit={addVoucher} className="grid gap-6 md:grid-cols-5 items-end">
                        <div className="col-span-1"><label className="text-xs text-gray-400 mb-2 block font-bold">KODE</label><input type="text" className="bg-black/30 p-3 rounded-xl text-white border border-white/10 w-full outline-none focus:border-arjes-gold uppercase" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} required placeholder="MABA25" /></div>
                        <div className="col-span-1"><label className="text-xs text-gray-400 mb-2 block font-bold">TIPE</label><select className="bg-black/30 p-3 rounded-xl text-white border border-white/10 w-full outline-none" value={newVoucher.type} onChange={e => setNewVoucher({...newVoucher, type: e.target.value})}><option value="percentage">Diskon %</option><option value="fixed">Potongan Rp</option></select></div>
                        <div className="col-span-1"><label className="text-xs text-gray-400 mb-2 block font-bold">NILAI</label><input type="number" className="bg-black/30 p-3 rounded-xl text-white border border-white/10 w-full outline-none focus:border-arjes-gold" value={newVoucher.value} onChange={e => setNewVoucher({...newVoucher, value: e.target.value})} required placeholder="10" /></div>
                        <div className="col-span-1"><label className="text-xs text-gray-400 mb-2 block font-bold">MIN BELANJA</label><input type="number" className="bg-black/30 p-3 rounded-xl text-white border border-white/10 w-full outline-none focus:border-arjes-gold" value={newVoucher.minSpend} onChange={e => setNewVoucher({...newVoucher, minSpend: e.target.value})} required placeholder="50000" /></div>
                        <div className="col-span-1"><button className="bg-arjes-gold text-arjes-bg font-bold p-3 rounded-xl w-full hover:bg-white transition-all">Simpan</button></div>
                    </form>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vouchers.map(v => (
                        <div key={v.id} className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-6 rounded-3xl flex justify-between items-center shadow-lg">
                            <div>
                                <h4 className="text-arjes-gold font-mono font-bold text-3xl tracking-wider">{v.code}</h4>
                                <p className="text-white text-sm mt-1">{v.type === 'percentage' ? `Diskon ${v.value}%` : `Potongan ${formatRp(v.value)}`}</p>
                                <p className="text-xs text-gray-500 mt-2">Min. Belanja: {formatRp(v.minSpend)}</p>
                            </div>
                            <button onClick={() => deleteVoucher(v.id)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;