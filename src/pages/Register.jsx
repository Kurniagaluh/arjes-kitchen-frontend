import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Loader2, Phone } from 'lucide-react';
import api from '../api/axios'; 

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Mengirim data...", formData); // Debugging

      // TEMBAK KE BACKEND LARAVEL
      const response = await api.post('/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      
      console.log("Respon Sukses:", response.data);
      alert("Registrasi Berhasil! Data sudah masuk Database. Silakan Login.");
      navigate('/login');

    } catch (error) {
      console.error("Gagal Register:", error);
      if (error.response) {
        // Tampilkan pesan error detail dari Laravel
        // JSON.stringify biar pesannya kebaca semua (misal: email has been taken)
        alert(`Gagal: ${JSON.stringify(error.response.data.message || error.response.data)}`);
      } else {
        alert("Backend tidak bisa dihubungi. Pastikan server nyala (port 8000)!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-arjes-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Hiasan */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-arjes-gold/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

      <Link to="/" className="absolute top-8 left-8 text-white/60 hover:text-arjes-gold flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Kembali ke Home
      </Link>

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-white relative z-10 shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 font-serif">Daftar Akun Baru</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Input Nama */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="text" name="name" placeholder="Nama Lengkap" 
              onChange={handleInput} required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all" 
            />
          </div>

          {/* Input Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="email" name="email" placeholder="Email" 
              onChange={handleInput} required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all" 
            />
          </div>

          {/* Input No HP */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="text" name="phone" placeholder="No. Handphone (08...)" 
              onChange={handleInput} required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all" 
            />
          </div>

          {/* Input Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="password" name="password" placeholder="Password (Min 8)" 
              onChange={handleInput} required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all" 
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="password" name="password_confirmation" placeholder="Ulangi Password" 
              onChange={handleInput} required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all" 
            />
          </div>

          <button disabled={loading} className="w-full bg-arjes-gold text-arjes-bg font-bold py-3.5 rounded-xl hover:bg-white transition-colors flex justify-center items-center gap-2 mt-2 shadow-lg shadow-arjes-gold/20">
            {loading ? <><Loader2 className="animate-spin" /> Menghubungkan...</> : "Register Sekarang"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <Link to="/login" className="text-arjes-gold text-sm hover:underline">Sudah punya akun? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;