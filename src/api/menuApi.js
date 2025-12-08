// src/api/menuApi.js

// Kunci untuk LocalStorage
const STORAGE_KEY = 'arjes_menus';

// Helper untuk simulasi delay (misal 1 detik)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- 1. GET DATA (READ) ---
export const fetchMenus = async () => {
  await wait(1000); // Pura-pura loading 1 detik
  
  const data = localStorage.getItem(STORAGE_KEY);
  // Jika data belum ada, kembalikan array kosong
  return data ? JSON.parse(data) : [];
};

// --- 2. ADD DATA (CREATE) ---
export const addMenu = async (newMenu) => {
  await wait(1000); // Pura-pura proses simpan
  
  // Ambil data lama
  const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  // Tambah data baru (kasih ID random)
  const menuWithId = { ...newMenu, id: Date.now() };
  const updatedData = [...existingData, menuWithId];
  
  // Simpan ke LocalStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  
  return menuWithId;
};

// --- 3. DELETE DATA (DELETE) ---
export const deleteMenu = async (id) => {
  await wait(500); // Pura-pura proses hapus
  
  const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const updatedData = existingData.filter((item) => item.id !== id);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  return id;
};