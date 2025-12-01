import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle, Users, Coffee } from 'lucide-react';

// Data Dummy Meja (Nanti ini dari Database meja.php)
const tables = [
  { id: 1, name: "T1", seats: 2, status: "available", type: "square" },
  { id: 2, name: "T2", seats: 2, status: "booked", type: "square" }, // Ceritanya sudah dibooking
  { id: 3, name: "T3", seats: 4, status: "available", type: "round" },
  { id: 4, name: "T4", seats: 4, status: "available", type: "round" },
  { id: 5, name: "VIP", seats: 8, status: "available", type: "long" },
  { id: 6, name: "T5", seats: 2, status: "available", type: "square" },
  { id: 7, name: "T6", seats: 4, status: "available", type: "square" },
  { id: 8, name: "T7", seats: 4, status: "booked", type: "round" },
];

const Booking = () => {
  const [step, setStep] = useState(1); // 1: Waktu, 2: Meja, 3: Konfirmasi
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: 2,
    tableId: null,
    tableName: ''
  });

  // Fungsi pindah langkah
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-arjes-bg text-white p-6 pb-24">
      
      {/* Header Simple */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-arjes-muted hover:text-white transition-colors">
          <ArrowLeft size={20} /> Batal
        </Link>
        <h1 className="text-xl font-serif font-bold">Reservasi Meja</h1>
        <div className="w-8"></div> {/* Spacer biar tengah */}
      </div>

      {/* Progress Bar (Indikator Langkah) */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex justify-between relative">
          {/* Garis Abu-abu di belakang */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
          {/* Garis Emas Progress */}
          <motion.div 
            className="absolute top-1/2 left-0 h-1 bg-arjes-gold -z-10 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            transition={{ duration: 0.5 }}
          />
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-500
              ${step >= num ? 'bg-arjes-gold border-arjes-bg text-arjes-bg' : 'bg-arjes-surface border-arjes-bg text-white/50'}
            `}>
              {num}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs mt-2 text-arjes-muted font-medium">
          <span>Waktu</span>
          <span>Pilih Meja</span>
          <span>Selesai</span>
        </div>
      </div>

      {/* CONTAINER UTAMA */}
      <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl min-h-[400px]">
        
        {/* --- STEP 1: PILIH WAKTU --- */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Mau datang kapan?</h2>
            
            <div className="space-y-6">
              {/* Input Tanggal */}
              <div>
                <label className="block text-sm text-arjes-muted mb-2">Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-arjes-gold" size={20} />
                  <input 
                    type="date" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-arjes-gold transition-all [color-scheme:dark]"
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Input Jam */}
                <div>
                  <label className="block text-sm text-arjes-muted mb-2">Jam</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-arjes-gold" size={20} />
                    <select 
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-arjes-gold appearance-none cursor-pointer"
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    >
                      <option value="">Pilih Jam</option>
                      <option value="10:00">10:00</option>
                      <option value="13:00">13:00</option>
                      <option value="16:00">16:00</option>
                      <option value="19:00">19:00</option>
                    </select>
                  </div>
                </div>

                {/* Input Jumlah Orang */}
                <div>
                  <label className="block text-sm text-arjes-muted mb-2">Jumlah Orang</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-arjes-gold" size={20} />
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      placeholder="2"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:border-arjes-gold"
                      onChange={(e) => setFormData({...formData, people: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={nextStep}
              disabled={!formData.date || !formData.time}
              className="w-full mt-8 bg-arjes-gold text-arjes-bg font-bold py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut Pilih Meja
            </button>
          </motion.div>
        )}

        {/* --- STEP 2: DENAH MEJA VISUAL --- */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-2">Pilih Meja Kamu</h2>
            <div className="flex gap-4 text-xs mb-6">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-white/10 border border-white/30 rounded"></div> Tersedia</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-arjes-gold rounded"></div> Dipilih</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500/20 rounded"></div> Penuh</span>
            </div>

            {/* VISUALISASI DENAH (CSS GRID) */}
            <div className="border border-white/10 rounded-2xl p-6 bg-black/20 relative min-h-[300px]">
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-white/20 tracking-[0.5em]">BARISTA AREA</span>
              
              <div className="grid grid-cols-4 gap-4 mt-8">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    disabled={table.status === 'booked'}
                    onClick={() => setFormData({...formData, tableId: table.id, tableName: table.name})}
                    className={`
                      relative flex flex-col items-center justify-center p-2 rounded-lg transition-all border-2
                      ${table.id === 5 ? 'col-span-2 row-span-1 h-24' : 'h-20'} /* VIP Table lebih lebar */
                      
                      ${table.status === 'booked' 
                        ? 'bg-red-500/10 border-red-500/20 opacity-50 cursor-not-allowed' 
                        : formData.tableId === table.id 
                          ? 'bg-arjes-gold text-arjes-bg border-arjes-gold scale-105 shadow-lg shadow-arjes-gold/20' 
                          : 'bg-white/5 border-white/10 hover:border-arjes-gold/50 hover:bg-white/10'}
                    `}
                  >
                    <span className="font-bold text-lg">{table.name}</span>
                    <span className="text-[10px] opacity-70">{table.seats} Kursi</span>
                    
                    {/* Hiasan Kursi di sekeliling */}
                    {table.status !== 'booked' && (
                       <div className="absolute -bottom-1 w-8 h-1 bg-current rounded-full opacity-30"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-xl hover:bg-white/5">Kembali</button>
              <button 
                onClick={nextStep}
                disabled={!formData.tableId}
                className="flex-1 bg-arjes-gold text-arjes-bg font-bold py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50"
              >
                Konfirmasi
              </button>
            </div>
          </motion.div>
        )}

        {/* --- STEP 3: SUMMARY & SUKSES --- */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            
            <h2 className="text-3xl font-serif font-bold mb-2">Booking Berhasil!</h2>
            <p className="text-arjes-muted mb-8">Terima kasih, meja kamu sudah kami amankan.</p>

            {/* Tiket Digital */}
            <div className="bg-white text-arjes-bg p-6 rounded-2xl max-w-sm mx-auto shadow-2xl relative overflow-hidden">
              {/* Garis putus-putus */}
              <div className="absolute top-0 left-0 w-full h-2 bg-arjes-gold"></div>
              
              <div className="flex justify-between items-end border-b border-dashed border-gray-300 pb-4 mb-4">
                <div className="text-left">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Meja</span>
                  <h3 className="text-4xl font-bold text-arjes-bg">{formData.tableName}</h3>
                </div>
                <div className="text-right">
                   <span className="text-xs text-gray-500 uppercase tracking-wider">Tamu</span>
                   <p className="font-bold">{formData.people} Orang</p>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="text-left">
                  <p className="text-gray-500">Tanggal</p>
                  <p className="font-bold">{formData.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Jam</p>
                  <p className="font-bold">{formData.time}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-center text-gray-400">Tunjukkan ini ke kasir saat datang</p>
                <p className="text-center font-mono font-bold mt-1 tracking-widest">#ARJ-2025-001</p>
              </div>
            </div>

            <Link to="/" className="inline-block mt-8 text-arjes-gold hover:text-white font-bold">
              Kembali ke Home
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Booking;