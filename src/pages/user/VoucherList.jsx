import React, { useState } from 'react';
import { Copy, Check, Ticket, Clock } from 'lucide-react'; // Pastikan sudah install lucide-react

const vouchersData = [
  {
    id: 1,
    title: "Diskon Opening",
    desc: "Potongan harga untuk semua menu kopi & main course.",
    minPurchase: "Min. belanja Rp 50.000",
    validUntil: "31 Des 2024",
    code: "ARJES20",
    discount: "20%"
  },
  {
    id: 2,
    title: "Hemat Pickup",
    desc: "Khusus pemesanan ambil sendiri (Self Pickup).",
    minPurchase: "Min. belanja Rp 40.000",
    validUntil: "15 Jan 2025",
    code: "PICKUPHEMAT",
    discount: "Rp 15rb"
  },
  {
    id: 3,
    title: "Traktiran Teman",
    desc: "Beli 2 Kopi Susu Arjes gratis 1 Snack.",
    minPurchase: "Tanpa minimum",
    validUntil: "20 Des 2024",
    code: "TRAKTIRARJES",
    discount: "Free Item"
  }
];

export default function VoucherList() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    
    // Reset status "Copied" setelah 2 detik
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="w-full p-6 text-white">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-arjes-gold mb-2">Voucher Tersedia</h2>
        <p className="text-arjes-muted text-sm">Gunakan kode di bawah ini saat checkout untuk hemat lebih banyak.</p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {vouchersData.map((voucher) => (
          <div 
            key={voucher.id} 
            className="group relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-arjes-gold/50 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Bagian Atas: Info Voucher */}
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-arjes-gold transition-colors">
                    {voucher.title}
                  </h3>
                  <span className="inline-block px-2 py-0.5 mt-1 text-xs font-semibold bg-arjes-gold/20 text-arjes-gold rounded">
                    {voucher.discount}
                  </span>
                </div>
                <Ticket className="text-white/20 group-hover:text-arjes-gold/40 transition-colors" size={40} />
              </div>
              
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                {voucher.desc}
              </p>

              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-arjes-gold"></span>
                  {voucher.minPurchase}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  Berlaku s/d {voucher.validUntil}
                </div>
              </div>
            </div>

            {/* Garis Putus-putus Dekorasi */}
            <div className="relative h-4 bg-black/20">
              <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-white/20"></div>
              {/* Lingkaran kecil kiri kanan biar mirip tiket */}
              <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#0a0a0a] rounded-full -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#0a0a0a] rounded-full -translate-y-1/2"></div>
            </div>

            {/* Bagian Bawah: Copy Code */}
            <div className="p-4 bg-black/20 flex items-center justify-between gap-4">
              <div className="flex-1 bg-black/40 border border-white/10 border-dashed rounded px-3 py-2 text-center font-mono text-arjes-gold tracking-widest font-bold">
                {voucher.code}
              </div>
              
              <button
                onClick={() => handleCopy(voucher.code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 
                  ${copiedCode === voucher.code 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-arjes-gold text-black hover:bg-yellow-500 active:scale-95'
                  }`}
              >
                {copiedCode === voucher.code ? (
                  <>
                    <Check size={16} /> Salin
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Salin
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}