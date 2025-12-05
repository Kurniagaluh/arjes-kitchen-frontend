import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Calendar, Ticket, 
  Utensils, CheckCircle, XCircle, Clock, Search, 
  Plus, Trash2, DollarSign, Users, Coffee
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // --- 1. DATA DUMMY PESANAN (ORDERS) ---
  const [orders, setOrders] = useState([
    { id: 'ORD-001', customer: 'Budi Santoso', type: 'Dine In', table: '12', total: 150000, status: 'Pending', time: '10:30' },
    { id: 'ORD-002', customer: 'Siti Aminah', type: 'Pickup', pickupTime: '13:00', total: 75000, status: 'Paid', time: '10:45' },
    { id: 'ORD-003', customer: 'Joko Anwar', type: 'Dine In', table: '05', total: 230000, status: 'Cancelled', time: '11:00' },
  ]);

  // --- 2. DATA DUMMY BOOKING (RESERVASI) ---
  const [bookings, setBookings] = useState([
    { id: 'BKG-001', customer: 'Dewi Lestari', date: '2024-12-20', time: '19:00', pax: 4, type: 'VIP', dp: 100000, status: 'Pending' },
    { id: 'BKG-002', customer: 'Rahmat', date: '2024-12-21', time: '18:00', pax: 2, type: 'Regular', dp: 50000, status: 'Confirmed' },
  ]);

  // --- 3. DATA DUMMY VOUCHER ---
  const [vouchers, setVouchers] = useState([
    { id: 1, code: 'ARJES20', discount: '20%', desc: 'Diskon Opening' },
    { id: 2, code: 'PICKUPHEMAT', discount: '15.000', desc: 'Khusus Pickup' },
  ]);

  // --- 4. LOGIC / FUNGSI AKSI ---

  // Verifikasi Pembayaran Pesanan
  const verifyPayment = (id) => {
    if (window.confirm('Pastikan mutasi uang sudah masuk. Ubah status jadi Lunas?')) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'Paid' } : o));
    }
  };

  const cancelOrder = (id) => {
    if (window.confirm('Batalkan pesanan ini?')) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
    }
  };

  // Verifikasi Booking
  const approveBooking = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
  };

  const rejectBooking = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Rejected' } : b));
  };

  // Tambah Voucher Baru
  const [newVoucher, setNewVoucher] = useState({ code: '', discount: '', desc: '' });
  const handleAddVoucher = (e) => {
    e.preventDefault();
    const id = vouchers.length + 1;
    setVouchers([...vouchers, { id, ...newVoucher }]);
    setNewVoucher({ code: '', discount: '', desc: '' });
    alert('Voucher berhasil ditambahkan!');
  };

  const deleteVoucher = (id) => {
    setVouchers(vouchers.filter(v => v.id !== id));
  };

  // --- RENDER COMPONENT PER TAB ---

  // TAB 1: KELOLA PESANAN
  const RenderOrders = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-arjes-gold mb-4 flex items-center gap-2">
        <ShoppingBag /> Daftar Pesanan Masuk
      </h2>
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-black/20 text-arjes-gold uppercase font-bold">
            <tr>
              <th className="p-4">ID Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Tipe & Detail</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status Pembayaran</th>
              <th className="p-4 text-center">Aksi (Verifikasi)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-white">{order.id}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{order.customer}</div>
                  <div className="text-xs">{order.time}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.type === 'Pickup' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {order.type}
                  </span>
                  <div className="mt-1 text-xs">
                    {order.type === 'Pickup' ? `Ambil jam: ${order.pickupTime}` : `Meja No: ${order.table}`}
                  </div>
                </td>
                <td className="p-4 text-white font-bold">
                  Rp {order.total.toLocaleString('id-ID')}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${order.status === 'Paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                      'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {order.status === 'Paid' ? 'Lunas / Terverifikasi' : order.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  {order.status === 'Pending' && (
                    <>
                      <button onClick={() => verifyPayment(order.id)} title="Verifikasi Lunas" className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors">
                        <CheckCircle size={18} />
                      </button>
                      <button onClick={() => cancelOrder(order.id)} title="Batalkan Pesanan" className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-colors">
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  {order.status === 'Paid' && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14}/> Selesai</span>}
                  {order.status === 'Cancelled' && <span className="text-red-500">Dibatalkan</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // TAB 2: KELOLA BOOKING
  const RenderBookings = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-arjes-gold flex items-center gap-2">
            <Calendar /> Reservasi Meja
          </h2>
          <p className="text-sm text-gray-400 mt-1">Verifikasi pembayaran DP & ketersediaan meja.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-black/20 text-arjes-gold uppercase font-bold">
            <tr>
              <th className="p-4">ID Booking</th>
              <th className="p-4">Customer & Waktu</th>
              <th className="p-4">Tipe Meja</th>
              <th className="p-4">Biaya Booking (DP)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-white">{booking.id}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{booking.customer}</div>
                  <div className="text-xs flex items-center gap-1 mt-1">
                    <Clock size={12}/> {booking.date} | {booking.time}
                  </div>
                  <div className="text-xs mt-1 text-gray-500">{booking.pax} Orang</div>
                </td>
                <td className="p-4">
                  {booking.type === 'VIP' ? (
                    <div className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-2 py-1 rounded text-xs inline-block">
                      👑 VIP (Non-Smoking/View)
                    </div>
                  ) : (
                    <div className="bg-gray-500/20 border border-gray-500/50 text-gray-300 px-2 py-1 rounded text-xs inline-block">
                      Regular
                    </div>
                  )}
                </td>
                <td className="p-4 text-white font-bold">
                  Rp {booking.dp.toLocaleString('id-ID')}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'Confirmed' ? 'text-green-400' : booking.status === 'Rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  {booking.status === 'Pending' && (
                    <>
                      <button onClick={() => approveBooking(booking.id)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">
                        Terima
                      </button>
                      <button onClick={() => rejectBooking(booking.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">
                        Tolak
                      </button>
                    </>
                  )}
                  {booking.status !== 'Pending' && <span className="text-xs text-gray-500">Selesai</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // TAB 3: KELOLA VOUCHER
  const RenderVouchers = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
      {/* Kolom Kiri: Form Tambah */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
        <h3 className="text-xl font-bold text-arjes-gold mb-4 flex items-center gap-2">
          <Plus size={20} /> Buat Voucher
        </h3>
        <form onSubmit={handleAddVoucher} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Kode Voucher (Unik)</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white uppercase focus:border-arjes-gold outline-none"
              placeholder="CONTOH: MERDEKA45"
              value={newVoucher.code}
              onChange={(e) => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nilai Diskon</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:border-arjes-gold outline-none"
              placeholder="Contoh: 20% atau 15.000"
              value={newVoucher.discount}
              onChange={(e) => setNewVoucher({...newVoucher, discount: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Deskripsi Singkat</label>
            <textarea 
              required
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:border-arjes-gold outline-none"
              placeholder="Keterangan voucher..."
              value={newVoucher.desc}
              onChange={(e) => setNewVoucher({...newVoucher, desc: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-arjes-gold text-black font-bold py-2 rounded-lg hover:bg-yellow-500 transition-colors">
            Simpan Voucher
          </button>
        </form>
      </div>

      {/* Kolom Kanan: List Voucher */}
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">Voucher Aktif</h3>
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-arjes-gold/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-arjes-gold/10 rounded-full flex items-center justify-center text-arjes-gold">
                <Ticket size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">{voucher.code}</h4>
                <p className="text-sm text-gray-400">{voucher.desc}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <span className="bg-white/10 px-3 py-1 rounded text-sm font-bold text-arjes-gold">
                {voucher.discount}
              </span>
              <button 
                onClick={() => deleteVoucher(voucher.id)}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                title="Hapus Voucher"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-arjes-bg text-white flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR ADMIN */}
      <aside className="w-full md:w-64 bg-black/30 border-r border-white/5 p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-10 text-arjes-gold">
          <LayoutDashboard size={28} />
          <span className="font-serif font-bold text-xl">Arjes Admin</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <ShoppingBag size={18} /> Kelola Pesanan
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                {orders.filter(o => o.status === 'Pending').length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('bookings')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Calendar size={18} /> Kelola Booking
             {bookings.filter(b => b.status === 'Pending').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {bookings.filter(b => b.status === 'Pending').length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('vouchers')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'vouchers' ? 'bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Ticket size={18} /> Voucher & Promo
          </button>

          <button 
             onClick={() => setActiveTab('tables')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'tables' ? 'bg-arjes-gold text-arjes-bg shadow-lg shadow-arjes-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
             <Utensils size={18} /> Manajemen Meja
          </button>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-arjes-gold rounded-full flex items-center justify-center text-black font-bold text-xs">A</div>
            <div>
              <p className="text-sm font-bold">Admin Arjes</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-white">
            {activeTab === 'orders' && 'Pesanan Masuk'}
            {activeTab === 'bookings' && 'Reservasi Meja'}
            {activeTab === 'vouchers' && 'Kode Promo'}
            {activeTab === 'tables' && 'Daftar Meja'}
          </h1>
          <div className="bg-black/30 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
             <Search size={16} />
             <input type="text" placeholder="Cari data..." className="bg-transparent outline-none w-40 md:w-64" />
          </div>
        </header>

        {activeTab === 'orders' && <RenderOrders />}
        {activeTab === 'bookings' && <RenderBookings />}
        {activeTab === 'vouchers' && <RenderVouchers />}
        
        {activeTab === 'tables' && (
           <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
              <Utensils size={48} className="mx-auto text-arjes-gold mb-4 opacity-50" />
              <h3 className="text-xl font-bold">Manajemen Meja</h3>
              <p className="text-gray-400 max-w-md mx-auto mt-2">
                Halaman ini untuk mengatur jumlah meja VIP (Non-smoking/View) dan Regular serta harga sewanya. 
                <br/><span className="text-xs text-gray-600">(Fitur ini statis untuk demo)</span>
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mt-8 text-left">
                 <div className="bg-black/30 p-4 rounded-lg border border-purple-500/30">
                    <h4 className="font-bold text-purple-400">Meja VIP</h4>
                    <p className="text-xs text-gray-400">Harga Booking: Rp 100.000</p>
                    <p className="text-xs text-gray-400">Fasilitas: AC, View, Sofa</p>
                 </div>
                 <div className="bg-black/30 p-4 rounded-lg border border-gray-500/30">
                    <h4 className="font-bold text-gray-300">Meja Regular</h4>
                    <p className="text-xs text-gray-400">Harga Booking: Rp 50.000</p>
                    <p className="text-xs text-gray-400">Fasilitas: Standard</p>
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;