import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mejaAPI } from '../../api/meja';
import { useAuth } from '../../context/AuthContext';
import { 
  Table, Plus, Edit, Trash2, 
  CheckCircle, XCircle, RefreshCw, 
  Filter, Search, Users, 
  LayoutDashboard, LogOut, Menu, X, 
  ChevronDown, ChevronUp,
  Tag,
  Grid,
  List,
  Calendar
} from 'lucide-react';

const AdminTables = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // State Management
  const [mejaList, setMejaList] = useState([]);
  const [tipeList, setTipeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTipeModal, setShowTipeModal] = useState(false);
  const [selectedMeja, setSelectedMeja] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    meja_tipe_id: '',
    nomor: ''
  });
  const [tipeForm, setTipeForm] = useState({ nama: '' });
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tipeFilter, setTipeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nomor');

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [mejaResponse, tipeResponse] = await Promise.all([
        mejaAPI.getAll(),
        mejaAPI.getTipe()
      ]);
      
      setMejaList(mejaResponse.data || []);
      setTipeList(tipeResponse || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal memuat data meja. Periksa koneksi API.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Meja
  const handleAddMeja = async (e) => {
    e.preventDefault();
    
    if (!formData.meja_tipe_id || !formData.nomor) {
      alert('Semua field wajib diisi!');
      return;
    }
    
    const nomorRegex = /^[A-Z][0-9]{2}$/;
    if (!nomorRegex.test(formData.nomor)) {
      alert('Format nomor meja tidak valid! Gunakan format: A01, B12, C07');
      return;
    }
    
    try {
      const response = await mejaAPI.create(formData);
      
      if (response.success) {
        alert('Meja berhasil ditambahkan!');
        setShowAddModal(false);
        setFormData({ meja_tipe_id: '', nomor: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding meja:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMsg = Object.values(errors).flat().join(', ');
        alert(`Validasi gagal: ${errorMsg}`);
      } else {
        alert('Gagal menambahkan meja. Coba lagi.');
      }
    }
  };

  // Handle Edit Meja
  const handleEditMeja = async (e) => {
    e.preventDefault();
    
    if (!selectedMeja) return;
    
    try {
      const response = await mejaAPI.update(selectedMeja.id, {
        meja_tipe_id: formData.meja_tipe_id,
        nomor: formData.nomor,
        tersedia: formData.tersedia
      });
      
      if (response.success) {
        alert('Meja berhasil diperbarui!');
        setShowEditModal(false);
        setSelectedMeja(null);
        setFormData({ meja_tipe_id: '', nomor: '', tersedia: true });
        fetchData();
      }
    } catch (error) {
      console.error('Error updating meja:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMsg = Object.values(errors).flat().join(', ');
        alert(`Validasi gagal: ${errorMsg}`);
      } else {
        alert('Gagal memperbarui meja. Coba lagi.');
      }
    }
  };

  // Handle Delete Meja
  const handleDeleteMeja = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus meja ini?')) return;
    
    try {
      const response = await mejaAPI.delete(id);
      
      if (response.success) {
        alert('Meja berhasil dihapus!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting meja:', error);
      alert('Gagal menghapus meja. Coba lagi.');
    }
  };

  // Handle Toggle Availability
  const handleToggleAvailability = async (meja) => {
    try {
      const response = await mejaAPI.update(meja.id, {
        tersedia: !meja.tersedia
      });
      
      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Gagal mengubah status meja. Coba lagi.');
    }
  };

  // Handle Add Tipe Meja
  const handleAddTipe = async (e) => {
    e.preventDefault();
    
    if (!tipeForm.nama) {
      alert('Nama tipe meja wajib diisi!');
      return;
    }
    
    try {
      const response = await mejaAPI.createTipe({ nama: tipeForm.nama });
      
      if (response) {
        alert('Tipe meja berhasil ditambahkan!');
        setShowTipeModal(false);
        setTipeForm({ nama: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding tipe:', error);
      alert('Gagal menambahkan tipe meja. Coba lagi.');
    }
  };

  // Open Edit Modal
  const openEditModal = (meja) => {
    setSelectedMeja(meja);
    setFormData({
      meja_tipe_id: meja.meja_tipe_id,
      nomor: meja.nomor,
      tersedia: meja.tersedia
    });
    setShowEditModal(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({ meja_tipe_id: '', nomor: '', tersedia: true });
    setShowAddModal(true);
  };

  // Filter and Sort Functions
  const filteredMeja = mejaList.filter(meja => {
    const matchesSearch = meja.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meja.tipe?.nama.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'available' && meja.tersedia) ||
                         (statusFilter === 'occupied' && !meja.tersedia);
    
    const matchesTipe = tipeFilter === 'all' || 
                       meja.meja_tipe_id === parseInt(tipeFilter);
    
    return matchesSearch && matchesStatus && matchesTipe;
  });

  // Sort function
  const sortedMeja = [...filteredMeja].sort((a, b) => {
    switch(sortBy) {
      case 'nomor':
        return a.nomor.localeCompare(b.nomor);
      case 'tipe':
        return (a.tipe?.nama || '').localeCompare(b.tipe?.nama || '');
      case 'status':
        return (b.tersedia ? 1 : 0) - (a.tersedia ? 1 : 0);
      default:
        return 0;
    }
  });

  // Calculate stats
  const stats = {
    total: mejaList.length,
    available: mejaList.filter(m => m.tersedia).length,
    occupied: mejaList.filter(m => !m.tersedia).length,
    tipeCount: tipeList.length
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
              <Table size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">Arjes Admin</h1>
              <p className="text-xs text-gray-400">Manajemen Meja</p>
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
          
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-arjes-gold text-arjes-bg font-bold shadow-lg shadow-arjes-gold/20">
            <Table size={18} />
            <span className="text-sm font-medium">Manajemen Meja</span>
          </div>
          
          <Link 
            to="/admin/menu" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <Users size={18} />
            <span className="text-sm font-medium">Manajemen Menu</span>
          </Link>

          <Link 
            to="/admin/booking" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <Calendar size={18} />
            <span className="text-sm font-medium">Manajemen booking</span>
          </Link>
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
              <Menu size={24} />
            </button>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Manajemen Meja</h1>
              <p className="text-gray-400 text-sm mt-1">Kelola ketersediaan dan tipe meja restoran</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
            >
              <Plus size={18} />
              Tambah Meja
            </button>
            
            <button 
              onClick={() => setShowTipeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Tag size={18} />
              Tipe Meja
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
                <p className="text-sm text-gray-400">Total Meja</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Table className="text-arjes-gold" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tersedia</p>
                <h3 className="text-3xl font-bold text-green-400 mt-1">{stats.available}</h3>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Terpakai</p>
                <h3 className="text-3xl font-bold text-red-400 mt-1">{stats.occupied}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl">
                <XCircle className="text-red-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Jenis Meja</p>
                <h3 className="text-3xl font-bold text-blue-400 mt-1">{stats.tipeCount}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Tag className="text-blue-400" size={24} />
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
                  placeholder="Cari meja atau tipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-64 bg-black/30 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-arjes-gold"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/30 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-arjes-gold"
              >
                <option value="all">Semua Status</option>
                <option value="available">Tersedia</option>
                <option value="occupied">Terpakai</option>
              </select>
              
              <select
                value={tipeFilter}
                onChange={(e) => setTipeFilter(e.target.value)}
                className="bg-black/30 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-arjes-gold"
              >
                <option value="all">Semua Tipe</option>
                {tipeList.map(tipe => (
                  <option key={tipe.id} value={tipe.id}>
                    {tipe.nama}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/30 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-arjes-gold"
              >
                <option value="nomor">Urutkan: Nomor</option>
                <option value="tipe">Urutkan: Tipe</option>
                <option value="status">Urutkan: Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* MEJA TABLE */}
        <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-white">Daftar Meja</h3>
            <p className="text-sm text-gray-400 mt-1">
              {filteredMeja.length} meja ditemukan dari total {mejaList.length} meja
            </p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-arjes-gold"></div>
              <p className="text-gray-400 mt-4">Memuat data meja...</p>
            </div>
          ) : sortedMeja.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-white/5 rounded-full mb-4">
                <Table className="text-gray-600" size={40} />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">Tidak ada meja</h4>
              <p className="text-gray-400 mb-6">Belum ada meja yang terdaftar atau hasil filter kosong</p>
              <button 
                onClick={openAddModal}
                className="px-6 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
              >
                <Plus size={18} className="inline mr-2" />
                Tambah Meja Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30 text-gray-400 text-sm font-bold">
                  <tr>
                    <th className="p-4 text-left">Nomor Meja</th>
                    <th className="p-4 text-left">Tipe Meja</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Terakhir Diubah</th>
                    <th className="p-4 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedMeja.map(meja => (
                    <tr key={meja.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            meja.tersedia 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {meja.nomor}
                          </div>
                          <span className="text-white font-bold">{meja.nomor}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-gray-500" />
                          <span className="text-white">{meja.tipe?.nama || 'Tidak ada tipe'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailability(meja)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            meja.tersedia 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {meja.tersedia ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle size={12} /> Tersedia
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle size={12} /> Terpakai
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(meja.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(meja)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMeja(meja.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Total meja: {mejaList.length} • Tersedia: {stats.available} • Terpakai: {stats.occupied}</p>
          <p className="mt-1">Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}</p>
        </div>
      </main>

      {/* --- MODAL TAMBAH MEJA --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Tambah Meja Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddMeja} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipe Meja</label>
                <select
                  value={formData.meja_tipe_id}
                  onChange={(e) => setFormData({...formData, meja_tipe_id: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                >
                  <option value="">Pilih Tipe Meja</option>
                  {tipeList.map(tipe => (
                    <option key={tipe.id} value={tipe.id}>{tipe.nama}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nomor Meja</label>
                <input
                  type="text"
                  value={formData.nomor}
                  onChange={(e) => setFormData({...formData, nomor: e.target.value.toUpperCase()})}
                  placeholder="Contoh: A01, B12, C07"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Format: Huruf + 2 angka (A01, B12, C07)</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
                >
                  Simpan Meja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT MEJA --- */}
      {showEditModal && selectedMeja && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Edit Meja {selectedMeja.nomor}</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditMeja} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipe Meja</label>
                <select
                  value={formData.meja_tipe_id}
                  onChange={(e) => setFormData({...formData, meja_tipe_id: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                >
                  <option value="">Pilih Tipe Meja</option>
                  {tipeList.map(tipe => (
                    <option key={tipe.id} value={tipe.id}>{tipe.nama}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nomor Meja</label>
                <input
                  type="text"
                  value={formData.nomor}
                  onChange={(e) => setFormData({...formData, nomor: e.target.value.toUpperCase()})}
                  placeholder="Contoh: A01, B12, C07"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tersedia: true})}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      formData.tersedia 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Tersedia
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tersedia: false})}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      !formData.tersedia 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Terpakai
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL TIPE MEJA --- */}
      {showTipeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Kelola Tipe Meja</h3>
              <button 
                onClick={() => setShowTipeModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Form Tambah Tipe */}
              <form onSubmit={handleAddTipe} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nama Tipe Baru</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={tipeForm.nama}
                      onChange={(e) => setTipeForm({nama: e.target.value})}
                      placeholder="Contoh: Reguler, VIP, Family"
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </form>
              
              {/* Daftar Tipe */}
              <div>
                <h4 className="text-white font-bold mb-4">Daftar Tipe Meja</h4>
                {tipeList.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Belum ada tipe meja</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tipeList.map(tipe => (
                      <div 
                        key={tipe.id} 
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <Tag size={20} className="text-arjes-gold" />
                          <span className="text-white font-medium">{tipe.nama}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {mejaList.filter(m => m.meja_tipe_id === tipe.id).length} meja
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowTipeModal(false)}
                  className="w-full px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTables;