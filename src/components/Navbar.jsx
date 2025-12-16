import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, ShoppingBag, LogOut, LayoutDashboard, User as UserIcon, ChevronDown, Menu as MenuIcon, X, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // ✅ Import AuthContext

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { cart } = useCart();
  const { user, logout, isAuthenticated } = useAuth(); // ✅ Gunakan dari AuthContext
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home'); 

  const totalItems = cart.reduce((total, item) => total + item.qty, 0);

  // Hapus useEffect yang mengambil user dari localStorage karena sudah dari AuthContext

  // --- LOGIKA SCROLL & URL ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (location.pathname === '/') {
        if (window.scrollY > 600) setActiveSection('about');
        else setActiveSection('home');
      }
    };
    
    const path = location.pathname;
    if (path === '/menu') setActiveSection('menu');
    else if (path === '/booking') setActiveSection('booking');
    else if (path === '/') {
       if (window.scrollY < 600) setActiveSection('home');
    } else {
       setActiveSection(''); 
    }
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname === '/') setActiveSection('home');
  };

  const handleLogout = () => {
    logout(); // ✅ Gunakan logout dari AuthContext
    setDropdownOpen(false);
    navigate('/');
  };

  const getUnderlineClass = (section) => activeSection === section ? 'w-full' : 'w-0 group-hover:w-full';
  const getTextClass = (section) => activeSection === section ? 'text-arjes-gold' : 'text-white/90';
  const isHome = location.pathname === '/';
  const isCheckout = location.pathname === '/checkout' || location.pathname === '/cart';

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
    >
      <div className={`w-full max-w-7xl backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl transition-all duration-300 ${
        isScrolled ? 'bg-arjes-bg/95 shadow-arjes-gold/5' : 'bg-arjes-bg/80'
      }`}>
        
        {/* LOGO */}
        <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-arjes-gold rounded-full flex items-center justify-center shadow-lg shadow-arjes-gold/20 group-hover:scale-110 transition-transform">
            <Coffee className="text-arjes-bg w-6 h-6" />
          </div>
          <span className="text-xl font-serif font-bold text-white tracking-wide hidden sm:block group-hover:text-arjes-gold transition-colors">
            Arjes Kitchen
          </span>
        </Link>

        {/* MENU TENGAH */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" onClick={scrollToTop} className={`hover:text-arjes-gold transition-colors relative group ${getTextClass('home')}`}>
            Home
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-arjes-gold transition-all duration-300 ${getUnderlineClass('home')}`}></span>
          </Link>
          <Link to="/menu" className={`hover:text-arjes-gold transition-colors relative group ${getTextClass('menu')}`}>
            Menu
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-arjes-gold transition-all duration-300 ${getUnderlineClass('menu')}`}></span>
          </Link>
          <Link to="/booking" className={`hover:text-arjes-gold transition-colors relative group ${getTextClass('booking')}`}>
            Booking
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-arjes-gold transition-all duration-300 ${getUnderlineClass('booking')}`}></span>
          </Link>
          {isHome ? (
            <a href="#about-us" className={`hover:text-arjes-gold transition-colors relative group cursor-pointer ${getTextClass('about')}`}>
              About Us
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-arjes-gold transition-all duration-300 ${getUnderlineClass('about')}`}></span>
            </a>
          ) : (
            <Link to="/#about-us" className={`hover:text-arjes-gold transition-colors relative group ${getTextClass('about')}`}>
              About Us
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-arjes-gold transition-all duration-300 ${getUnderlineClass('about')}`}></span>
            </Link>
          )}
        </div>

        {/* BAGIAN KANAN */}
        <div className="flex items-center gap-4">
          
          <Link to="/checkout" className={`relative p-2 transition-colors group ${isCheckout ? 'text-arjes-gold' : 'text-white hover:text-arjes-gold'}`}>
            <ShoppingBag size={22} fill={isCheckout ? "currentColor" : "none"} /> 
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>

          {/* --- BAGIAN PROFIL USER --- */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all focus:outline-none">
                <div className="w-8 h-8 bg-arjes-gold rounded-full flex items-center justify-center text-arjes-bg font-bold text-sm border-2 border-arjes-bg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-white text-sm font-medium max-w-[80px] truncate hidden lg:block">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className={`text-white/60 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-64 bg-[#0F1F18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-black/5 z-50"
                  >
                    {/* Header Info User */}
                    <div className="px-5 py-4 border-b border-white/10 bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-arjes-gold rounded-full flex items-center justify-center text-arjes-bg font-bold text-lg shadow-lg">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="p-2 space-y-1">
                       {/* 1. Dashboard */}
                       <Link 
                            to={user.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
                            onClick={() => setDropdownOpen(false)}
                       >
                          <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-arjes-gold/20 transition-colors">
                             <LayoutDashboard size={16} className="group-hover:text-arjes-gold" />
                          </div>
                          <span className="text-sm font-medium">Dashboard</span>
                       </Link>
                       
                       {/* 2. Edit Profil */}
                       <Link 
                            to="/user/dashboard?tab=profile" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all group"
                            onClick={() => setDropdownOpen(false)}
                       >
                            <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-gray-500/20 transition-colors">
                               <Settings size={16} />
                            </div>
                            <span className="text-sm font-medium">Edit Profil</span>
                       </Link>
                    </div>

                    {/* 3. Logout */}
                    <div className="border-t border-white/10 p-2 mt-1 bg-red-500/5">
                      <button 
                        onClick={handleLogout} 
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left font-medium"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Keluar</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/register" className="hidden lg:block px-5 py-2 rounded-full text-sm font-semibold text-arjes-gold border border-arjes-gold/50 hover:bg-arjes-gold hover:text-arjes-bg transition-all">Sign Up</Link>
              <Link to="/login" className="px-6 py-2 rounded-full text-sm font-semibold bg-arjes-gold text-arjes-bg shadow-lg hover:scale-105 transition-transform">Login</Link>
            </div>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white hover:text-arjes-gold transition-colors">
            {mobileMenuOpen ? <X size={24}/> : <MenuIcon size={24}/>}
          </button>
        </div>
      </div>
      
      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="absolute top-24 left-4 right-4 bg-arjes-bg/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-4 text-white shadow-2xl md:hidden z-50"
            >
                <Link to="/" onClick={() => { scrollToTop(); setMobileMenuOpen(false); }} className={getTextClass('home')}>Home</Link>
                <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className={getTextClass('menu')}>Menu</Link>
                <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className={getTextClass('booking')}>Booking</Link>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;