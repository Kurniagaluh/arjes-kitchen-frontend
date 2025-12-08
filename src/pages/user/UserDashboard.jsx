import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // 1. IMPORT CART CONTEXT UNTUK CLEAR CART
import { 
  Coffee, LayoutDashboard, Ticket, LogOut, Home, ChevronRight, 
  Settings, Save, Lock, X, ShoppingBag, Calendar, Menu
} from 'lucide-react';

// --- HELPER FORMAT RUPIAH ---
const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// --- SUB-KOMPONEN: MODAL DETAIL ORDER ---
const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F1F18] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transform scale-100">
        
        <div className="bg-arjes-gold/10 p-6 flex justify-between items-start border-b border-white/5">
          <div>
            <h3 className="text-arjes-gold font-bold text-xl">Detail Pesanan</h3>
            <p className="text-xs text-gray-400 mt-1">Order ID: {order.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
            <span className="text-sm text-gray-400">Status</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              order.status === 'Selesai' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
              order.status === 'Menunggu Verifikasi' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              {order.status}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-white border-b border-white/10 pb-2">Item Dipesan</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt="img" className="w-full h-full object-cover"/>
                   </div>
                   <div>
                      <p className="text-white font-medium">
                        {item.name} 
                        {item.category === 'reservation' && <span className="text-[10px] text-blue-400 ml-1">(Booking)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{item.qty} x {formatRp(item.price)}</p>
                   </div>
                </div>
                <span className="text-white font-medium">{formatRp(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="bg-black/20 p-4 rounded-xl space-y-2 text-sm mt-4">
             <div className="flex justify-between text-gray-400">
                <span>Tanggal</span>
                <span className="text-white">{order.date} • {order.time}</span>
             </div>
             <div className="flex justify-between text-gray-400">
                <span>Metode</span>
                <span className="text-white uppercase">{order.method}</span>
             </div>
             <div className="border-t border-white/10 my-2 pt-2 flex justify-between items-center">
                <span className="font-bold text-white">Total Bayar</span>
                <span className="font-bold text-arjes-gold text-lg">{formatRp(order.total)}</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};


// --- SUB-KOMPONEN: RIWAYAT PESANAN ---
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem('arjes_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Riwayat Pesanan</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
          <ShoppingBag size={40} className="mx-auto text-gray-600 mb-3"/>
          <p className="text-gray-400">Belum ada riwayat pesanan.</p>
          <Link to="/menu" className="text-arjes-gold font-bold hover:underline mt-2 inline-block">Pesan Sekarang</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-arjes-gold/50 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                   order.status === 'Selesai' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {order.status}
                </span>
                <h3 className="text-white font-bold text-base mt-2 line-clamp-1">
                   {order.items[0].name} 
                   {order.items.length > 1 && <span className="text-xs text-gray-500 font-normal ml-1">+{order.items.length - 1} lainnya</span>}
                </h3>
                <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                   <Calendar size={12}/> {order.date} • {order.time}
                </p>
              </div>
              <span className="text-arjes-gold font-bold text-lg">{formatRp(order.total)}</span>
            </div>
            
            <div className="border-t border-white/10 pt-3 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono">ID: {order.id.slice(-6)}</span>
              <span className="text-xs text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-arjes-gold hover:text-black transition-colors flex items-center gap-1">
                Detail <ChevronRight size={12} />
              </span>
            </div>
          </div>
        ))
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

// --- SUB-KOMPONEN LAINNYA ---
const VoucherList = () => (
  <div>
    <h2 className="text-2xl font-serif font-bold text-white mb-6">Voucher Saya</h2>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-gradient-to-r from-arjes-gold to-yellow-600 rounded-xl p-5 text-arjes-bg relative overflow-hidden shadow-lg">
        <div className="absolute -right-4 -top-4 bg-white/20 w-24 h-24 rounded-full blur-2xl"></div>
        <h3 className="font-bold text-xl mb-1">Diskon 20%</h3>
        <p className="text-sm opacity-80 mb-4">Khusus pengguna baru Arjes Kitchen.</p>
        <div className="bg-arjes-bg/90 text-arjes-gold px-4 py-2 rounded-lg font-mono font-bold text-center border-2 border-dashed border-arjes-gold/50 cursor-pointer hover:bg-arjes-bg transition-colors"
             onClick={() => {navigator.clipboard.writeText('ARJES20'); alert('Kode disalin!');}}>
          ARJES20
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-white">
        <h3 className="font-bold text-xl mb-1">Gratis Booking</h3>
        <p className="text-gray-400 text-sm mb-4">Min. order 25rb (Regular) / 50rb (VIP).</p>
        <div className="bg-black/30 px-4 py-2 rounded-lg text-center text-sm text-gray-400 font-bold border border-white/5">Otomatis Dipakai</div>
      </div>
    </div>
  </div>
);

const EditProfile = ({ user }) => {
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSave = (e) => { e.preventDefault(); alert("Profil berhasil diperbarui! (Simulasi)"); };

  return (
    <div>
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Edit Profil</h2>
      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-arjes-gold rounded-full flex items-center justify-center text-arjes-bg font-bold text-2xl border-4 border-white/5">{user?.name?.charAt(0).toUpperCase()}</div>
          <div><p className="text-white font-bold text-lg">{user?.name}</p><p className="text-xs text-gray-500">Member Sejak 2024</p></div>
        </div>
        <div><label className="block text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Nama Lengkap</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold transition-colors"/></div>
        <div><label className="block text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold opacity-50 cursor-not-allowed" readOnly /></div>
        <div className="pt-4 border-t border-white/10"><h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm"><Lock size={16}/> Ganti Password</h3><div className="grid md:grid-cols-2 gap-4"><div><label className="block text-xs text-gray-400 mb-2">Password Baru</label><input type="password" name="password" placeholder="Kosongkan jika tidak diganti" onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"/></div><div><label className="block text-xs text-gray-400 mb-2">Ulangi Password</label><input type="password" name="confirmPassword" placeholder="Konfirmasi password baru" onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"/></div></div></div>
        <button className="w-full md:w-auto bg-arjes-gold text-arjes-bg px-8 py-3 rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"><Save size={18} /> Simpan Perubahan</button>
      </form>
    </div>
  );
};

// === MAIN USER DASHBOARD ===
const UserDashboard = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart(); // 2. AMBIL FUNGSI CLEAR CART
  const [activeTab, setActiveTab] = useState('orders'); 
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); } else { setUser(JSON.parse(userData)); }
  }, [navigate]);

  // --- 3. LOGOUT DENGAN MEMBERSIHKAN KERANJANG ---
  const handleLogout = () => { 
    if(window.confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('token'); 
      localStorage.removeItem('user'); 
      clearCart(); // Kosongkan Keranjang
      navigate('/'); // Redirect ke Home
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-arjes-bg text-arjes-text overflow-hidden font-sans selection:bg-arjes-gold selection:text-black">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR RESPONSIVE --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#0F1F18] border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        <div className="p-8 flex items-center justify-between md:justify-start gap-3 mb-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-arjes-gold rounded-xl flex items-center justify-center text-arjes-bg font-bold shadow-lg"><Coffee size={24} /></div>
              <h1 className="text-xl font-serif font-bold text-arjes-gold">Arjes User</h1>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'orders', label: 'Riwayat', icon: LayoutDashboard },
            { id: 'vouchers', label: 'Voucher', icon: Ticket },
            { id: 'profile', label: 'Edit Profil', icon: Settings },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${
                activeTab === item.id ? 'bg-arjes-gold text-arjes-bg font-bold shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 mt-auto">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-all hover:bg-white/5"><Home size={18} /> Ke Menu Utama</Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium"><LogOut size={18} /> Keluar</button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 overflow-y-auto h-full p-6 md:p-12 relative z-10 scroll-smooth">
        
        <div className="md:hidden flex items-center gap-4 mb-6">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg text-white"><Menu size={24}/></button>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
        </div>

        <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">Halo, {user.name.split(' ')[0]}! 👋</h1>
            <p className="text-gray-400 text-sm">Selamat datang kembali di Arjes Kitchen.</p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'orders' && <OrderHistory />}
            {activeTab === 'vouchers' && <VoucherList />}
            {activeTab === 'profile' && <EditProfile user={user} />}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;