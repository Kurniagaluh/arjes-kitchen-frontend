import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen bg-arjes-bg flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-arjes-gold/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />

      <Link to="/" className="absolute top-8 left-8 text-white/60 hover:text-arjes-gold flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Kembali ke Home
      </Link>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Join Us</h2>
          <p className="text-arjes-muted text-sm">Buat akun baru untuk nikmati fiturnya.</p>
        </div>

        <form className="space-y-5">
          {/* Input Nama */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input type="text" placeholder="Nama Lengkap" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-arjes-gold transition-all" />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input type="email" placeholder="nama@email.com" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-arjes-gold transition-all" />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input type="password" placeholder="••••••••" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-arjes-gold transition-all" />
            </div>
          </div>

          <button className="w-full bg-arjes-gold text-arjes-bg font-bold py-3.5 rounded-xl hover:bg-white transition-colors shadow-lg shadow-arjes-gold/20 mt-2">
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-arjes-muted">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-white font-bold hover:text-arjes-gold transition-colors">
            Login di sini
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;