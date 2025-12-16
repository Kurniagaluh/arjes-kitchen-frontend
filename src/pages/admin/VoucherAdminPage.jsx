import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import voucherAPI from '../../api/voucher'; // Import voucherAPI
import {
  Ticket, Plus, Trash2, Edit2, Copy, Filter, Search,
  Calendar, Users, DollarSign, Percent, Check, X,
  Eye, Download, RefreshCw, AlertCircle, Clock,
  ChevronLeft, ChevronRight, Tag, Hash, FileText,
  BarChart3, TrendingUp, Shield, Zap,
  CreditCard, Gift, Star, Key, QrCode, Users as UsersIcon
} from 'lucide-react';

// Helper functions
const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return formatRp(new Date(dateString), 'dd MMM yyyy');
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return formatRp(new Date(dateString), 'dd MMM yyyy HH:mm');
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    aktif: { 
      color: 'bg-green-500/20 text-green-400 border-green-500/30', 
      icon: Check,
      label: 'Aktif' 
    },
    nonaktif: { 
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', 
      icon: X,
      label: 'Nonaktif' 
    },
    habis: { 
      color: 'bg-red-500/20 text-red-400 border-red-500/30', 
      icon: AlertCircle,
      label: 'Habis' 
    }
  };

  const config = statusConfig[status] || statusConfig.nonaktif;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </div>
  );
};

