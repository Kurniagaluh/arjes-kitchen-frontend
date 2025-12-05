import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api/axios'; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Mencoba Login...", { email, password });

      // TEMBAK API LOGIN LARAVEL
      const response = await api.post('/login', { email, password });
      
      console.log("Login Sukses:", response.data);
      
      // Ambil Token & User dari Laravel
      const token = response.data.access_token || response.data.token;
      const user = response.data.user;

      // Simpan di memori browser (LocalStorage)
      // Ini penting biar user dianggap "Sedang Login"
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      alert(`Login Berhasil! Selamat datang ${user.name}`);
      
      // Redirect berdasarkan Role
      if (user.role === 'admin' || email === 'admin@arjes.com') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }

    } catch (error) {
      console.error("Login Gagal:", error);
      // Cek pesan error dari backend
      const errMsg = error.response?.data?.message || "Gagal Login! Periksa Email/Password.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-arjes-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Hiasan */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-arjes-gold/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

      <Link to="/" className="absolute top-8 left-8 text-white/60 hover:text-arjes-gold flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Kembali ke Home
      </Link>

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-white relative z-10 shadow-2xl">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif mb-2">Welcome Back</h2>
            <p className="text-sm text-arjes-muted">Login untuk mengakses dashboard.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all" 
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all" 
            />
          </div>

          <button disabled={loading} className="w-full bg-arjes-gold text-arjes-bg font-bold py-3.5 rounded-xl hover:bg-white transition-colors flex justify-center items-center gap-2 shadow-lg shadow-arjes-gold/20">
            {loading ? <><Loader2 className="animate-spin" /> Checking...</> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/register" className="text-arjes-gold text-sm hover:underline">Belum punya akun? Daftar dulu</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;