// src/pages/admin/ManageMenu.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenus, addMenu, deleteMenu } from '../../api/menuApi'; 
import { Trash2, Plus, Upload, X } from 'lucide-react';

const ManageMenu = () => {
  const queryClient = useQueryClient();
  
  // State Form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('food'); // Default kategori
  const [imagePreview, setImagePreview] = useState(null);

  // 1. GET DATA
  const { data: menus, isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: fetchMenus,
  });

  // 2. ADD DATA
  const addMutation = useMutation({
    mutationFn: addMenu,
    onSuccess: () => {
      queryClient.invalidateQueries(['menus']); 
      // Reset Form
      setName('');
      setPrice('');
      setCategory('food'); // Reset ke default
      setImagePreview(null);
      alert('Menu berhasil disimpan!');
    },
  });

  // 3. DELETE DATA
  const deleteMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries(['menus']);
    },
  });

  // --- LOGIKA UPLOAD GAMBAR (BASE64) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIKA SUBMIT FORM ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !price) return alert("Nama dan Harga wajib diisi!");

    // Susun data object
    const newMenuData = {
      name,
      price: parseInt(price),
      category, // Menggunakan kategori dari dropdown
      image: imagePreview || null, 
      rating: 4.5 
    };

    addMutation.mutate(newMenuData);
  };

  return (
    <div className="p-6 md:p-12 bg-gray-100 min-h-screen text-gray-800 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-[#0F1F18]">Kelola Menu Restoran</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === BAGIAN KIRI: FORM INPUT === */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-6">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2 text-[#0F1F18]">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center text-white">
                <Plus size={18} />
              </div>
              Tambah Menu
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* INPUT NAMA */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nama Menu</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Nasi Goreng Spesial" 
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* INPUT HARGA */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Harga (Rp)</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 25000" 
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* INPUT KATEGORI (DROPDOWN) */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kategori</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-white"
                >
                  <option value="coffee">Coffee</option>
                  <option value="non-coffee">Non-Coffee</option>
                  <option value="food">Makanan</option>
                  <option value="snack">Cemilan</option>
                </select>
              </div>

              {/* AREA UPLOAD GAMBAR */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Foto Menu</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setImagePreview(null); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full z-20 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 text-gray-400 flex flex-col items-center">
                      <Upload size={32} className="mb-2 text-[#D4AF37]" />
                      <span className="text-sm font-medium">Klik untuk upload gambar</span>
                      <span className="text-xs mt-1">Format: JPG, PNG (Max 2MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={addMutation.isPending}
                className="w-full bg-[#0F1F18] text-[#D4AF37] py-3 rounded-xl font-bold hover:bg-black hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {addMutation.isPending ? 'Sedang Menyimpan...' : 'Simpan Menu'}
              </button>
            </form>
          </div>
        </div>

        {/* === BAGIAN KANAN: DAFTAR MENU === */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="font-bold text-xl mb-6 text-[#0F1F18]">Daftar Menu Aktif ({menus?.length || 0})</h2>
            
            {isLoading ? (
              <div className="text-center py-10 text-gray-400 animate-pulse">Memuat data menu...</div>
            ) : menus?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400">Belum ada menu yang ditambahkan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menus.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#D4AF37]/30 hover:shadow-md transition-all bg-white group">
                    {/* Gambar Kecil */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 truncate text-lg">{item.name}</h3>
                      </div>
                      
                      {/* Badge Kategori */}
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 border border-gray-200 px-2 py-0.5 rounded w-fit mt-1">
                        {item.category || 'Food'}
                      </span>

                      <p className="text-[#D4AF37] font-bold mt-2">Rp {item.price.toLocaleString()}</p>
                    </div>

                    <button 
                      onClick={() => {
                        if(window.confirm('Hapus menu ini?')) deleteMutation.mutate(item.id);
                      }}
                      className="self-center p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageMenu;