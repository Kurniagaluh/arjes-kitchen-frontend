import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // ✅ Gunakan context

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Tampilkan pesan sukses berdasarkan role
        if (result.user?.role === 'admin') {
          alert("Login Admin Berhasil! 🚀");
          navigate('/admin/dashboard', { replace: true });
        } else {
          alert(`Login Berhasil! Selamat datang kembali, ${result.user?.name} 👋`);
          navigate('/', { replace: true });
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const { data, status } = error.response;
        
        if (status === 401) {
          setErrorMsg("Email atau password salah!");
        } else if (status === 422) {
          const firstError = Object.values(data.errors || {})[0];
          setErrorMsg(firstError?.[0] || "Validasi gagal");
        } else if (data.message) {
          setErrorMsg(data.message);
        } else {
          setErrorMsg("Login gagal. Periksa koneksi atau coba lagi.");
        }
      } else if (error.request) {
        setErrorMsg("Tidak dapat terhubung ke server. Pastikan backend Laravel berjalan di http://localhost:8000");
      } else {
        setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Test koneksi API (optional)
  const testAPIConnection = async () => {
    try {
      setLoading(true);
      setErrorMsg("Menguji koneksi ke API...");
      
      // Coba endpoint yang lebih sederhana untuk testing
      const response = await fetch('http://localhost:8000/api/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        setErrorMsg("✅ API terhubung! CSRF cookie berhasil diambil.");
      } else {
        setErrorMsg("⚠️ API merespons tapi dengan status " + response.status);
      }
      
    } catch (error) {
      console.error('API Connection test error:', error);
      setErrorMsg("❌ GAGAL terhubung ke API. Pastikan:\n1. Laravel berjalan di port 8000\n2. CORS dikonfigurasi dengan benar\n3. Tidak ada firewall yang memblokir");
      
      // Saran troubleshooting
      setTimeout(() => {
        if (window.confirm("Buka halaman troubleshooting API?")) {
          window.open("https://laravel.com/docs/sanctum#spa-authentication", "_blank");
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-arjes-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-arjes-gold/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

      <Link 
        to="/" 
        className="absolute top-8 left-8 text-white/60 hover:text-arjes-gold flex items-center gap-2 transition-colors z-20"
      >
        <ArrowLeft size={20} /> Kembali ke Home
      </Link>

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-white relative z-10 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-arjes-gold/10 rounded-full">
            <div className="w-12 h-12 bg-arjes-gold/20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="text-arjes-gold" size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-serif mb-2">Welcome Back</h2>
          <p className="text-sm text-white/60">Masuk untuk melanjutkan pesanan Anda.</p>
          
          {/* API Connection Test Button */}
          <button 
            type="button"
            onClick={testAPIConnection}
            disabled={loading}
            className="mt-3 text-xs text-arjes-gold/70 hover:text-arjes-gold underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menguji koneksi..." : "Test koneksi ke API"}
          </button>
        </div>
        
        {/* Pesan Error */}
        {errorMsg && (
          <div className={`mb-4 p-3 rounded-xl text-sm text-center animate-fadeIn ${
            errorMsg.includes("✅") || errorMsg.includes("terhubung")
              ? "bg-green-500/20 border border-green-500/50 text-green-200" 
              : errorMsg.includes("⚠️")
              ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-200"
              : "bg-red-500/20 border border-red-500/50 text-red-200"
          }`}>
            <div className="whitespace-pre-line">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm text-white/70 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="email" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
                disabled={loading}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-arjes-gold transition-all placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-white/70 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
                minLength="6"
                disabled={loading}
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-arjes-gold transition-all placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed" 
              />
            </div>
          </div>

          {/* Demo credentials */}
          <div className="text-xs text-white/50 p-3 bg-black/20 rounded-lg border border-white/10">
            <p className="font-semibold mb-1 text-arjes-gold/80">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="flex justify-between">
                <span>Admin:</span>
                <span>admin@arjes.com / password</span>
              </p>
              <p className="flex justify-between">
                <span>User:</span>
                <span>user@example.com / password</span>
              </p>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm text-arjes-gold/70 hover:text-arjes-gold hover:underline"
            >
              Lupa password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-arjes-gold to-yellow-600 text-arjes-bg font-bold py-3.5 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-arjes-gold/30 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> 
                <span>Authenticating...</span>
              </>
            ) : (
              <span className="flex items-center gap-2">
                <Lock size={18} />
                Sign In
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">Belum punya akun?</p>
          <Link 
            to="/register" 
            className="mt-2 inline-block text-arjes-gold text-sm hover:underline font-bold px-4 py-2 rounded-lg hover:bg-arjes-gold/10 transition-colors"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <div className="absolute bottom-4 text-center text-white/30 text-xs w-full">
        <p>ARJES Kitchen © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Login;