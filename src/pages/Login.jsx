import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // PENTING: Import useNavigate
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate(); // Hook buat pindah halaman

  // 1. Simpan inputan user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Fungsi saat tombol Login diklik
  const handleLogin = (e) => {
    e.preventDefault(); // Biar halaman gak refresh

    // Validasi sederhana
    if (!email || !password) {
      alert("Harap isi email dan password!");
      return;
    }

    // --- LOGIKA SIMULASI (Nanti diganti connect ke PHP) ---
    console.log("Login sebagai:", email);

    if (email === "admin@arjes.com" && password === "admin123") {
      // Skenario: JIKA ADMIN
      alert("Login Berhasil! Selamat datang Admin.");
      navigate('/admin/dashboard'); // Pindah ke Admin Dashboard
    } else {
      // Skenario: JIKA USER BIASA
      alert("Login Berhasil! Selamat menikmati kopi.");
      navigate('/user/dashboard'); // Pindah ke User Dashboard
    }
  };

  return (
    <div className="min-h-screen bg-arjes-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Hiasan Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-arjes-gold/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

      <Link to="/" className="absolute top-8 left-8 text-white/60 hover:text-arjes-gold flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Kembali ke Home
      </Link>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-arjes-muted text-sm">Masuk untuk mulai reservasi meja.</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Input Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Simpan ketikan user
                placeholder="admin@arjes.com atau user@gmail.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-arjes-gold focus:ring-1 focus:ring-arjes-gold transition-all"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Simpan ketikan user
                placeholder="Ketik apa saja..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-arjes-gold focus:ring-1 focus:ring-arjes-gold transition-all"
              />
            </div>
            <div className="text-right">
              <a href="#" className="text-xs text-arjes-gold hover:underline">Lupa password?</a>
            </div>
          </div>

          {/* Tombol Login */}
          <button type="submit" className="w-full bg-arjes-gold text-arjes-bg font-bold py-3.5 rounded-xl hover:bg-white transition-colors shadow-lg shadow-arjes-gold/20">
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-arjes-muted">
          Belum punya akun?{' '}
          <Link to="/register" className="text-white font-bold hover:text-arjes-gold transition-colors">
            Daftar Sekarang
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;