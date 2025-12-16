import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Utensils, Plus, Edit, Trash2, 
  CheckCircle, XCircle, RefreshCw, 
  Filter, Search, Image, 
  LayoutDashboard, LogOut, Menu as MenuIcon, X, 
  DollarSign, Tag, Eye, EyeOff,
  Upload, Download, ChevronLeft, ChevronRight,
  Loader2, AlertCircle
} from 'lucide-react';
import { menuAPI } from '../../api/menu';
import { useAuth } from '../../context/AuthContext';

// Helper format Rupiah
const formatRp = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const ManageMenu = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // State Management
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    gambar_url: '',
    tersedia: true
  });
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, unavailable
  const [sortBy, setSortBy] = useState('nama'); // nama, harga, terbaru
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  
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
      const response = await menuAPI.getAll();
      setMenuList(response || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      showAlert('Gagal memuat data menu. Periksa koneksi API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menampilkan alert
  const showAlert = (message, type = 'info') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    alert(message); // Untuk sementara pakai alert biasa
  };

  // ============ HANDLE IMAGE UPLOAD ============
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showAlert('Ukuran file maksimal 2MB', 'error');
      return;
    }
    
    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showAlert('Format file harus JPG, PNG, WebP, atau GIF', 'error');
      return;
    }
    
    try {
      setUploading(true);
      
      // Upload ke server
      const uploadResponse = await menuAPI.uploadImage(file);
      
      if (uploadResponse.success) {
        // Simpan URL dari server ke formData
        setFormData(prev => ({ 
          ...prev, 
          gambar_url: uploadResponse.url 
        }));
        showAlert('✅ Gambar berhasil diupload!', 'success');
      } else {
        showAlert(`❌ ${uploadResponse.message || 'Gagal mengupload gambar'}`, 'error');
        if (uploadResponse.errors) {
          console.error('Upload errors:', uploadResponse.errors);
        }
      }
      
      // Reset input file
      e.target.value = '';
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMsg = Object.values(errors).flat().join(', ');
        showAlert(`❌ Validasi gagal: ${errorMsg}`, 'error');
      } else if (error.response?.status === 413) {
        showAlert('❌ File terlalu besar! Maksimal 2MB', 'error');
      } else if (error.response?.status === 401) {
        showAlert('❌ Anda harus login terlebih dahulu!', 'error');
        logout();
      } else {
        showAlert('❌ Gagal mengupload gambar. Coba lagi.', 'error');
      }
      
      // Reset input file
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  // ============ HANDLE DELETE IMAGE ============
  const handleDeleteImage = async (menuId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;
    
    try {
      const response = await menuAPI.deleteImage(menuId);
      
      if (response.success) {
        showAlert('✅ Gambar berhasil dihapus!', 'success');
        fetchData(); // Refresh data
      } else {
        showAlert(`❌ ${response.message || 'Gagal menghapus gambar'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showAlert('❌ Gagal menghapus gambar. Coba lagi.', 'error');
    }
  };

  // ============ HANDLE ADD MENU ============
  const handleAddMenu = async (e) => {
    e.preventDefault();
    
    if (!formData.nama.trim() || !formData.harga) {
      showAlert('❌ Nama dan harga wajib diisi!', 'error');
      return;
    }
    
    try {
      const dataToSend = {
        nama: formData.nama.trim(),
        harga: Number(formData.harga),
        deskripsi: formData.deskripsi?.trim() || '',
        tersedia: formData.tersedia
      };
      
      // Hanya kirim gambar_url jika ada dan valid
      if (formData.gambar_url && formData.gambar_url.trim() !== '') {
        dataToSend.gambar_url = formData.gambar_url;
      }
      
      console.log('Mengirim data menu baru:', dataToSend);
      
      const response = await menuAPI.create(dataToSend);
      
      if (response) {
        showAlert('✅ Menu berhasil ditambahkan!', 'success');
        setShowAddModal(false);
        setFormData({
          nama: '',
          harga: '',
          deskripsi: '',
          gambar_url: '',
          tersedia: true
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding menu:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMsg = Object.values(errors).flat().join(', ');
        showAlert(`❌ Validasi gagal: ${errorMsg}`, 'error');
      } else if (error.response?.status === 401) {
        showAlert('❌ Anda harus login sebagai admin!', 'error');
        logout();
      } else {
        showAlert('❌ Gagal menambahkan menu. Coba lagi.', 'error');
      }
    }
  };

  // ============ HANDLE EDIT MENU ============
  const handleEditMenu = async (e) => {
    e.preventDefault();
    
    if (!selectedMenu) return;
    
    try {
      const dataToSend = {
        nama: formData.nama.trim(),
        harga: Number(formData.harga),
        deskripsi: formData.deskripsi?.trim() || '',
        tersedia: formData.tersedia
      };
      
      // Cek apakah gambar berubah
      if (formData.gambar_url !== selectedMenu.gambar_url) {
        if (formData.gambar_url && formData.gambar_url.trim() !== '') {
          dataToSend.gambar_url = formData.gambar_url;
        } else {
          // Jika gambar dihapus, kirim null
          dataToSend.gambar_url = null;
        }
      }
      
      console.log('Mengirim data update menu:', dataToSend);
      
      const response = await menuAPI.update(selectedMenu.id, dataToSend);
      
      if (response) {
        showAlert('✅ Menu berhasil diperbarui!', 'success');
        setShowEditModal(false);
        setSelectedMenu(null);
        setFormData({
          nama: '',
          harga: '',
          deskripsi: '',
          gambar_url: '',
          tersedia: true
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMsg = Object.values(errors).flat().join(', ');
        showAlert(`❌ Validasi gagal: ${errorMsg}`, 'error');
      } else if (error.response?.status === 401) {
        showAlert('❌ Anda harus login sebagai admin!', 'error');
        logout();
      } else if (error.response?.status === 404) {
        showAlert('❌ Menu tidak ditemukan!', 'error');
      } else {
        showAlert('❌ Gagal memperbarui menu. Coba lagi.', 'error');
      }
    }
  };

  // ============ HANDLE DELETE MENU ============
  const handleDeleteMenu = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;
    
    try {
      const response = await menuAPI.delete(id);
      
      if (response) {
        showAlert('✅ Menu berhasil dihapus!', 'success');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      showAlert('❌ Gagal menghapus menu. Coba lagi.', 'error');
    }
  };

  // ============ HANDLE TOGGLE AVAILABILITY ============
  const handleToggleAvailability = async (menu) => {
    try {
      const response = await menuAPI.update(menu.id, {
        tersedia: !menu.tersedia
      });
      
      if (response) {
        showAlert(`✅ Menu berhasil ditandai sebagai ${!menu.tersedia ? 'Tersedia' : 'Habis'}!`, 'success');
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      showAlert('❌ Gagal mengubah status menu. Coba lagi.', 'error');
    }
  };

  // ============ OPEN EDIT MODAL ============
  const openEditModal = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      nama: menu.nama,
      harga: menu.harga,
      deskripsi: menu.deskripsi || '',
      gambar_url: menu.gambar_url || '',
      tersedia: menu.tersedia
    });
    setShowEditModal(true);
  };

  // ============ OPEN DETAIL MODAL ============
  const openDetailModal = (menu) => {
    setSelectedMenu(menu);
    setShowDetailModal(true);
  };

  // ============ OPEN ADD MODAL ============
  const openAddModal = () => {
    setFormData({
      nama: '',
      harga: '',
      deskripsi: '',
      gambar_url: '',
      tersedia: true
    });
    setShowAddModal(true);
  };

  // ============ HANDLE IMAGE URL CHANGE ============
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, gambar_url: url }));
  };

  // ============ RESET ALL FILTERS ============
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('nama');
    setPriceRange([0, 1000000]);
    setCurrentPage(1);
  };

  // ============ BULK AVAILABILITY TOGGLE ============
  const handleBulkAvailability = async (status) => {
    if (filteredMenu.length === 0) {
      showAlert('Tidak ada menu yang dipilih untuk diubah!', 'warning');
      return;
    }
    
    if (!confirm(`Apakah Anda yakin ingin mengubah status ${filteredMenu.length} menu menjadi ${status ? 'Tersedia' : 'Habis'}?`)) return;
    
    try {
      const promises = filteredMenu.map(menu => 
        menuAPI.update(menu.id, { tersedia: status })
      );
      
      await Promise.all(promises);
      showAlert(`Status ${filteredMenu.length} menu berhasil diperbarui!`, 'success');
      fetchData();
    } catch (error) {
      console.error('Error updating bulk availability:', error);
      showAlert('Gagal mengubah status menu. Coba lagi.', 'error');
    }
  };

  // ============ FILTER AND SORT FUNCTIONS ============
  const filteredMenu = menuList.filter(item => {
    // Search filter
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'available' && item.tersedia) ||
                         (statusFilter === 'unavailable' && !item.tersedia);
    
    // Price filter
    const matchesPrice = item.harga >= priceRange[0] && item.harga <= priceRange[1];
    
    return matchesSearch && matchesStatus && matchesPrice;
  });

  // Sort function
  const sortedMenu = [...filteredMenu].sort((a, b) => {
    switch(sortBy) {
      case 'nama':
        return a.nama.localeCompare(b.nama);
      case 'harga':
        return a.harga - b.harga;
      case 'terbaru':
        return new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at);
      default:
        return 0;
    }
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedMenu.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedMenu.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate stats
  const stats = {
    total: menuList.length,
    available: menuList.filter(m => m.tersedia).length,
    unavailable: menuList.filter(m => !m.tersedia).length,
    averagePrice: menuList.length > 0 
      ? menuList.reduce((sum, item) => sum + item.harga, 0) / menuList.length 
      : 0,
    highestPrice: menuList.length > 0 
      ? Math.max(...menuList.map(item => item.harga))
      : 0,
    lowestPrice: menuList.length > 0 
      ? Math.min(...menuList.map(item => item.harga))
      : 0
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
              <Utensils size={24} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">Arjes Admin</h1>
              <p className="text-xs text-gray-400">Manajemen Menu</p>
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
            to="/admin/tables" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
          >
            <Tag size={18} />
            <span className="text-sm font-medium">Manajemen Meja</span>
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-arjes-gold text-arjes-bg font-bold shadow-lg shadow-arjes-gold/20">
            <Utensils size={18} />
            <span className="text-sm font-medium">Manajemen Menu</span>
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
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Manajemen Menu</h1>
              <p className="text-gray-400 text-sm mt-1">Kelola menu makanan dan minuman restoran</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
            >
              <Plus size={18} />
              Tambah Menu
            </button>
            
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Refresh'}
            </button>
            
            <button 
              onClick={() => {
                const dataStr = JSON.stringify(menuList, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `menu-data-${new Date().toISOString().split('T')[0]}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Menu</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Utensils className="text-arjes-gold" size={24} />
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
                <p className="text-sm text-gray-400">Habis</p>
                <h3 className="text-3xl font-bold text-red-400 mt-1">{stats.unavailable}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl">
                <XCircle className="text-red-400" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rata-rata Harga</p>
                <h3 className="text-3xl font-bold text-blue-400 mt-1">{formatRp(stats.averagePrice)}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <DollarSign className="text-blue-400" size={24} />
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
                  placeholder="Cari menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-64 bg-black/30 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-arjes-gold"
                />
              </div>
              
              {/* Bulk Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleBulkAvailability(true)}
                  className="px-4 py-2.5 bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl hover:bg-green-500/30 transition-colors text-sm font-medium"
                  disabled={filteredMenu.length === 0}
                >
                  <CheckCircle size={16} className="inline mr-2" />
                  Tandai Semua Tersedia
                </button>
                <button
                  onClick={() => handleBulkAvailability(false)}
                  className="px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium"
                  disabled={filteredMenu.length === 0}
                >
                  <XCircle size={16} className="inline mr-2" />
                  Tandai Semua Habis
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
                <option value="available">Tersedia</option>
                <option value="unavailable">Habis</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/30 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-arjes-gold"
              >
                <option value="nama">Urutkan: Nama</option>
                <option value="harga">Urutkan: Harga</option>
                <option value="terbaru">Urutkan: Terbaru</option>
              </select>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Harga:</span>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-24 accent-arjes-gold"
                />
                <span className="text-sm text-white min-w-[80px]">{formatRp(priceRange[0])}</span>
                <span className="text-gray-500">-</span>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-24 accent-arjes-gold"
                />
                <span className="text-sm text-white min-w-[80px]">{formatRp(priceRange[1])}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MENU GRID */}
        <div className="bg-[#0F1F18] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-white">Daftar Menu</h3>
            <p className="text-sm text-gray-400 mt-1">
              Menampilkan {currentItems.length} menu dari {filteredMenu.length} hasil filter (total: {menuList.length} menu)
            </p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-arjes-gold"></div>
              <p className="text-gray-400 mt-4">Memuat data menu...</p>
            </div>
          ) : sortedMenu.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-white/5 rounded-full mb-4">
                <Utensils className="text-gray-600" size={40} />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">Tidak ada menu</h4>
              <p className="text-gray-400 mb-6">Belum ada menu yang terdaftar atau hasil filter kosong</p>
              <button 
                onClick={openAddModal}
                className="px-6 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors"
              >
                <Plus size={18} className="inline mr-2" />
                Tambah Menu Pertama
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map(menu => (
                  <div key={menu.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-arjes-gold/30 transition-all group">
                    {/* Gambar Menu */}
                    <div className="h-48 bg-gray-800 relative overflow-hidden">
                      {menu.gambar_url ? (
                        <img 
                          src={menu.gambar_url} 
                          alt={menu.nama}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%232d3748"/><text x="200" y="150" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dy=".3em">Gambar tidak dapat dimuat</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Image className="text-gray-600" size={48} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleToggleAvailability(menu)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            menu.tersedia 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {menu.tersedia ? 'Tersedia' : 'Habis'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Info Menu */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-white font-bold text-lg truncate">{menu.nama}</h4>
                        <span className="text-arjes-gold font-bold text-xl">{formatRp(menu.harga)}</span>
                      </div>
                      
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {menu.deskripsi || 'Tidak ada deskripsi'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => openDetailModal(menu)}
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                          Detail
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(menu)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(menu.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
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
          <p>Total menu: {menuList.length} • Tersedia: {stats.available} • Habis: {stats.unavailable}</p>
          <p className="mt-1">Harga tertinggi: {formatRp(stats.highestPrice)} • Terendah: {formatRp(stats.lowestPrice)}</p>
        </div>
      </main>

      {/* --- MODAL TAMBAH MENU --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0F1F18]">
              <h3 className="font-bold text-white text-lg">Tambah Menu Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddMenu} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nama Menu <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Contoh: Nasi Goreng Spesial"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Harga <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({...formData, harga: e.target.value})}
                  placeholder="Contoh: 25000"
                  min="0"
                  step="1000"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  placeholder="Deskripsi menu (opsional)"
                  rows="3"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold resize-none"
                />
              </div>
              
              {/* Upload Gambar Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Upload Gambar <span className="text-red-400">*max 2MB</span>
                </label>
                
                {/* Tombol Upload */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={uploading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-white">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span className="text-white">Pilih file gambar</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG, WebP, GIF (maksimal 2MB)</p>
                
                {/* URL Gambar Manual */}
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">Atau masukkan URL gambar</label>
                  <input
                    type="text"
                    value={formData.gambar_url}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/gambar.jpg"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-arjes-gold text-sm"
                  />
                </div>
              </div>
              
              {/* Preview Gambar */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preview Gambar</label>
                {formData.gambar_url ? (
                  <div className="relative h-40 bg-gray-800 rounded-xl overflow-hidden">
                    <img 
                      src={formData.gambar_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%232d3748"/><text x="50" y="50" font-family="Arial" font-size="10" fill="%236b7280" text-anchor="middle" dy=".3em">Gambar tidak dapat dimuat</text></svg>';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gambar_url: '' }))}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
                      title="Hapus gambar"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formData.gambar_url.length > 50 ? formData.gambar_url.substring(0, 50) + '...' : formData.gambar_url}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 bg-gray-800 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-700">
                    <Image className="text-gray-600 mb-2" size={32} />
                    <p className="text-gray-500 text-sm">Belum ada gambar</p>
                    <p className="text-gray-400 text-xs mt-1">Upload file atau masukkan URL</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="flex items-center gap-3 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.tersedia}
                    onChange={(e) => setFormData({...formData, tersedia: e.target.checked})}
                    className="rounded border-white/10 bg-black/30 text-arjes-gold focus:ring-arjes-gold"
                  />
                  Tersedia untuk dipesan
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                  disabled={uploading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT MENU --- */}
      {showEditModal && selectedMenu && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0F1F18]">
              <h3 className="font-bold text-white text-lg">Edit Menu: {selectedMenu.nama}</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditMenu} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nama Menu <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Harga <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({...formData, harga: e.target.value})}
                  min="0"
                  step="1000"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  rows="3"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arjes-gold resize-none"
                />
              </div>
              
              {/* Upload Gambar Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Upload Gambar Baru <span className="text-red-400">*max 2MB</span>
                </label>
                
                {/* Tombol Upload */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={uploading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-white">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span className="text-white">Pilih file gambar</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG, WebP, GIF (maksimal 2MB)</p>
                
                {/* URL Gambar Manual */}
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">Atau masukkan URL gambar baru</label>
                  <input
                    type="text"
                    value={formData.gambar_url}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/gambar.jpg"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-arjes-gold text-sm"
                  />
                </div>
                
                {/* Tombol Hapus Gambar */}
                {selectedMenu.gambar_url && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(selectedMenu.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      Hapus Gambar Saat Ini
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Gambar saat ini akan dihapus dari server</p>
                  </div>
                )}
              </div>
              
              {/* Preview Gambar */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preview Gambar</label>
                {formData.gambar_url ? (
                  <div className="relative h-40 bg-gray-800 rounded-xl overflow-hidden">
                    <img 
                      src={formData.gambar_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%232d3748"/><text x="50" y="50" font-family="Arial" font-size="10" fill="%236b7280" text-anchor="middle" dy=".3em">Gambar tidak dapat dimuat</text></svg>';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gambar_url: '' }))}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
                      title="Hapus gambar"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formData.gambar_url === selectedMenu.gambar_url ? 'Gambar saat ini' : 'Gambar baru'}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 bg-gray-800 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-700">
                    <Image className="text-gray-600 mb-2" size={32} />
                    <p className="text-gray-500 text-sm">Belum ada gambar</p>
                    <p className="text-gray-400 text-xs mt-1">Upload file atau masukkan URL</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="flex items-center gap-3 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.tersedia}
                    onChange={(e) => setFormData({...formData, tersedia: e.target.checked})}
                    className="rounded border-white/10 bg-black/30 text-arjes-gold focus:ring-arjes-gold"
                  />
                  Tersedia untuk dipesan
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
                  disabled={uploading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-arjes-gold text-arjes-bg font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? 'Memperbarui...' : 'Perbarui Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL MENU --- */}
      {showDetailModal && selectedMenu && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0F1F18] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Detail Menu</h3>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Gambar */}
              <div className="h-56 bg-gray-800 rounded-xl overflow-hidden">
                {selectedMenu.gambar_url ? (
                  <img 
                    src={selectedMenu.gambar_url} 
                    alt={selectedMenu.nama}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%232d3748"/><text x="200" y="150" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dy=".3em">Gambar tidak dapat dimuat</text></svg>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <Image className="text-gray-600" size={48} />
                  </div>
                )}
              </div>

              {/* Info Menu */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-bold text-2xl">{selectedMenu.nama}</h4>
                  <span className="text-arjes-gold font-bold text-2xl">{formatRp(selectedMenu.harga)}</span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedMenu.tersedia 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedMenu.tersedia ? 'Tersedia' : 'Habis'}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ID: {selectedMenu.id}
                  </span>
                </div>
              </div>
              
              {/* Deskripsi */}
              <div>
                <h5 className="text-sm text-gray-400 mb-2 font-medium">Deskripsi</h5>
                <p className="text-white">
                  {selectedMenu.deskripsi || 'Tidak ada deskripsi'}
                </p>
              </div>
              
              {/* Info Tambahan */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Tanggal Dibuat</p>
                  <p className="text-white font-medium">
                    {selectedMenu.created_at 
                      ? new Date(selectedMenu.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Tidak diketahui'
                    }
                  </p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Terakhir Diupdate</p>
                  <p className="text-white font-medium">
                    {selectedMenu.updated_at 
                      ? new Date(selectedMenu.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Tidak diketahui'
                    }
                  </p>
                </div>
              </div>
              
              {/* Aksi */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedMenu);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit Menu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleAvailability(selectedMenu);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  {selectedMenu.tersedia ? (
                    <>
                      <EyeOff size={16} />
                      Tandai Habis
                    </>
                  ) : (
                    <>
                      <Eye size={16} />
                      Tandai Tersedia
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
                      handleDeleteMenu(selectedMenu.id);
                      setShowDetailModal(false);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMenu;