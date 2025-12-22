// src/pages/user/BookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import bookingAPI from '../../api/booking';
import { mejaAPI } from '../../api/meja';
import {
  Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle,
  Plus, Eye, Coffee, X, ChevronRight, Home, Menu as MenuIcon, 
  Table2, Loader2, LogOut, Info,
  Search, RefreshCw, ChevronLeft, Filter, ShoppingCart, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

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

// Main Booking Component untuk Customer
const BookingPage = () => {
  const { user, logout } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('terbaru');
  
  // Form state
  const [formData, setFormData] = useState({
    meja_id: '',
    tanggal: '',
    waktu_selesai: '',
    catatan: ''
  });

  // Fetch user's bookings
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

  // Fetch available tables based on date/time
const fetchAvailableTables = async () => {
  try {
    // Ambil meja yang statusnya "tersedia" atau "available"
    const response = await mejaAPI.getAvailable();
    console.log('Data meja tersedia:', response.data);
    
    // Filter meja yang statusnya tersedia
    const availableTables = response.data.filter(table => 
      table.status?.toLowerCase() === 'tersedia' || 
      table.status?.toLowerCase() === 'available' ||
      table.status === true ||
      table.available === true ||
      // Jika tidak ada field status, anggap semua meja tersedia
      !table.status
    );
    
    setAvailableTables(availableTables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    setAvailableTables([]);
  }
};

  // Handle form submission
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

    // Find selected table to get capacity
    const selectedTable = availableTables.find(table => table.id === formData.meja_id);
    if (!selectedTable) {
      alert('Meja tidak valid');
      return;
    }

    const bookingData = {
      meja_id: formData.meja_id,
      tanggal: formData.tanggal,
      waktu_selesai: formData.waktu_selesai,
      jumlah_orang: selectedTable.jumlah_orang,
      catatan: formData.catatan || ''
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
      alert(error.response?.data?.message || 'Gagal membuat booking. Mungkin meja sudah dipesan pada waktu tersebut.');
    }
  };

  // Handle cancel booking
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

  // Set waktu_selesai automatically and fetch available tables
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
  
  // TIDAK fetch tables lagi, karena sudah mengambil semua meja
};

  // Get current datetime for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    return formatForDateTimeLocal(now);
  };

  // Get tomorrow's date for max attribute
  const getTomorrowDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    return formatForDateTimeLocal(tomorrow);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('terbaru');
  };

  // Effects
  useEffect(() => {
    if (user) {
      fetchMyBookings();
      fetchAvailableTables(); // Fetch all available tables initially
    }
  }, [user]);

  // Check if form is valid
  const isFormValid = () => {
    return formData.tanggal && 
           formData.waktu_selesai && 
           formData.meja_id && 
           availableTables.length > 0;
  };

  // Filter and sort functions
  const filteredBookings = myBookings.filter(booking => {
    const matchesSearch = booking.meja?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.kode_booking?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.catatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.meja?.nomor && booking.meja.nomor.toString().includes(searchTerm));
    
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
      case 'tanggal':
        return new Date(a.tanggal) - new Date(b.tanggal);
      default:
        return 0;
    }
  });

  // Calculate stats
  const stats = {
    total: myBookings.length,
    pending: myBookings.filter(b => b.status === 'pending').length,
    confirmed: myBookings.filter(b => b.status === 'confirmed').length,
    cancelled: myBookings.filter(b => b.status === 'cancelled').length,
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] flex flex-col items-center justify-center pt-24 px-4">
        <div className="text-center max-w-md">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-[#D4AF37] mx-auto mb-6" />
            <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-xl"></div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#D4AF37] mb-3">
            Memuat Booking...
          </h2>
          <p className="text-gray-300">
            Sedang mengambil data booking Anda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F1F18] to-[#1a2d25] text-white pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Booking */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-[#D4AF37] mb-4"
          >
            Booking Meja Arjes Kitchen
          </motion.h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Reservasi meja untuk pengalaman terbaik di Arjes Kitchen
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Booking</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
                <Calendar className="text-[#D4AF37]" size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Menunggu</p>
                <h3 className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Clock className="text-yellow-400" size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Dikonfirmasi</p>
                <h3 className="text-3xl font-bold text-green-400 mt-1">{stats.confirmed}</h3>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 hover:border-[#D4AF37]/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Dibatalkan</p>
                <h3 className="text-3xl font-bold text-red-400 mt-1">{stats.cancelled}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl">
                <XCircle className="text-red-400" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border flex-shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#D4AF37] text-[#0F1F18] border-[#D4AF37]'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border flex-shrink-0 ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-[#0F1F18] border-yellow-500'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-yellow-500 hover:text-yellow-500'
              }`}
            >
              Menunggu ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border flex-shrink-0 ${
                statusFilter === 'confirmed'
                  ? 'bg-green-500 text-[#0F1F18] border-green-500'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-green-500 hover:text-green-500'
              }`}
            >
              Dikonfirmasi ({stats.confirmed})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border flex-shrink-0 ${
                statusFilter === 'cancelled'
                  ? 'bg-red-500 text-[#0F1F18] border-red-500'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-red-500 hover:text-red-500'
              }`}
            >
              Dibatalkan ({stats.cancelled})
            </button>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Cari booking, meja, atau kode..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="tanggal">Berdasarkan Tanggal</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-3 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Results Info */}
        {(statusFilter !== 'all' || searchTerm) && (
          <div className="mb-6 text-center">
            <p className="text-gray-400 text-sm">
              Menampilkan {sortedBookings.length} dari {myBookings.length} booking
              {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
              {searchTerm && ` • Pencarian: "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-8 text-center">
          <motion.button
            onClick={() => {
              setShowBookingModal(true);
              fetchAvailableTables(); // Fetch all tables when opening modal
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#D4AF37] text-[#0F1F18] px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all flex items-center gap-3 mx-auto"
          >
            <Plus size={24} />
            Buat Booking Baru
          </motion.button>
        </div>

        {/* Grid Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedBookings.length > 0 ? (
            sortedBookings.map((booking) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={booking.id}
                className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-[#D4AF37]/50 transition-all group"
              >
                {/* Header dengan Status Badge */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Table2 size={18} className="text-[#D4AF37]" />
                        <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                          Meja {booking.meja?.nomor || booking.meja?.nomor_meja || booking.meja?.no_meja || `#${booking.meja_id}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{booking.kode_booking}</span>
                        {booking.meja?.nama && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400">{booking.meja.nama}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-[#D4AF37]" />
                      <span className="text-white font-medium">{formatDate(booking.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-[#D4AF37]" />
                      <span className="text-gray-300">
                        {formatTime(booking.tanggal)} - {formatTime(booking.waktu_selesai)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Users size={18} className="text-[#D4AF37]" />
                        <span className="text-gray-400 text-sm">Jumlah Orang</span>
                      </div>
                      <p className="text-white font-bold text-xl">{booking.jumlah_orang} orang</p>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Table2 size={18} className="text-[#D4AF37]" />
                        <span className="text-gray-400 text-sm">Kapasitas Meja</span>
                      </div>
                      <p className="text-white font-bold text-xl">{booking.meja?.jumlah_orang || '?'} Orang</p>
                    </div>
                  </div>

                  {/* Catatan */}
                  {booking.catatan && (
                    <div className="mb-6">
                      <p className="text-gray-400 text-sm mb-2">Catatan:</p>
                      <p className="text-gray-300 text-sm line-clamp-2 bg-white/5 p-3 rounded-xl">
                        {booking.catatan}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      Detail
                    </button>
                    
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex-1 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Belum ada booking</h3>
              <p className="text-gray-400 mb-4">
                {statusFilter !== 'all' || searchTerm 
                  ? 'Tidak ada booking yang sesuai dengan filter Anda.' 
                  : 'Mulai dengan membuat booking pertama Anda.'}
              </p>
              <div className="space-x-4">
                {statusFilter !== 'all' || searchTerm ? (
                  <>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="bg-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all"
                    >
                      Hapus Pencarian
                    </button>
                    <button 
                      onClick={() => setStatusFilter('all')}
                      className="bg-[#D4AF37] text-[#0F1F18] px-4 py-2 rounded-xl font-bold hover:bg-white transition-all"
                    >
                      Lihat Semua Booking
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setShowBookingModal(true);
                      fetchAvailableTables();
                    }}
                    className="bg-[#D4AF37] text-[#0F1F18] px-6 py-3 rounded-xl font-bold hover:bg-white transition-all"
                  >
                    <Plus size={18} className="inline mr-2" />
                    Buat Booking Pertama
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {sortedBookings.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              Menemukan {sortedBookings.length} booking yang cocok
            </p>
          </div>
        )}

      </div>

      {/* MODAL BOOKING BARU */}
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
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
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
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, waktu_selesai: e.target.value }));
                    // Re-fetch available tables if waktu_selesai changes
                    if (formData.tanggal) {
                      fetchAvailableTables(formData.tanggal, e.target.value);
                    }
                  }}
                  min={formData.tanggal || getCurrentDateTime()}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Durasi booking: 2 jam (default). Atur sesuai kebutuhan.
                </p>
              </div>
              
              {/* Informasi tanggal booking */}
              {formData.tanggal && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-300 text-sm">
                    <Info size={16} />
                    <span>
                      Booking untuk {formatDate(formData.tanggal)} 
                      pukul {formatTime(formData.tanggal)} - {formatTime(formData.waktu_selesai)}
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Table2 size={16} />
                    Pilih Meja <span className="text-red-400">*</span>
                  </div>
                </label>
                
                {availableTables.length === 0 ? (
                  <div className={`p-4 ${formData.tanggal ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-red-500/10 border border-red-500/30'} rounded-xl`}>
                    <div className={`flex items-center gap-3 ${formData.tanggal ? 'text-yellow-400' : 'text-red-400'}`}>
                      {formData.tanggal ? <AlertCircle size={20} /> : <XCircle size={20} />}
                      <div>
                        <p className="font-medium">
                          {formData.tanggal 
                            ? 'Tidak ada meja tersedia' 
                            : 'Pilih tanggal dan waktu terlebih dahulu'}
                        </p>
                        <p className="text-sm mt-1">
                          {formData.tanggal 
                            ? `Tidak ada meja tersedia pada ${formatDate(formData.tanggal)} pukul ${formatTime(formData.tanggal)}`
                            : 'Silakan pilih tanggal dan waktu booking terlebih dahulu untuk melihat meja yang tersedia.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {availableTables.map((table) => (
                      <div
                        key={table.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          formData.meja_id === table.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                            : 'border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/5'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, meja_id: table.id }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            {/* TAMPILKAN NOMOR MEJA */}
                            <div className="font-medium text-white flex items-center gap-2">
                              <Table2 size={16} className="text-[#D4AF37]" />
                              Meja {table.nomor || table.nomor_meja || table.no_meja || `#${table.id}`}
                            </div>
                            
                            <div className="text-sm text-gray-400 mt-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Users size={14} />
                                <span> {table.tipe_meja} {table.jumlah_orang}</span>
                              </div>
                              
                              {/* Tampilkan tipe meja jika ada */}
                              {table.tipe_meja && (
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <span>{table.tipe_meja.nama || table.tipe_meja}</span>
                                </div>
                              )}
                              
                              {/* Tampilkan posisi jika ada */}
                              {table.posisi && (
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} />
                                  <span>{table.posisi}</span>
                                </div>
                              )}
                              
                              {/* Tampilkan nama meja jika ada dan berbeda dari nomor */}
                              {table.nama && table.nama !== table.nomor && (
                                <div className="text-xs text-gray-500">
                                  {table.nama}
                                </div>
                              )}
                            </div>
                            
                            {/* Tampilkan harga jika ada */}
                            {table.harga_per_jam > 0 && (
                              <div className="mt-2">
                                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                  {formatRp(table.harga_per_jam)}/jam
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {formData.meja_id === table.id && (
                            <div className="p-2 bg-[#D4AF37] rounded-lg">
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
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] resize-none"
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
                  className="flex-1 px-4 py-3 bg-[#D4AF37] text-[#0F1F18] font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid()}
                >
                  Buat Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL BOOKING */}
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
                  <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                    <Calendar size={18} className="text-[#D4AF37]" />
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
                    <div>
                      <div className="font-medium text-white text-lg">
                        Meja {selectedBooking.meja?.nomor || selectedBooking.meja?.nomor_meja || selectedBooking.meja?.no_meja || `#${selectedBooking.meja_id}`}
                      </div>
                      {selectedBooking.meja?.nama && (
                        <div className="text-gray-400 text-sm">
                          {selectedBooking.meja.nama}
                        </div>
                      )}
                    </div>
                    {selectedBooking.meja?.harga_per_jam > 0 && (
                      <div className="text-[#D4AF37] font-bold">
                        {formatRp(selectedBooking.meja.harga_per_jam)}/jam
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      Kapasitas: {selectedBooking.meja?.jumlah_orang} orang
                    </div>
                    {selectedBooking.meja?.posisi && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        {selectedBooking.meja.posisi}
                      </div>
                    )}
                    {selectedBooking.meja?.tipe_meja && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        {selectedBooking.meja.tipe_meja.nama || selectedBooking.meja.tipe_meja}
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
                    <span className="font-medium font-mono text-[#D4AF37]">{selectedBooking.kode_booking}</span>
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