// Main Component
const VoucherAdminPage = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [editing, setEditing] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  // Form state
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    deskripsi: '',
    tipe_diskon: 'persen',
    diskon_persen: '',
    diskon_nominal: '',
    maksimum_diskon: '',
    minimum_order: '',
    limit_penggunaan: '',
    status: 'aktif',
    tanggal_mulai: '',
    expired_at: '',
    hanya_untuk_user_tertentu: false,
    user_ids: []
  });

  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    aktif: 0,
    habis: 0,
    expired: 0,
    penggunaan_hari_ini: 0
  });

  // Fetch vouchers
    const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = {
        status: filters.status,
        search: filters.search,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        page: pagination.current_page,
        per_page: pagination.per_page
      };

      // Hapus parameter kosong
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await voucherAPI.getAll(params); // ⬅️ Gunakan voucherAPI
      const data = response.data;
      
      setVouchers(data.data || data);
      
      if (data.meta) {
        setPagination({
          current_page: data.meta.current_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
          last_page: data.meta.last_page
        });
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics menggunakan voucherAPI
  const fetchStatistics = async () => {
    try {
      const response = await voucherAPI.getStatistics(); // ⬅️ Gunakan voucherAPI
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Generate voucher code menggunakan voucherAPI
  const generateCode = async () => {
    try {
      const response = await voucherAPI.generateCode(); // ⬅️ Gunakan voucherAPI
      setFormData(prev => ({ 
        ...prev, 
        kode: response.data.kode || response.data.code 
      }));
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  // Search users menggunakan voucherAPI
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await voucherAPI.searchUsers(query); // ⬅️ Gunakan voucherAPI
      setSearchResults(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // ⚠️ PERBAIKAN 2: Handle form submission menggunakan voucherAPI
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...formData,
        diskon_persen: formData.tipe_diskon === 'persen' ? parseInt(formData.diskon_persen) : null,
        diskon_nominal: formData.tipe_diskon === 'nominal' ? parseInt(formData.diskon_nominal) : null,
        maksimum_diskon: formData.maksimum_diskon ? parseInt(formData.maksimum_diskon) : null,
        minimum_order: parseInt(formData.minimum_order),
        limit_penggunaan: parseInt(formData.limit_penggunaan),
        user_ids: formData.hanya_untuk_user_tertentu ? formData.user_ids.map(id => parseInt(id)) : []
      };

      if (editing && selectedVoucher) {
        await voucherAPI.update(selectedVoucher.id, dataToSend); // ⬅️ Gunakan voucherAPI
      } else {
        await voucherAPI.create(dataToSend); // ⬅️ Gunakan voucherAPI
      }

      setShowModal(false);
      resetForm();
      fetchVouchers();
      fetchStatistics();
    } catch (error) {
      console.error('Error saving voucher:', error);
      // Show error message
      if (error.response?.data?.errors) {
        alert(JSON.stringify(error.response.data.errors));
      }
    }
  };

  // ⚠️ PERBAIKAN 3: Handle delete menggunakan voucherAPI
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus voucher ini?')) return;

    try {
      await voucherAPI.delete(id); // ⬅️ Gunakan voucherAPI
      fetchVouchers();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting voucher:', error);
    }
  };

  // ⚠️ PERBAIKAN 4: Open detail modal dengan fetch detail
  const openDetailModal = async (voucher) => {
    try {
      const response = await voucherAPI.getById(voucher.id); // ⬅️ Gunakan voucherAPI
      setSelectedVoucher(response.data.data || response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching voucher details:', error);
    }
  };



  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Kode', 'Nama', 'Tipe Diskon', 'Diskon', 'Min Order', 'Limit', 'Digunakan', 'Status', 'Expired At'];
    const csvData = vouchers.map(v => [
      v.kode,
      v.nama || '-',
      v.tipe_diskon === 'persen' ? 'Persentase' : 'Nominal',
      v.tipe_diskon === 'persen' ? `${v.diskon_persen}%` : formatRp(v.diskon_nominal),
      formatRp(v.minimum_order),
      v.limit_penggunaan,
      v.penggunaan_sekarang,
      v.status,
      v.expired_at ? formatDate(v.expired_at) : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Effect for fetching data
  useEffect(() => {
    fetchVouchers();
    fetchStatistics();
  }, [filters, pagination.current_page]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (userSearch) {
        searchUsers(userSearch);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [userSearch]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Kelola Kode Promo</h2>
          <p className="text-gray-400">Buat dan kelola voucher promo untuk pelanggan</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1F18] border border-white/10 text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <Download size={18} />
            <span className="hidden md:inline">Export CSV</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-all"
          >
            <Plus size={18} />
            <span>Buat Voucher</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F1F18] border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Total Voucher</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Ticket className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#0F1F18] border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Voucher Aktif</p>
              <p className="text-2xl font-bold text-green-400">{stats.aktif}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Check className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#0F1F18] border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Voucher Habis</p>
              <p className="text-2xl font-bold text-red-400">{stats.habis}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertCircle className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#0F1F18] border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">Penggunaan Hari Ini</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.penggunaan_hari_ini}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <TrendingUp className="text-yellow-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0F1F18] border border-white/10 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari kode atau nama voucher..."
                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2.5 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="habis">Habis</option>
            </select>
            <button
              onClick={() => setFilters({
                status: '',
                search: '',
                sort_by: 'created_at',
                sort_order: 'desc'
              })}
              className="flex items-center gap-2 px-4 py-2.5 bg-black/30 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-all"
            >
              <RefreshCw size={18} />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-arjes-gold"></div>
            <p className="mt-2 text-gray-400">Memuat data voucher...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kode</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Diskon</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Min. Order</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Limit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expired</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        <Ticket className="mx-auto mb-2 text-gray-400" size={32} />
                        <p>Tidak ada voucher ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-arjes-gold text-lg">{voucher.kode}</span>
                            <button
                              onClick={() => copyToClipboard(voucher.kode)}
                              className="p-1 text-gray-400 hover:text-arjes-gold transition-colors"
                              title="Salin kode"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Digunakan: {voucher.penggunaan_sekarang}/{voucher.limit_penggunaan}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{voucher.nama || '-'}</div>
                          {voucher.deskripsi && (
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {voucher.deskripsi}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {voucher.tipe_diskon === 'persen' ? (
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-green-500/10 rounded-lg">
                                <Percent size={18} className="text-green-400" />
                              </div>
                              <div>
                                <span className="font-bold text-green-400">{voucher.diskon_persen}%</span>
                                {voucher.maksimum_diskon && (
                                  <p className="text-xs text-gray-500">
                                    Maks: {formatRp(voucher.maksimum_diskon)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <DollarSign size={18} className="text-blue-400" />
                              </div>
                              <div>
                                <span className="font-bold text-blue-400">{formatRp(voucher.diskon_nominal)}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <CreditCard size={18} className="text-purple-400" />
                            </div>
                            <span className="font-medium text-white">{formatRp(voucher.minimum_order)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                              <Hash size={18} className="text-yellow-400" />
                            </div>
                            <div>
                              <span className="font-medium text-white">{voucher.limit_penggunaan}x</span>
                              {voucher.hanya_untuk_user_tertentu && (
                                <p className="text-xs text-purple-400 flex items-center gap-1 mt-1">
                                  <UsersIcon size={12} /> Terbatas
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={voucher.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-500/10 rounded-lg">
                              <Calendar size={18} className="text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm text-white">
                                {voucher.expired_at ? formatDate(voucher.expired_at) : '-'}
                              </div>
                              {voucher.expired_at && (
                                <div className={`text-xs ${new Date(voucher.expired_at) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                                  {new Date(voucher.expired_at) < new Date() ? 'Kadaluarsa' : 'Aktif'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetailModal(voucher)}
                              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                              title="Detail"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => openEditModal(voucher)}
                              className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(voucher.id)}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Menampilkan <span className="font-medium text-white">{(pagination.current_page - 1) * pagination.per_page + 1}</span> sampai{' '}
                    <span className="font-medium text-white">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </span>{' '}
                    dari <span className="font-medium text-white">{pagination.total}</span> voucher
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                      disabled={pagination.current_page === 1}
                      className="p-2 border border-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="px-3 py-1 bg-arjes-gold text-arjes-bg rounded-lg font-medium">
                      {pagination.current_page}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                      disabled={pagination.current_page === pagination.last_page}
                      className="p-2 border border-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-arjes-gold/10 rounded-lg">
                    {editing ? <Edit2 className="text-arjes-gold" size={24} /> : <Plus className="text-arjes-gold" size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{editing ? 'Edit Voucher' : 'Buat Voucher Baru'}</h3>
                    <p className="text-sm text-gray-400">Isi detail voucher di bawah ini</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kode */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Hash size={16} />
                      Kode Voucher *
                    </div>
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      required
                      className="flex-1 px-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none uppercase"
                      value={formData.kode}
                      onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value.toUpperCase() }))}
                      placeholder="ARJES20"
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw size={18} />
                      Generate
                    </button>
                  </div>
                </div>

                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      Nama Voucher
                    </div>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Diskon Spesial"
                  />
                </div>

                {/* Tipe Diskon */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Percent size={16} />
                      Tipe Diskon *
                    </div>
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                    value={formData.tipe_diskon}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipe_diskon: e.target.value }))}
                  >
                    <option value="persen">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>

                {/* Diskon Persen */}
                {formData.tipe_diskon === 'persen' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Percent size={16} />
                        Diskon Persen *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                        value={formData.diskon_persen}
                        onChange={(e) => setFormData(prev => ({ ...prev, diskon_persen: e.target.value }))}
                        placeholder="20"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Percent className="text-gray-400" size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Diskon Nominal */}
                {formData.tipe_diskon === 'nominal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        Diskon Nominal *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                        value={formData.diskon_nominal}
                        onChange={(e) => setFormData(prev => ({ ...prev, diskon_nominal: e.target.value }))}
                        placeholder="10000"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <DollarSign className="text-gray-400" size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Maksimum Diskon */}
                {formData.tipe_diskon === 'persen' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Shield size={16} />
                        Maksimum Diskon
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                        value={formData.maksimum_diskon}
                        onChange={(e) => setFormData(prev => ({ ...prev, maksimum_diskon: e.target.value }))}
                        placeholder="50000"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <DollarSign className="text-gray-400" size={20} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Minimum Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      Minimum Order *
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                      value={formData.minimum_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimum_order: e.target.value }))}
                      placeholder="50000"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                {/* Limit Penggunaan */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Hash size={16} />
                      Limit Penggunaan *
                    </div>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                    value={formData.limit_penggunaan}
                    onChange={(e) => setFormData(prev => ({ ...prev, limit_penggunaan: e.target.value }))}
                    placeholder="100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={16} />
                      Status
                    </div>
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                {/* Tanggal Mulai */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Tanggal Mulai
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                      value={formData.tanggal_mulai}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Calendar className="text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                {/* Tanggal Expired */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Tanggal Kadaluarsa
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                      value={formData.expired_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, expired_at: e.target.value }))}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Calendar className="text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Deskripsi
                    </div>
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                    placeholder="Deskripsi voucher..."
                  />
                </div>

                {/* Untuk User Tertentu */}
                <div className="col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="hanya_untuk_user_tertentu"
                      className="rounded border-white/20 text-arjes-gold focus:ring-arjes-gold bg-black/30"
                      checked={formData.hanya_untuk_user_tertentu}
                      onChange={(e) => setFormData(prev => ({ ...prev, hanya_untuk_user_tertentu: e.target.checked }))}
                    />
                    <label htmlFor="hanya_untuk_user_tertentu" className="text-sm font-medium text-white flex items-center gap-2">
                      <Users size={16} />
                      Hanya untuk user tertentu
                    </label>
                  </div>

                  {formData.hanya_untuk_user_tertentu && (
                    <div className="space-y-4 p-4 bg-black/20 rounded-xl border border-white/10">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          <div className="flex items-center gap-2">
                            <Search size={16} />
                            Cari User
                          </div>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-arjes-gold focus:border-arjes-gold outline-none"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Cari user dengan nama atau email..."
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Search className="text-gray-400" size={20} />
                          </div>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-[#0F1F18] border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                              <div
                                key={user.id}
                                className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/10 last:border-b-0"
                                onClick={() => addUserToVoucher(user)}
                              >
                                <div className="font-medium text-white">{user.name}</div>
                                <div className="text-sm text-gray-400">{user.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Users */}
                      {formData.user_ids.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            User Terpilih ({formData.user_ids.length})
                          </label>
                          <div className="flex flex-wrap gap-2 p-4 bg-black/30 rounded-xl border border-white/10">
                            {formData.user_ids.map((userId) => (
                              <div
                                key={userId}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full"
                              >
                                <Users size={14} className="text-gray-400" />
                                <span className="text-sm text-white">User #{userId}</span>
                                <button
                                  type="button"
                                  onClick={() => removeUserFromVoucher(userId)}
                                  className="p-0.5 hover:bg-red-500/20 rounded-full"
                                >
                                  <X size={14} className="text-gray-400 hover:text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-all"
                >
                  {editing ? 'Update Voucher' : 'Buat Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden w-full max-w-lg">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-arjes-gold/10 rounded-lg">
                    <Ticket className="text-arjes-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Detail Voucher</h3>
                    <p className="text-sm text-gray-400">{selectedVoucher.kode}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="text-gray-400" size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-arjes-gold/10 to-transparent p-6 rounded-xl border border-arjes-gold/20">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-arjes-gold mb-2">{selectedVoucher.kode}</div>
                  <div className="text-lg font-bold text-white mb-1">{selectedVoucher.nama || 'Voucher'}</div>
                  <div className="text-sm text-gray-400">{selectedVoucher.deskripsi}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedVoucher.tipe_diskon === 'persen' ? (
                      <Percent className="text-green-400" size={18} />
                    ) : (
                      <DollarSign className="text-blue-400" size={18} />
                    )}
                    <span className="text-sm text-gray-400">Tipe Diskon</span>
                  </div>
                  <p className="font-medium text-white">
                    {selectedVoucher.tipe_diskon === 'persen' ? 'Persentase' : 'Nominal'}
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="text-purple-400" size={18} />
                    <span className="text-sm text-gray-400">Nilai Diskon</span>
                  </div>
                  <p className="font-bold text-xl text-arjes-gold">
                    {selectedVoucher.tipe_diskon === 'persen' 
                      ? `${selectedVoucher.diskon_persen}%`
                      : formatRp(selectedVoucher.diskon_nominal)}
                  </p>
                </div>

                {selectedVoucher.maksimum_diskon && (
                  <div className="bg-black/30 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="text-yellow-400" size={18} />
                      <span className="text-sm text-gray-400">Maksimum Diskon</span>
                    </div>
                    <p className="font-medium text-white">{formatRp(selectedVoucher.maksimum_diskon)}</p>
                  </div>
                )}

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="text-blue-400" size={18} />
                    <span className="text-sm text-gray-400">Minimum Order</span>
                  </div>
                  <p className="font-medium text-white">{formatRp(selectedVoucher.minimum_order)}</p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="text-green-400" size={18} />
                    <span className="text-sm text-gray-400">Limit Penggunaan</span>
                  </div>
                  <p className="font-medium text-white">{selectedVoucher.limit_penggunaan}x</p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="text-purple-400" size={18} />
                    <span className="text-sm text-gray-400">Digunakan</span>
                  </div>
                  <p className="font-medium text-white">
                    {selectedVoucher.penggunaan_sekarang}/{selectedVoucher.limit_penggunaan}
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-yellow-400" size={18} />
                    <span className="text-sm text-gray-400">Status</span>
                  </div>
                  <StatusBadge status={selectedVoucher.status} />
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-400">Tanggal Mulai</span>
                  </div>
                  <p className="font-medium text-white">
                    {selectedVoucher.tanggal_mulai ? formatDate(selectedVoucher.tanggal_mulai) : '-'}
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-400">Tanggal Kadaluarsa</span>
                  </div>
                  <p className="font-medium text-white">
                    {selectedVoucher.expired_at ? formatDateTime(selectedVoucher.expired_at) : '-'}
                  </p>
                </div>

                <div className="col-span-2 bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-purple-400" size={18} />
                    <span className="text-sm text-gray-400">Hanya untuk User Tertentu</span>
                  </div>
                  <p className="font-medium text-white">
                    {selectedVoucher.hanya_untuk_user_tertentu ? 'Ya' : 'Tidak'}
                  </p>
                  {selectedVoucher.hanya_untuk_user_tertentu && selectedVoucher.user_ids && selectedVoucher.user_ids.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedVoucher.user_ids.length} user terpilih
                    </p>
                  )}
                </div>

                <div className="col-span-2 bg-black/30 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-400">Dibuat pada</span>
                  </div>
                  <p className="font-medium text-white">{formatDateTime(selectedVoucher.created_at)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => copyToClipboard(selectedVoucher.kode)}
                  className="px-6 py-3 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <Copy size={18} />
                  Salin Kode
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedVoucher);
                  }}
                  className="px-6 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-all"
                >
                  Edit Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherAdminPage;