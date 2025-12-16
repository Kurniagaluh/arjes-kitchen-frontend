import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import bookingAPI from '../api/booking';
import { mejaAPI } from '../api/meja';
import {
  Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle,
  Plus, Eye, Coffee, X, ChevronRight, Home, Menu as MenuIcon, 
  Table2, Loader2, LogOut,
  Search, RefreshCw, ChevronLeft
} from 'lucide-react';

// ... (semua helper function dan StatusBadge tetap sama)
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

const addHoursToDate = (dateString, hours) => {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hours);
  return date.toISOString().slice(0, 16);
};

const formatForDateTimeLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// Status Badge Component (tetap sama)
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

// Main Booking Component
const BookingPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('my-bookings');
  const [myBookings, setMyBookings] = useState([]);
  
  // --- GANTI NAMA STATE ---
  const [getAvailable, setAllTables] = useState([]); // Sebelumnya availableTables
  
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('terbaru');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Form state
  const [formData, setFormData] = useState({
    meja_id: '',
    tanggal: '',
    waktu_selesai: '',
    catatan: ''
  });

  // Fetch user's bookings (tetap sama)
  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getMyBookings();
      setMyBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- GANTI FUNGSI FETCH MEJA ---
  // Fetch all tables that are marked as 'tersedia'
  const fetchAllTables = async () => {
    try {
      const response = await mejaAPI.getAvailable();
      setAllTables(response.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setAllTables([]);
    }
  };

  // Handle form submission (tetap sama, backend yang akan validasi)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tanggal || !formData.waktu_selesai || !formData.meja_id) {
      alert('Mohon lengkapi semua data yang diperlukan');
      return;
    }

    const startTime = new Date(formData.tanggal);
    const endTime = new Date(formData.waktu_selesai);
    if (endTime <= startTime) {
      alert('Waktu selesai harus setelah waktu mulai');
      return;
    }

    // Cari meja yang dipilih untuk mendapatkan kapasitasnya
    const selectedTable = getAvailable.find(table => table.id === formData.meja_id);
    if (!selectedTable) {
      alert('Meja tidak valid');
      return;
    }

    const bookingData = {
      ...formData,
      jumlah_orang: selectedTable.kapasitas
    };

    try {
      await bookingAPI.create(bookingData);
      alert('Booking berhasil dibuat!');
      setShowBookingModal(false);
      setFormData({
        meja_id: '',
        tanggal: '',
        waktu_selesai: '',
        catatan: ''
      });
      fetchMyBookings();
    } catch (error) {
      // Backend akan mengembalikan error 400 jika meja tidak tersedia
      alert(error.response?.data?.message || 'Gagal membuat booking. Mungkin meja sudah dipesan pada waktu tersebut.');
    }
  };

  // Handle cancel booking (tetap sama)
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;

    try {
      await bookingAPI.cancel(id);
      alert('Booking berhasil dibatalkan');
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membatalkan booking');
    }
  };

  // Set waktu_selesai automatically (tetap sama)
  const handleTanggalChange = (e) => {
    const tanggal = e.target.value;
    if (!tanggal) {
      setFormData(prev => ({ ...prev, tanggal: '', waktu_selesai: '' }));
      return;
    }

    const waktuSelesai = addHoursToDate(tanggal, 2);
    
    setFormData(prev => ({
      ...prev,
      tanggal,
      waktu_selesai: waktuSelesai
    }));
  };

  // Get current datetime for min attribute (tetap sama)
  const getCurrentDateTime = () => {
    const now = new Date();
    return formatForDateTimeLocal(now);
  };

  // Get tomorrow's date for max attribute (tetap sama)
  const getTomorrowDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    return formatForDateTimeLocal(tomorrow);
  };

  // Reset all filters (tetap sama)
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('terbaru');
    setCurrentPage(1);
  };

  // --- PERBAIKI EFFECT ---
  // Effects
  useEffect(() => {
    if (user) {
      fetchMyBookings();
      fetchAllTables(); // Ambil data meja saat komponen dimuat
    }
  }, [user]); // Hanya depend pada user

  // --- GANTI LOGIKA VALIDASI FORM ---
  const isFormValid = () => {
    return formData.tanggal && 
           formData.waktu_selesai && 
           formData.meja_id && 
           getAvailable.length > 0; // Cek apakah ada meja sama sekali
  };

  // Filter and sort functions (tetap sama)
  const filteredBookings = myBookings.filter(booking => {
    const matchesSearch = booking.meja?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.kode_booking?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.catatan?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort function (tetap sama)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch(sortBy) {
      case 'terbaru':
        return new Date(b.tanggal) - new Date(a.tanggal);
      case 'terlama':
        return new Date(a.tanggal) - new Date(b.tanggal);
      case 'tanggal':
        return new Date(a.tanggal) - new Date(b.tanggal);
      default:
        return 0;
    }
  });

  // Pagination calculation (tetap sama)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);

  // Change page (tetap sama)
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate stats (tetap sama)
  const stats = {
    total: myBookings.length,
    pending: myBookings.filter(b => b.status === 'pending').length,
    confirmed: myBookings.filter(b => b.status === 'confirmed').length,
    cancelled: myBookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="flex h-screen bg-arjes-bg text-arjes-text overflow-hidden font-sans">
      {/* --- OVERLAY MOBILE, SIDEBAR, MAIN CONTENT, HEADER, STATS, FILTERS --- */}
      {/* ... (Bagian-bagian ini tetap sama, tidak perlu diubah) ... */}
      {/* --- OVERLAY MOBILE --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#0F1F18] border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        {/* ... Isi sidebar tetap sama ... */}
        <div className="p-8 flex items-center justify-between md:justify-start gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-arjes-gold rounded-xl flex items-center justify-center text-arjes-bg font-bold shadow-lg">
              <Coffee size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">Arjes Booking</h1>
              <p className="text-xs text-gray-400">{user?.email || 'Guest'}</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab('my-bookings');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'my-bookings'
                ? 'bg-arjes-gold text-arjes-bg font-bold shadow-lg shadow-arjes-gold/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Calendar size={18} />
            Booking Saya
          </button>
          <button
            onClick={() => {
              setActiveTab('new-booking');
              setShowBookingModal(true);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'new-booking'
                ? 'bg-arjes-gold text-arjes-bg font-bold shadow-lg shadow-arjes-gold/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Plus size={18} />
            Booking Baru
          </button>
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 mt-auto">
          <a 
            href="/" 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-all hover:bg-white/5"
          >
            <Home size={18} />
            Kembali ke Beranda
          </a>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 relative z-10">
        {/* ... Isi main content tetap sama ... */}
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
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Booking Meja</h1>
              <p className="text-gray-400 text-sm mt-1">Reservasi meja untuk pengalaman terbaik</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
            >
              <Plus size={18} />
              Booking Baru
            </button>
            
            <button 
              onClick={fetchMyBookings}
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
                  placeholder="Cari booking (meja, kode, catatan)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-64 bg-black/30 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-arjes-gold"
                />
              </div>
              
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Reset Filter
              </button>
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
                <option value="tanggal">Berdasarkan Tanggal</option>
              </select>
            </div>
          </div>
        </div>

        {/* BOOKINGS CONTENT */}
        <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-white">Daftar Booking</h3>
            <p className="text-sm text-gray-400 mt-1">
              Menampilkan {currentItems.length} booking dari {filteredBookings.length} hasil filter (total: {myBookings.length} booking)
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
              <h4 className="text-white font-bold text-lg mb-2">Belum ada booking</h4>
              <p className="text-gray-400 mb-6">Mulai dengan membuat booking pertama Anda</p>
              <button 
                onClick={() => setShowBookingModal(true)}
                className="px-6 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
              >
                <Plus size={18} className="inline mr-2" />
                Buat Booking Pertama
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map(booking => (
                  <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-arjes-gold/30 transition-all group">
                    {/* Header with Status */}
                    <div className="p-5 border-b border-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Kode Booking</div>
                          <div className="text-white font-bold font-mono">{booking.kode_booking || 'BKJ-' + booking.id}</div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      
                      <div className="text-white font-medium text-lg mb-2">
                        {formatDate(booking.tanggal)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatTime(booking.tanggal)} - {formatTime(booking.waktu_selesai)}
                      </div>
                    </div>
                    
                    {/* Booking Details */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-arjes-gold/10 rounded-lg">
                          <Table2 size={18} className="text-arjes-gold" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{booking.meja?.nama || 'Meja'}</div>
                          <div className="text-gray-400 text-xs">
                            Kapasitas: {booking.meja?.kapasitas} orang
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Users size={18} className="text-blue-400" />
                        </div>
                        <div className="text-white font-medium">
                          {booking.jumlah_orang} orang
                        </div>
                      </div>
                      
                      {booking.catatan && (
                        <div className="mb-4">
                          <div className="text-xs text-gray-400 mb-1">Catatan</div>
                          <div className="text-gray-300 text-sm line-clamp-2">
                            {booking.catatan}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailModal(true);
                          }}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                          Detail
                        </button>
                        
                        <div className="flex items-center gap-2">
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
          <p>Total booking: {myBookings.length} • Menunggu: {stats.pending} • Dikonfirmasi: {stats.confirmed} • Dibatalkan: {stats.cancelled}</p>
        </div>
      </main>

      {/* --- MODAL BOOKING BARU --- */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0F1F18]">
              <h3 className="font-bold text-white text-lg">Buat Booking Baru</h3>
              <button 
                onClick={() => {
                  setShowBookingModal(false);
                  setFormData({
                    meja_id: '',
                    tanggal: '',
                    waktu_selesai: '',
                    catatan: ''
                  });
                }} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Tanggal & Waktu Mulai <span className="text-red-400">*</span>
                  </div>
                </label>
                <input
                  type="datetime-local"
                  value={formData.tanggal}
                  onChange={handleTanggalChange}
                  min={getCurrentDateTime()}
                  max={getTomorrowDateTime()}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Waktu Selesai <span className="text-red-400">*</span>
                  </div>
                </label>
                <input
                  type="datetime-local"
                  value={formData.waktu_selesai}
                  onChange={(e) => setFormData(prev => ({ ...prev, waktu_selesai: e.target.value }))}
                  min={formData.tanggal || getCurrentDateTime()}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Durasi booking: 2 jam (default). Atur sesuai kebutuhan.
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Table2 size={16} />
                    Pilih Meja <span className="text-red-400">*</span>
                  </div>
                </label>
                
                {getAvailable.length === 0 ? ( // Ganti availableTables dengan getAvailable
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-center gap-3 text-red-400">
                      <XCircle size={20} />
                      <div>
                        <p className="font-medium">Tidak ada meja tersedia</p>
                        <p className="text-sm text-red-400/80 mt-1">
                          Silakan hubungi admin untuk menambahkan meja.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {getAvailable.map((table) => ( // Ganti availableTables dengan getAvailable
                      <div
                        key={table.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          formData.meja_id === table.id
                            ? 'border-arjes-gold bg-arjes-gold/10'
                            : 'border-white/10 hover:border-arjes-gold/50 hover:bg-white/5'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, meja_id: table.id }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{table.nama}</div>
                            <div className="text-sm text-gray-400 mt-1">
                              <div className="flex items-center gap-2">
                                <Users size={14} />
                                Kapasitas: {table.kapasitas} orang
                              </div>
                              {table.harga_per_jam > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                    {formatRp(table.harga_per_jam)}/jam
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {formData.meja_id === table.id && (
                            <div className="p-2 bg-arjes-gold rounded-lg">
                              <CheckCircle className="text-white" size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Catatan Tambahan (opsional)</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                  placeholder="Contoh: Meja dekat jendela, ada anak kecil, ada kebutuhan khusus, dll."
                  rows="3"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setFormData({
                      meja_id: '',
                      tanggal: '',
                      waktu_selesai: '',
                      catatan: ''
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid()}
                >
                  Buat Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL BOOKING --- */}
      {/* ... (Modal detail tetap sama) ... */}
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
              {/* Status */}
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <span className="text-gray-400">Status Booking</span>
                <StatusBadge status={selectedBooking.status} />
              </div>

              {/* Tanggal & Waktu */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-arjes-gold/10 rounded-lg">
                    <Calendar size={18} className="text-yellow-300" />
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
              {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                <div className="pt-4 border-t border-white/10">
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
                  <p className="text-xs text-gray-500 text-center mt-3">
                    ⚠️ Pembatalan kurang dari 2 jam akan dikenakan penalti
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;