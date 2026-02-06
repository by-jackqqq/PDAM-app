"use client";

import { Droplets } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-blue-600 font-display">PDAM Smart</span>
          </a>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-12">
            <li><a href="./" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Beranda</a></li>
            <li><a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Fitur</a></li>
            <li><a href="#services" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Layanan</a></li>
            <li><a href="#testimonials" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Testimoni</a></li>
            <li><a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Kontak</a></li>
          </ul>

          {/* CTA Button */}
          <div className="hidden md:block">

            <Link href="/login">
              <button
                onClick={() => (true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
              >
                Masuk
              </button>
            </Link>
          </div>

          
        </div>
        </div>
    </nav>
  )
}
