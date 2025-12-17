// src/pages/user/VoucherList.jsx
import React, { useState, useEffect } from 'react';
import { Copy, Check, Ticket, Clock, Loader2, AlertCircle, Filter, ChevronDown, ChevronUp, Home, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import voucherAPI from '../../api/voucher'; // Import API yang sudah dibuat
import Navbar from '../../components/Navbar'; // Sesuaikan dengan path Navbar Anda
import Footer from '../../components/Footer'; // Sesuaikan dengan path Footer Anda

export default function VoucherList() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [expiredVouchers, setExpiredVouchers] = useState([]);
  const [showExpired, setShowExpired] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, percentage, fixed, free_item
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('available'); // available, expired, all

  // Fetch vouchers dan statistics dari API
  useEffect(() => {
    fetchVouchers();
    fetchStatistics();
  }, [filterType]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tambahkan filter berdasarkan type jika bukan 'all'
      const params = {};
      if (filterType !== 'all') {
        params.type = filterType;
      }
      
      const response = await voucherAPI.getAll(params);
      
      if (response.data && response.data.data) {
        const allVouchers = response.data.data;
        
        // Filter voucher yang masih aktif
        const now = new Date();
        const available = allVouchers.filter(voucher => {
          const validUntil = new Date(voucher.valid_until);
          return validUntil > now && voucher.status === 'active';
        });
        
        // Filter voucher yang sudah expired
        const expired = allVouchers.filter(voucher => {
          const validUntil = new Date(voucher.valid_until);
          return validUntil <= now || voucher.status !== 'active';
        });
        
        setVouchers(allVouchers);
        setAvailableVouchers(available);
        setExpiredVouchers(expired);
      }
      
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Gagal memuat voucher. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await voucherAPI.getStatistics();
      if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    
    // Reset status "Copied" setelah 2 detik
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format nilai diskon
  const formatDiscount = (voucher) => {
    if (voucher.type === 'percentage') {
      return `${voucher.value}%`;
    } else if (voucher.type === 'fixed') {
      return `Rp ${parseInt(voucher.value).toLocaleString('id-ID')}`;
    } else if (voucher.type === 'free_item') {
      return voucher.free_item_name || 'Free Item';
    }
    return voucher.value;
  };

  // Format minimum pembelian
  const formatMinPurchase = (voucher) => {
    if (voucher.min_purchase && voucher.min_purchase > 0) {
      return `Min. belanja Rp ${parseInt(voucher.min_purchase).toLocaleString('id-ID')}`;
    }
    return 'Tanpa minimum';
  };

  // Get badge color berdasarkan type voucher
  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'percentage': return 'bg-blue-500/20 text-blue-400';
      case 'fixed': return 'bg-green-500/20 text-green-400';
      case 'free_item': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    switch(type) {
      case 'percentage': return 'Persentase';
      case 'fixed': return 'Potongan Tetap';
      case 'free_item': return 'Gratis Item';
      default: return type;
    }
  };

  // Handle check voucher
  const handleCheckVoucher = async (voucherCode) => {
    try {
      const response = await voucherAPI.checkVoucher(voucherCode);
      if (response.data.valid) {
        alert(`Voucher "${voucherCode}" valid! Diskon: ${response.data.discount_value}`);
      } else {
        alert(`Voucher "${voucherCode}" tidak valid. ${response.data.message}`);
      }
    } catch (err) {
      alert('Error checking voucher: ' + (err.response?.data?.message || err.message));
    }
  };

  // Tampilkan loading
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <div className="mb-8">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-arjes-gold">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                      <span className="ml-1 text-sm font-medium text-arjes-gold md:ml-2">
                        Voucher Saya
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>

            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-arjes-gold" size={40} />
              <span className="ml-3 text-lg">Memuat voucher...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Tampilkan error
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <div className="mb-8">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-arjes-gold">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                      <span className="ml-1 text-sm font-medium text-arjes-gold md:ml-2">
                        Voucher Saya
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>

            <div className="flex flex-col items-center justify-center py-12 bg-red-500/10 rounded-xl border border-red-500/30">
              <AlertCircle className="text-red-500 mb-3" size={40} />
              <p className="text-center text-red-400 text-lg mb-2">{error}</p>
              <p className="text-center text-gray-500 mb-4">Silakan coba beberapa saat lagi</p>
              <button 
                onClick={fetchVouchers}
                className="px-6 py-3 bg-arjes-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Tentukan vouchers yang ditampilkan berdasarkan tab aktif
  const displayVouchers = activeTab === 'available' 
    ? availableVouchers 
    : activeTab === 'expired' 
      ? expiredVouchers 
      : vouchers;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-arjes-gold">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                    <span className="ml-1 text-sm font-medium text-arjes-gold md:ml-2">
                      Voucher Saya
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-serif font-bold text-arjes-gold mb-2">Voucher Saya</h1>
                <p className="text-gray-400">
                  {stats ? (
                    <span>Total: <span className="text-arjes-gold">{stats.total}</span> voucher • 
                    Aktif: <span className="text-green-400">{stats.active}</span> • 
                    Terpakai: <span className="text-blue-400">{stats.used}</span></span>
                  ) : (
                    `Anda memiliki ${availableVouchers.length} voucher aktif`
                  )}
                </p>
              </div>
              
              {/* Filter Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Tabs */}
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('available')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'available'
                        ? 'bg-arjes-gold text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Aktif ({availableVouchers.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('expired')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'expired'
                        ? 'bg-red-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Kadaluarsa ({expiredVouchers.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Semua ({vouchers.length})
                  </button>
                </div>
                
                {/* Type Filter */}
                <div className="flex items-center gap-3">
                  <Filter size={20} className="text-gray-400" />
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arjes-gold min-w-[140px]"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="percentage">Persentase</option>
                    <option value="fixed">Potongan Tetap</option>
                    <option value="free_item">Gratis Item</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cara Pakai */}
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <CreditCard className="text-blue-400 mt-1" size={20} />
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">Cara Menggunakan Voucher</h3>
                <p className="text-sm text-gray-400">
                  1. Salin kode voucher dengan menekan tombol "Copy" <br />
                  2. Saat checkout, tempelkan kode di kolom voucher <br />
                  3. Klik "Check" untuk memastikan voucher valid sebelum digunakan
                </p>
              </div>
            </div>
          </div>

          {/* Voucher Grid */}
          {displayVouchers.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <Ticket className="mx-auto text-white/20 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                {activeTab === 'available' ? 'Tidak ada voucher aktif' : 
                 activeTab === 'expired' ? 'Tidak ada voucher kadaluarsa' : 
                 'Tidak ada voucher'}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'available' 
                  ? 'Semua voucher sudah kadaluarsa atau sudah terpakai'
                  : 'Belum ada voucher yang tersimpan'}
              </p>
              <Link 
                to="/menu" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-arjes-gold text-black rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                <Ticket size={20} />
                Pesan Sekarang
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {displayVouchers.map((voucher) => {
                  const isExpired = new Date(voucher.valid_until) <= new Date() || voucher.status !== 'active';
                  
                  return (
                    <div 
                      key={voucher.id} 
                      className={`group relative flex flex-col bg-white/5 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                        isExpired 
                          ? 'border-gray-700/50 opacity-70' 
                          : 'border-white/10 hover:border-arjes-gold/50'
                      }`}
                    >
                      {/* Badge Type */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(voucher.type)}`}>
                          {getTypeLabel(voucher.type)}
                        </span>
                      </div>

                      {/* Overlay expired jika voucher kadaluarsa */}
                      {isExpired && (
                        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            KADALUARSA
                          </span>
                        </div>
                      )}

                      {/* Bagian Atas: Info Voucher */}
                      <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className={`text-xl font-bold transition-colors ${
                              isExpired ? 'text-gray-500' : 'text-white group-hover:text-arjes-gold'
                            }`}>
                              {voucher.title}
                            </h3>
                            <span className={`inline-block px-2 py-0.5 mt-1 text-xs font-semibold rounded ${
                              isExpired 
                                ? 'bg-gray-500/20 text-gray-400' 
                                : 'bg-arjes-gold/20 text-arjes-gold'
                            }`}>
                              {formatDiscount(voucher)}
                            </span>
                          </div>
                          <Ticket className={
                            isExpired ? 'text-gray-500/20' : 'text-white/20 group-hover:text-arjes-gold/40'
                          } size={40} />
                        </div>
                        
                        <p className={`text-sm mb-4 leading-relaxed ${
                          isExpired ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {voucher.description}
                        </p>

                        {/* Usage Limit */}
                        {voucher.usage_limit && !isExpired && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                              Tersisa {voucher.usage_limit - voucher.used_count} dari {voucher.usage_limit} kali pakai
                            </div>
                          </div>
                        )}

                        <div className={`flex flex-col gap-1 text-xs ${
                          isExpired ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isExpired ? 'bg-gray-600' : 'bg-arjes-gold'
                            }`}></span>
                            {formatMinPurchase(voucher)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={12} />
                            {isExpired ? 'Kadaluarsa' : 'Berlaku'} s/d {formatDate(voucher.valid_until)}
                          </div>
                          {voucher.target_users && voucher.target_users.length > 0 && !isExpired && (
                            <div className="flex items-center gap-2 text-purple-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                              Voucher terbatas
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Garis Putus-putus Dekorasi */}
                      <div className="relative h-4 bg-black/20">
                        <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-white/20"></div>
                        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#0a0a0a] rounded-full -translate-y-1/2"></div>
                        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#0a0a0a] rounded-full -translate-y-1/2"></div>
                      </div>

                      {/* Bagian Bawah: Copy Code & Actions */}
                      <div className={`p-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                        isExpired ? 'bg-gray-900/20' : 'bg-black/20'
                      }`}>
                        <div className="w-full sm:w-auto">
                          <div className={`border border-dashed rounded px-3 py-2 text-center font-mono tracking-widest font-bold ${
                            isExpired 
                              ? 'bg-gray-900/40 border-gray-600 text-gray-500' 
                              : 'bg-black/40 border-white/10 text-arjes-gold'
                          }`}>
                            {voucher.code}
                          </div>
                          {!isExpired && (
                            <p className="text-xs text-gray-500 text-center mt-1">
                              Salin kode untuk digunakan
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          {!isExpired && (
                            <button
                              onClick={() => handleCheckVoucher(voucher.code)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-semibold"
                            >
                              Cek
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleCopy(voucher.code)}
                            disabled={isExpired}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                              ${isExpired 
                                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                                : copiedCode === voucher.code 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                                  : 'bg-arjes-gold text-black hover:bg-yellow-500 active:scale-95'
                              }`}
                          >
                            {copiedCode === voucher.code ? (
                              <>
                                <Check size={16} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy size={16} /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tips Section */}
              <div className="mt-12 p-6 bg-gradient-to-r from-arjes-gold/10 to-transparent border border-arjes-gold/20 rounded-2xl">
                <h3 className="text-xl font-bold text-arjes-gold mb-3">Tips Menggunakan Voucher</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-arjes-gold font-bold text-lg mb-2">1. Periksa Masa Berlaku</div>
                    <p className="text-gray-400 text-sm">Pastikan voucher masih berlaku sebelum digunakan</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-arjes-gold font-bold text-lg mb-2">2. Minimum Pembelian</div>
                    <p className="text-gray-400 text-sm">Beberapa voucher memerlukan minimum belanja tertentu</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-arjes-gold font-bold text-lg mb-2">3. Batas Penggunaan</div>
                    <p className="text-gray-400 text-sm">Perhatikan batas penggunaan voucher per user</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}