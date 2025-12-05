import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const reviews = [
  { 
    name: "Rizky (Teknik)", 
    role: "Mahasiswa Angkatan 2022",
    text: "Tempat nugas paling pewe di UNS. Kopinya strong, WiFi kenceng, colokan banyak. Fix bakal sering ke sini.", 
    rating: 5 
  },
  { 
    name: "Sari (FISIP)", 
    role: "Mahasiswa Angkatan 2023",
    text: "Nasi gorengnya enak banget woi, porsi mahasiswa harga bersahabat. Sambalnya juara!", 
    rating: 5 
  },
  { 
    name: "Budi (Vokasi)", 
    role: "D3 Teknik Informatika",
    text: "Suka banget sama playlist lagunya. Nggak berisik, enak buat fokus ngoding berjam-jam.", 
    rating: 4 
  },
  { 
    name: "Dinda (FEB)", 
    role: "Akuntansi 2021",
    text: "Baristanya ramah banget, tempatnya estetik buat foto-foto OOTD. Cahayanya bagus.", 
    rating: 5 
  },
  { 
    name: "Ahmad (Hukum)", 
    role: "BEM FH UNS",
    text: "Sering rapat himpunan di sini, meja panjangnya sangat mengakomodasi buat diskusi tim.", 
    rating: 5 
  },
];

const Testimonials = () => {
  const scrollRef = useRef(null);

  // Fungsi buat tombol panah manual
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 400; // Jarak geser
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-24 bg-arjes-bg relative border-t border-white/5">
      <div className="container mx-auto px-6">
        
        {/* Header dengan Tombol Navigasi */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-arjes-gold text-sm font-bold tracking-widest uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mt-2">
              Kata <span className="text-arjes-gold italic">Mahasiswa</span>
            </h2>
          </div>

          {/* Tombol Panah Kiri Kanan */}
          <div className="flex gap-4">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-arjes-gold hover:text-arjes-bg hover:border-arjes-gold transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-arjes-gold hover:text-arjes-bg hover:border-arjes-gold transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* CONTAINER SCROLL HORIZONTAL (Scroll Snap) */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide Scrollbar di Firefox/IE
        >
          {reviews.map((review, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[350px] md:min-w-[400px] snap-center bg-arjes-surface/30 backdrop-blur-md p-8 rounded-3xl border border-white/5 hover:border-arjes-gold/30 transition-all group"
            >
              {/* Ikon Kutip */}
              <div className="mb-6">
                <Quote className="text-arjes-gold/50 w-10 h-10 group-hover:text-arjes-gold transition-colors" />
              </div>

              {/* Isi Review */}
              <p className="text-white/90 text-lg leading-relaxed mb-8 italic">
                "{review.text}"
              </p>

              {/* Footer Card */}
              <div className="flex items-center gap-4">
                {/* Avatar Bulat (Inisial Nama) */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-arjes-gold to-[#8B735B] flex items-center justify-center text-arjes-bg font-bold text-xl">
                  {review.name.charAt(0)}
                </div>
                
                <div>
                  <h4 className="text-white font-bold">{review.name}</h4>
                  <p className="text-arjes-muted text-xs">{review.role}</p>
                </div>

                {/* Rating Bintang */}
                <div className="ml-auto flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>

            </motion.div>
          ))}
          
          {/* Spacer di ujung kanan biar card terakhir gak mepet pinggir */}
          <div className="min-w-[20px]"></div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;