import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- FUNGSI MOCK API (SIMULASI BACKEND) ---
  // Fungsi ini menggantikan API asli sementara agar login tetap jalan logic-nya
  const mockApiLogin = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@arjes.com' && password === 'password') {
          resolve({
            data: {
              token: 'mock-token-admin-secure',
              user: { id: 1, name: 'Super Admin', email: 'admin@arjes.com', role: 'admin' }
            }
          });
        } else if (email === 'user@gmail.com' && password === 'password') {
          resolve({
            data: {
              token: 'mock-token-user-secure',
              user: { id: 2, name: 'Kurnia Galuh', email: 'user@gmail.com', role: 'user' }
            }
          });
        } else {
          reject({ response: { data: { message: 'Email atau password salah!' } } });
        }
      }, 1000); // Delay 1 detik seolah-olah loading server
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Panggil Mock API
      const response = await mockApiLogin(email, password);

      // 2. Ambil Data
      const { token, user } = response.data;

      // 3. Simpan ke LocalStorage (Agar sesi tidak hilang saat refresh)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 4. Redirect Berdasarkan Role
      alert(`Login Berhasil! Selamat datang, ${user.name}`);
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (error) {
      console.error("Login Error:", error);
      const message = error.response?.data?.message || "Terjadi kesalahan pada server.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
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

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-white relative z-10 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif mb-2">Welcome Back</h2>
            <p className="text-sm text-arjes-muted">Masuk untuk melanjutkan pesanan Anda.</p>
        </div>
        
        {/* Pesan Error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center animate-pulse">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all placeholder:text-white/30" 
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-arjes-gold transition-all placeholder:text-white/30" 
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-arjes-gold text-arjes-bg font-bold py-3.5 rounded-xl hover:bg-white transition-all flex justify-center items-center gap-2 shadow-lg shadow-arjes-gold/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="animate-spin" /> Authenticating...</> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/register" className="text-arjes-gold text-sm hover:underline font-medium">Belum punya akun? Daftar dulu</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;