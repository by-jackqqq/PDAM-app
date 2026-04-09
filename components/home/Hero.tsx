"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="pt-32 pb-24 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden flex items-center">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
        {/* Hero Content */}
        <div className="space-y-8 animate-fadeInUp">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight font-display">
            Kelola Air <br /> Bersih Lebih <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Smart & Mudah
            </span>
          </h1>

          <div className="w-44 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" />

          <p className="text-xl text-slate-600 leading-relaxed">
            Platform digital modern untuk pembayaran tagihan air, monitoring penggunaan real-time,
            dan layanan pelanggan terbaik. Semua dalam satu aplikasi.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-all hover:-translate-y-1 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 flex items-center gap-2">
              Daftar Sekarang
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all hover:-translate-y-1">
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="relative flex justify-end">
          <div className=" transform hover:scale-105 transition-transform duration-500">
            <div>
              <Image
                src="images/hero.svg"
                width={500}
                height={500}
                alt="Picture of the author"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
