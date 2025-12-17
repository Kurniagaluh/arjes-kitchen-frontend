import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle,
  Plus, Eye, Coffee, X, ChevronRight, Home, Menu as MenuIcon, 
  Table2, Loader2, LogOut, Utensils,
  Search, RefreshCw, ChevronLeft, Filter, CheckCheck,
  LayoutDashboard, Tag, Download, Upload,
  ArrowUpDown, User, Mail, Phone, Shield
} from 'lucide-react';
import bookingAPI from '../../api/booking';
import { useAuth } from '../../context/AuthContext';

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('id-ID', options);
};

const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('id-ID', options);
};

const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
      icon: Clock,
      label: 'Menunggu' 
    },
    confirmed: { 
      color: 'bg-green-500/20 text-green-400 border-green-500/30', 
      icon: CheckCircle,
      label: 'Dikonfirmasi' 
    },
    cancelled: { 
      color: 'bg-red-500/20 text-red-400 border-red-500/30', 
      icon: XCircle,
      label: 'Dibatalkan' 
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </div>
  );
};

// Main Admin Booking Component
const ManageBooking = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // State Management
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('terbaru');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAll();
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showAlert('Gagal memuat data booking. Periksa koneksi API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menampilkan alert
  const showAlert = (message, type = 'info') => {
    alert(message);
  };

  // Handle konfirmasi booking
  const handleConfirmBooking = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin mengkonfirmasi booking ini?')) return;

    try {
      await bookingAPI.updateStatus(id, 'confirmed');
      showAlert('✅ Booking berhasil dikonfirmasi!', 'success');
      fetchData();
    } catch (error) {
      console.error('Error confirming booking:', error);
      showAlert('❌ Gagal mengkonfirmasi booking. Coba lagi.', 'error');
    }
  };

  // Handle cancel booking (admin)
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;

    try {
      await bookingAPI.updateStatus(id, 'cancelled');
      showAlert('✅ Booking berhasil dibatalkan!', 'success');
      fetchData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showAlert('❌ Gagal membatalkan booking. Coba lagi.', 'error');
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action, selectedStatus) => {
    const selectedBookings = filteredBookings.filter(b => b.status === selectedStatus);
    
    if (selectedBookings.length === 0) {
      showAlert(`Tidak ada booking dengan status ${selectedStatus} untuk di${action}!`, 'warning');
      return;
    }
    
    if (!confirm(`Apakah Anda yakin ingin ${action} ${selectedBookings.length} booking dengan status ${selectedStatus}?`)) return;

    try {
      const promises = selectedBookings.map(booking => 
        bookingAPI.updateStatus(booking.id, action === 'confirm' ? 'confirmed' : 'cancelled')
      );
      
      await Promise.all(promises);
      showAlert(`✅ ${selectedBookings.length} booking berhasil di${action}!`, 'success');
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing bookings:`, error);
      showAlert(`❌ Gagal ${action} booking. Coba lagi.`, 'error');
    }
  };

  // Open detail modal
  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('terbaru');
    setCurrentPage(1);
  };

  // Filter and sort functions
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.meja?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.kode_booking?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.catatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort function
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch(sortBy) {
      case 'terbaru':
        return new Date(b.tanggal) - new Date(a.tanggal);
      case 'terlama':
        return new Date(a.tanggal) - new Date(b.tanggal);
      case 'nama-meja':
        return (a.meja?.nama || '').localeCompare(b.meja?.nama || '');
      case 'nama-user':
        return (a.user?.name || '').localeCompare(b.user?.name || '');
      default:
        return 0;
    }
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(bookings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `booking-data-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="flex h-screen bg-arjes-bg text-arjes-text overflow-hidden font-sans">
      
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
              <Calendar size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">Arjes Admin</h1>
              <p className="text-xs text-gray-400">Manajemen Booking</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard Utama</span>
          </Link>
          
          <Link 
            to="/admin/menu" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <Utensils size={18} />
            <span className="text-sm font-medium">Manajemen Menu</span>
          </Link>
          
          <Link 
            to="/admin/tables" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <Table2 size={18} />
            <span className="text-sm font-medium">Manajemen Meja</span>
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-arjes-gold text-arjes-bg font-bold shadow-lg shadow-arjes-gold/20">
            <Calendar size={18} />
            <span className="text-sm font-medium">Manajemen Booking</span>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 mt-auto">
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative z-10">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 bg-[#0F1F18] border border-white/10 rounded-lg text-white shadow-lg"
            >
              <MenuIcon size={24} />
            </button>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Manajemen Booking</h1>
              <p className="text-gray-400 text-sm mt-1">Kelola semua reservasi meja restoran</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Download size={18} />
              Export Data
            </button>
            
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Booking</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Calendar className="text-arjes-gold" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Menunggu</p>
                <h3 className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Clock className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Dikonfirmasi</p>
                <h3 className="text-3xl font-bold text-green-400 mt-1">{stats.confirmed}</h3>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Dibatalkan</p>
                <h3 className="text-3xl font-bold text-red-400 mt-1">{stats.cancelled}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl">
                <XCircle className="text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-[#0F1F18] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari booking (meja, kode, nama, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-64 bg-black/30 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-arjes-gold"
                />
              </div>
              
              {/* Bulk Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleBulkAction('confirm', 'pending')}
                  className="px-4 py-2.5 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors text-sm font-medium"
                  disabled={stats.pending === 0}
                >
                  <CheckCircle size={16} className="inline mr-2" />
                  Konfirmasi Semua Pending
                </button>
                <button
                  onClick={() => handleBulkAction('cancel', 'pending')}
                  className="px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium"
                  disabled={stats.pending === 0}
                >
                  <XCircle size={16} className="inline mr-2" />
                  Batalkan Semua Pending
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  <RefreshCw size={16} className="inline mr-2" />
                  Reset Filter
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/30 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-arjes-gold"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/30 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-arjes-gold"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="nama-meja">Nama Meja</option>
                <option value="nama-user">Nama User</option>
              </select>
            </div>
          </div>
        </div>

        {/* BOOKINGS GRID */}
        <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-white">Daftar Booking</h3>
            <p className="text-sm text-gray-400 mt-1">
              Menampilkan {currentItems.length} booking dari {filteredBookings.length} hasil filter (total: {bookings.length} booking)
            </p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-arjes-gold"></div>
              <p className="text-gray-400 mt-4">Memuat data booking...</p>
            </div>
          ) : sortedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-white/5 rounded-full mb-4">
                <Calendar className="text-gray-600" size={40} />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">Tidak ada booking</h4>
              <p className="text-gray-400 mb-6">Belum ada booking yang terdaftar atau hasil filter kosong</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map(booking => (
                  <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-arjes-gold/30 transition-all group">
                    {/* Header dengan User Info */}
                    {booking.user && (
                      <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-arjes-gold/20 rounded-full flex items-center justify-center">
                            <User size={14} className="text-arjes-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {booking.user.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {booking.user.email}
                            </p>
                          </div>
                          <StatusBadge status={booking.status} />
                        </div>
                      </div>
                    )}

                    {/* Booking Details */}
                    <div className="p-5">
                      <div className="mb-4">
                        <h4 className="text-white font-bold text-lg mb-2 line-clamp-1">
                          {booking.meja?.nama || 'Meja'}
                        </h4>
                        <p className="text-gray-400 text-sm font-mono">
                          {booking.kode_booking || `BKJ-${booking.id}`}
                        </p>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-arjes-gold flex-shrink-0" />
                          <span className="text-white text-sm">{formatDate(booking.tanggal)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-arjes-gold flex-shrink-0" />
                          <span className="text-gray-300 text-sm">
                            {formatTime(booking.tanggal)} - {formatTime(booking.waktu_selesai)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-arjes-gold flex-shrink-0" />
                          <span className="text-white text-sm">
                            {booking.jumlah_orang} orang (Kapasitas: {booking.meja?.kapasitas || '?'})
                          </span>
                        </div>
                      </div>
                      
                      {booking.catatan && (
                        <div className="mb-4 p-3 bg-white/5 rounded-xl">
                          <p className="text-gray-400 text-xs mb-1">Catatan:</p>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {booking.catatan}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <button
                          onClick={() => openDetailModal(booking)}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                          Detail
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmBooking(booking.id)}
                              className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs font-medium flex items-center gap-2"
                            >
                              <CheckCheck size={14} />
                              Konfirmasi
                            </button>
                          )}
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium flex items-center gap-2"
                            >
                              <XCircle size={14} />
                              Batalkan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          currentPage === pageNumber
                            ? 'bg-arjes-gold text-arjes-bg'
                            : 'bg-white/5 text-white hover:bg-white/10'
                        } transition-colors`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  <span className="text-gray-400 text-sm ml-4">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Total booking: {bookings.length} • Menunggu: {stats.pending} • Dikonfirmasi: {stats.confirmed} • Dibatalkan: {stats.cancelled}</p>
        </div>
      </main>

      {/* --- MODAL DETAIL BOOKING --- */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Detail Booking</h3>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Info User */}
              {selectedBooking.user && (
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-arjes-gold/10 rounded-lg">
                      <User size={18} className="text-arjes-gold" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-300">Informasi User</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nama</span>
                      <span className="font-medium text-white">{selectedBooking.user.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium text-white">{selectedBooking.user.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <span className="text-gray-400">Status Booking</span>
                <StatusBadge status={selectedBooking.status} />
              </div>

              {/* Tanggal & Waktu */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-arjes-gold/10 rounded-lg">
                    <Calendar size={18} className="text-arjes-gold" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-300">Tanggal & Waktu</h4>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="text-white font-medium text-lg mb-2">
                    {formatDate(selectedBooking.tanggal)}
                  </div>
                  <div className="text-gray-400">
                    {formatTime(selectedBooking.tanggal)} - {formatTime(selectedBooking.waktu_selesai)}
                  </div>
                </div>
              </div>

              {/* Detail Meja */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Table2 size={18} className="text-green-300" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-300">Detail Meja</h4>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-white text-lg">{selectedBooking.meja?.nama || 'Meja'}</div>
                    {selectedBooking.meja?.harga_per_jam > 0 && (
                      <div className="text-arjes-gold font-bold">
                        {formatRp(selectedBooking.meja.harga_per_jam)}/jam
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      Kapasitas: {selectedBooking.meja?.kapasitas} orang
                    </div>
                    {selectedBooking.meja?.posisi && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        {selectedBooking.meja.posisi}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informasi Booking */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users size={18} className="text-blue-300" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-300">Informasi Booking</h4>
                </div>
                <div className="bg-white/5 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Jumlah Orang</span>
                    <span className="font-medium text-white">{selectedBooking.jumlah_orang} orang</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-400">Kode Booking</span>
                    <span className="font-medium font-mono text-arjes-gold">{selectedBooking.kode_booking}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Dibuat Pada</span>
                    <span className="font-medium text-white">{formatDateTime(selectedBooking.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Catatan */}
              {selectedBooking.catatan && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Catatan</h4>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedBooking.catatan}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Apakah Anda yakin ingin mengkonfirmasi booking ini?')) {
                        handleConfirmBooking(selectedBooking.id);
                        setShowDetailModal(false);
                      }
                    }}
                    className="w-full px-6 py-3.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCheck size={18} />
                    Konfirmasi Booking
                  </button>
                )}
                
                {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                  <button
                    onClick={() => {
                      if (window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
                        handleCancelBooking(selectedBooking.id);
                        setShowDetailModal(false);
                      }
                    }}
                    className="w-full px-6 py-3.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Batalkan Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooking;