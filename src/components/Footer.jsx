import React from 'react';
import { MapPin, Phone, Mail, Instagram, Clock, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0D1812] text-white pt-20 pb-8 border-t border-white/5 relative">
      
      {/* --- BAGIAN 1: LOKASI & MAPS --- */}
      <div className="container mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-arjes-surface/30 p-4 rounded-3xl border border-white/5">
          
          {/* Kolom Kiri: Info Alamat */}
          <div className="p-8">
            <span className="text-arjes-gold text-sm font-bold tracking-widest uppercase mb-2 block">
              Our Location
            </span>
            <h2 className="text-3xl font-serif font-bold mb-6">
              Visit <span className="text-arjes-gold">Arjes Kitchen</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-arjes-gold">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Universitas Sebelas Maret</h4>
                  <p className="text-arjes-muted text-sm leading-relaxed mt-1">
                    Sekolah Vokasi UNS, Jl. Kolonel Sutarto No.150K, <br />
                    Jebres, Surakarta, Jawa Tengah 57126.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 text-arjes-gold">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Reservasi</h4>
                  <p className="text-arjes-muted text-sm mt-1">+62 812-3456-7890 (WhatsApp)</p>
                </div>
              </div>
            </div>

            <a 
              href="https://maps.google.com" 
              target="_blank"
              className="inline-block mt-8 text-arjes-gold font-bold border-b border-arjes-gold pb-1 hover:text-white hover:border-white transition-all"
            >
              Get Directions &rarr;
            </a>
          </div>

          {/* Kolom Kanan: Google Maps Embed */}
          <div className="h-[300px] lg:h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group">
            {/* Overlay gelap biar mapsnya gak terlalu terang pas belum di-hover */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
            
            <iframe 
              title="Arjes Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.149955139783!2d110.85406797406935!3d-7.558611674640105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1702a6c06a35%3A0x6e26715423871988!2sSekolah%20Vokasi%20UNS!5e0!3m2!1sen!2sid!4v1701140000000!5m2!1sen!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-700"
            ></iframe>
          </div>

        </div>
      </div>

      {/* --- BAGIAN 2: FOOTER LINKS --- */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. BRAND */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-arjes-gold mb-6">Arjes Kitchen</h3>
            <p className="text-arjes-muted text-sm leading-relaxed mb-6">
              Tempat nongkrong, diskusi, dan nugas ternyaman di lingkungan kampus UNS. Kopi enak, harga mahasiswa, ide mengalir deras.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-arjes-gold hover:text-arjes-bg transition-all cursor-pointer">
                <Instagram size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-arjes-gold hover:text-arjes-bg transition-all cursor-pointer">
                <Facebook size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-arjes-gold hover:text-arjes-bg transition-all cursor-pointer">
                <Twitter size={18} />
              </div>
            </div>
          </div>

          {/* 2. QUICK LINKS */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4 text-arjes-muted text-sm">
              <li><a href="#" className="hover:text-arjes-gold transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-arjes-gold transition-colors">Our Menu</a></li>
              <li><a href="#" className="hover:text-arjes-gold transition-colors">Reservation</a></li>
              <li><a href="#" className="hover:text-arjes-gold transition-colors">Facilities</a></li>
              <li><a href="#" className="hover:text-arjes-gold transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* 3. OPENING HOURS (Penting!) */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Opening Hours</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-arjes-muted">Senin - Jumat</span>
                <span className="font-bold text-arjes-gold">08:00 - 22:00</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-arjes-muted">Sabtu</span>
                <span className="font-bold text-arjes-gold">09:00 - 23:00</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-arjes-muted">Minggu</span>
                <span className="font-bold text-arjes-gold">10:00 - 22:00</span>
              </li>
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Stay Updated</h4>
            <p className="text-arjes-muted text-sm mb-4">Dapatkan info promo & menu baru.</p>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent text-white px-4 py-2 w-full text-sm focus:outline-none"
              />
              <button className="bg-arjes-gold text-arjes-bg px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/10 pt-8 text-center text-arjes-muted text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2025 Arjes Kitchen UNS. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;