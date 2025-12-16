import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Loader2, Phone, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
    
    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  }

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score === 0) message = 'Sangat Lemah';
    else if (score === 1) message = 'Lemah';
    else if (score === 2) message = 'Cukup';
    else if (score === 3) message = 'Kuat';
    else message = 'Sangat Kuat';
    
    setPasswordStrength({ score, message });
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    
    if (!formData.phone.trim()) newErrors.phone = 'Nomor HP wajib diisi';
    else if (!/^08[1-9][0-9]{7,11}$/.test(formData.phone)) newErrors.phone = 'Format nomor HP tidak valid';
    
    if (!formData.password) newErrors.password = 'Password wajib diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Password tidak cocok';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validasi client-side
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Kirim data ke API Laravel dengan format yang sesuai
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '', // phone boleh null
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      
      console.log('Register response:', response);
      
      // Handle response berdasarkan format API Anda
      if (response.status === 'success') {
        setSuccessMessage('Registrasi berhasil! Silakan login.');
        
        // Auto login setelah registrasi (optional)
        // Coba login otomatis dengan data yang baru dibuat
        try {
          const loginResponse = await authAPI.login({
            email: formData.email,
            password: formData.password
          });
          
          if (loginResponse.token) {
            setSuccessMessage('Registrasi berhasil! Anda akan dialihkan...');
            
            setTimeout(() => {
              if (loginResponse.user?.role === 'admin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/');
              }
            }, 1500);
          }
        } catch (loginError) {
          // Jika auto login gagal, tetap lanjutkan
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        }
      }
      
    } catch (error) {
      console.error('Register error:', error);
      
      if (error.response) {
        // Error dari server Laravel
        const { data, status } = error.response;
        
        if (status === 422) {
          // Validation errors dari Laravel (sesuai format Laravel)
          const serverErrors = {};
          Object.keys(data.errors || {}).forEach(key => {
            // Mapping field names
            const fieldMap = {
              'name': 'name',
              'email': 'email',
              'phone': 'phone',
              'password': 'password'
            };
            
            if (fieldMap[key]) {
              serverErrors[fieldMap[key]] = data.errors[key][0];
            }
          });
          setErrors(serverErrors);
          
          // Jika ada error general
          if (data.message) {
            setErrors(prev => ({ ...prev, general: data.message }));
          }
        } else if (data.message) {
          // Error message umum
          setErrors({ general: data.message });
        } else {
          setErrors({ general: 'Registrasi gagal. Silakan coba lagi.' });
        }
      } else if (error.request) {
        // Tidak dapat terhubung ke server
        setErrors({ 
          general: 'Tidak dapat terhubung ke server. Pastikan: \n1. Backend Laravel berjalan\n2. CORS sudah dikonfigurasi\n3. URL API benar: http://localhost:8000' 
        });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials untuk testing
  const fillDemoCredentials = () => {
    setFormData({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '081234567890',
      password: 'password123',
      password_confirmation: 'password123'
    });
    setErrors({});
  };

  // Test koneksi API
  const testAPIConnection = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      // Coba endpoint yang sederhana untuk testing
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccessMessage('✅ Koneksi API berhasil! CSRF token siap.');
      } else {
        setErrors({ general: '⚠️ API merespons tapi dengan status: ' + response.status });
      }
      
    } catch (error) {
      console.error('API Connection test error:', error);
      setErrors({ 
        general: '❌ GAGAL terhubung ke API Laravel.\n\nPeriksa:\n1. Laravel berjalan (php artisan serve)\n2. Port 8000 terbuka\n3. CORS middleware diaktifkan\n4. Route /register ada di api.php' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-arjes-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Hiasan */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-arjes-gold/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

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
              <User className="text-arjes-gold" size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-serif mb-2">Buat Akun Baru</h2>
          <p className="text-sm text-white/60">Bergabunglah dengan komunitas Arjes Kitchen</p>
          
          {/* API Connection Test Button */}
          <button 
            type="button"
            onClick={testAPIConnection}
            disabled={loading}
            className="mt-2 text-xs text-arjes-gold/70 hover:text-arjes-gold underline"
          >
            {loading ? "Menguji koneksi..." : "Test koneksi ke API"}
          </button>
        </div>
        
        {/* Pesan Sukses */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-200 text-sm text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-2">
              <Check size={16} />
              {successMessage}
            </div>
          </div>
        )}
        
        {/* Pesan Error Umum */}
        {errors.general && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              <div className="whitespace-pre-line text-left">{errors.general}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Input Nama */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white/70 ml-1">Nama Lengkap</label>
              {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
            </div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="text" 
                name="name" 
                placeholder="Masukkan nama lengkap" 
                value={formData.name}
                onChange={handleInput}
                disabled={loading}
                className={`w-full bg-black/20 border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none transition-all placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-arjes-gold'
                }`}
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white/70 ml-1">Email</label>
              {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="email" 
                name="email" 
                placeholder="nama@email.com" 
                value={formData.email}
                onChange={handleInput}
                disabled={loading}
                className={`w-full bg-black/20 border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none transition-all placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-arjes-gold'
                }`}
              />
            </div>
          </div>

          {/* Input No HP */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white/70 ml-1">Nomor Handphone</label>
              {errors.phone && <span className="text-xs text-red-400">{errors.phone}</span>}
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="tel" 
                name="phone" 
                placeholder="081234567890 (Opsional)" 
                value={formData.phone}
                onChange={handleInput}
                disabled={loading}
                className={`w-full bg-black/20 border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none transition-all placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-arjes-gold'
                }`}
              />
            </div>
            <p className="text-xs text-white/50 mt-1">* Opsional, bisa diisi nanti</p>
          </div>

          {/* Input Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white/70 ml-1">Password</label>
              {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="password" 
                name="password" 
                placeholder="Minimal 6 karakter" 
                value={formData.password}
                onChange={handleInput}
                disabled={loading}
                className={`w-full bg-black/20 border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none transition-all placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-arjes-gold'
                }`}
              />
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Kekuatan Password:</span>
                  <span className={`font-bold ${
                    passwordStrength.score <= 1 ? 'text-red-400' :
                    passwordStrength.score === 2 ? 'text-yellow-400' :
                    passwordStrength.score >= 3 ? 'text-green-400' : 'text-white/70'
                  }`}>
                    {passwordStrength.message}
                  </span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 1 ? 'bg-red-500 w-1/4' :
                      passwordStrength.score === 2 ? 'bg-yellow-500 w-1/2' :
                      passwordStrength.score === 3 ? 'bg-blue-500 w-3/4' :
                      'bg-green-500 w-full'
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white/70 ml-1">Konfirmasi Password</label>
              {errors.password_confirmation && <span className="text-xs text-red-400">{errors.password_confirmation}</span>}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="password" 
                name="password_confirmation" 
                placeholder="Ulangi password Anda" 
                value={formData.password_confirmation}
                onChange={handleInput}
                disabled={loading}
                className={`w-full bg-black/20 border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none transition-all placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.password_confirmation ? 'border-red-500/50' : 'border-white/10 focus:border-arjes-gold'
                }`}
              />
            </div>
          </div>

          {/* Demo Button */}
          <div className="pt-2">
            <button 
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs text-arjes-gold/70 hover:text-arjes-gold underline"
              disabled={loading}
            >
              Isi Data Demo (Testing)
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-arjes-gold to-yellow-600 text-arjes-bg font-bold py-3.5 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all flex justify-center items-center gap-2 mt-4 shadow-lg shadow-arjes-gold/30 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <span className="flex items-center gap-2">
                <User size={18} />
                Daftar Sekarang
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">Sudah punya akun?</p>
          <Link 
            to="/login" 
            className="mt-2 inline-block text-arjes-gold text-sm hover:underline font-bold px-4 py-2 rounded-lg hover:bg-arjes-gold/10 transition-colors"
            disabled={loading}
          >
            Masuk ke Akun Anda
          </Link>
        </div>

        {/* Syarat & Ketentuan */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            Dengan mendaftar, Anda menyetujui <Link to="/terms" className="text-arjes-gold/60 hover:text-arjes-gold underline">Syarat & Ketentuan</Link> kami
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div className="absolute bottom-4 text-center text-white/30 text-xs w-full">
        <p>ARJES Kitchen © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Register;