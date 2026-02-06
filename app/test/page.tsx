'use client';

import { useState, useEffect } from 'react';
import {
    Droplets,
    Shield,
    Smartphone,
    Clock,
    TrendingUp,
    Users,
    CheckCircle,
    Star,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';

export default function PdamSmartLanding() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: "Pembayaran Digital",
            description: "Bayar tagihan air kapan saja, dimana saja melalui aplikasi mobile atau web"
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Monitoring Real-time",
            description: "Pantau penggunaan air Anda secara real-time dengan grafik yang informatif"
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Keamanan Terjamin",
            description: "Data pribadi dan transaksi Anda dilindungi dengan enkripsi tingkat bank"
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Analisis Penggunaan",
            description: "Dapatkan insights tentang pola penggunaan air untuk menghemat biaya"
        }
    ];

    const services = [
        {
            title: "Rumah Tangga",
            price: "Mulai Rp 11.000/m³",
            features: ["Abodemen Rp 17.000", "Monitoring 24/7", "Pembayaran Otomatis", "Laporan Bulanan"]
        },
        {
            title: "Komersial",
            price: "Mulai Rp 12.000/m³",
            features: ["Abodemen Rp 68.000", "Prioritas Layanan", "Dashboard Analytics", "Support Khusus"],
            featured: true
        },
        {
            title: "Industri",
            price: "Mulai Rp 12.500/m³",
            features: ["Abodemen Rp 340.000", "Volume Tinggi", "SLA Terjamin", "Dedicated Manager"]
        },
        {
            title: "Instansi",
            price: "Custom",
            features: ["Paket Khusus", "Negosiasi Harga", "Layanan Premium", "Konsultasi Gratis"]
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Daftar Akun",
            description: "Buat akun dengan NIK dan data pelanggan Anda"
        },
        {
            number: "02",
            title: "Verifikasi",
            description: "Tim kami akan memverifikasi data Anda dalam 1x24 jam"
        },
        {
            number: "03",
            title: "Mulai Gunakan",
            description: "Login dan nikmati kemudahan layanan digital PDAM"
        }
    ];

    const testimonials = [
        {
            name: "Budi Santoso",
            role: "Pelanggan Rumah Tangga",
            rating: 5,
            comment: "Sangat membantu! Tidak perlu lagi antri untuk bayar tagihan air. Semua bisa dilakukan dari smartphone."
        },
        {
            name: "Siti Rahayu",
            role: "Pemilik Usaha",
            rating: 5,
            comment: "Dashboard analytics sangat berguna untuk monitor penggunaan air di toko saya. Bisa hemat biaya operasional."
        },
        {
            name: "Ahmad Wijaya",
            role: "Manager Pabrik",
            rating: 5,
            comment: "Layanan untuk industri sangat profesional. Support team responsif dan SLA terjamin. Recommended!"
        }
    ];

    const stats = [
        { value: "50K+", label: "Pelanggan Aktif" },
        { value: "99.9%", label: "Uptime System" },
        { value: "24/7", label: "Customer Support" },
        { value: "500+", label: "Transaksi/Hari" }
    ];

    if (showDashboard) {
        return <AdminDashboard onBack={() => setShowDashboard(false)} />;
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-xl shadow-lg'
                    : 'bg-white/80 backdrop-blur-md border-b border-black/5'
                }`}>
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
                            <li><a href="#home" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Beranda</a></li>
                            <li><a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Fitur</a></li>
                            <li><a href="#services" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Layanan</a></li>
                            <li><a href="#testimonials" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Testimoni</a></li>
                            <li><a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Kontak</a></li>
                        </ul>

                        {/* CTA Button */}
                        <div className="hidden md:block">
                            <button
                                onClick={() => setShowDashboard(true)}
                                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
                            >
                                Masuk
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-slate-200">
                            <ul className="flex flex-col gap-4">
                                <li><a href="#home" className="block text-slate-600 hover:text-blue-600 font-medium">Beranda</a></li>
                                <li><a href="#features" className="block text-slate-600 hover:text-blue-600 font-medium">Fitur</a></li>
                                <li><a href="#services" className="block text-slate-600 hover:text-blue-600 font-medium">Layanan</a></li>
                                <li><a href="#testimonials" className="block text-slate-600 hover:text-blue-600 font-medium">Testimoni</a></li>
                                <li><a href="#contact" className="block text-slate-600 hover:text-blue-600 font-medium">Kontak</a></li>
                                <li>
                                    <button
                                        onClick={() => setShowDashboard(true)}
                                        className="w-full bg-blue-600 text-white px-8 py-3 rounded-full font-semibold"
                                    >
                                        Masuk
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="pt-32 pb-24 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
                    {/* Hero Content */}
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-600/20 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold">
                            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            Layanan Digital Terpercaya
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight font-display">
                            Kelola Air Bersih Lebih{' '}
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

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center lg:text-left">
                                    <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                                    <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Image/Illustration */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 shadow-2xl shadow-blue-600/20 transform hover:scale-105 transition-transform duration-500">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <div className="text-white space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                            <Droplets className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <div className="text-sm opacity-90">Total Penggunaan Bulan Ini</div>
                                            <div className="text-3xl font-bold">25.8 m³</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Tagihan Tertunda</span>
                                            <span className="font-semibold">Rp 275.000</span>
                                        </div>
                                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full" style={{ width: '65%' }} />
                                        </div>
                                    </div>

                                    <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                                        Bayar Sekarang
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            Fitur Unggulan
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 font-display">
                            Kenapa Memilih <span className="text-blue-600">PDAM Smart</span>?
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Platform kami dirancang untuk memberikan pengalaman terbaik dalam mengelola kebutuhan air bersih Anda
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/30">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 px-6 lg:px-12 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            Paket Layanan
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 font-display">
                            Pilih Paket yang <span className="text-blue-600">Sesuai Kebutuhan</span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Kami menyediakan berbagai paket layanan untuk memenuhi kebutuhan rumah tangga hingga industri
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className={`bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${service.featured
                                        ? 'border-2 border-blue-600 shadow-xl shadow-blue-600/20 relative'
                                        : 'border border-slate-200 hover:shadow-xl'
                                    }`}
                            >
                                {service.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                        Popular
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{service.title}</h3>
                                    <div className="text-3xl font-extrabold text-blue-600">{service.price}</div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {service.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${service.featured
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }`}>
                                    Pilih Paket
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            Cara Kerja
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 font-display">
                            Mudah & <span className="text-blue-600">Cepat Dimulai</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative">
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
                                    <div className="text-6xl font-extrabold text-blue-600/20 mb-4">{step.number}</div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                                </div>
                                {idx < steps.length - 1 && (
                                    <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-blue-600/30 -translate-y-1/2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-6 lg:px-12 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            Testimoni
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 font-display">
                            Apa Kata <span className="text-blue-600">Pelanggan Kami</span>?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-2">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-6 italic">"{testimonial.comment}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                                        <div className="text-sm text-slate-600">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-blue-600 to-cyan-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 font-display">
                        Siap Beralih ke Layanan Digital?
                    </h2>
                    <p className="text-xl text-blue-50 mb-8">
                        Bergabunglah dengan ribuan pelanggan yang telah merasakan kemudahan PDAM Smart
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all hover:-translate-y-1 shadow-xl">
                            Daftar Gratis Sekarang
                        </button>
                        <button className="bg-transparent text-white px-8 py-4 rounded-full font-semibold border-2 border-white hover:bg-white/10 transition-all hover:-translate-y-1">
                            Hubungi Kami
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-slate-900 text-white py-16 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Droplets className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-2xl">PDAM Smart</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Platform digital terpercaya untuk layanan air bersih modern. Kelola tagihan, monitor penggunaan,
                                dan nikmati berbagai kemudahan dalam satu aplikasi.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <span className="sr-only">Facebook</span>f
                                </a>
                                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <span className="sr-only">Twitter</span>𝕏
                                </a>
                                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                    <span className="sr-only">Instagram</span>📷
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Layanan</h3>
                            <ul className="space-y-3 text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Rumah Tangga</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Komersial</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Industri</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Instansi</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Kontak</h3>
                            <ul className="space-y-3 text-slate-400">
                                <li>Email: info@pdamsmart.id</li>
                                <li>Telepon: (021) 123-4567</li>
                                <li>WhatsApp: 0812-3456-7890</li>
                                <li>Jam Kerja: 08:00 - 17:00 WIB</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
                        <p>&copy; 2025 PDAM Smart. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Admin Dashboard Component
function AdminDashboard({ onBack }: { onBack: () => void }) {
    const dashboardStats = [
        { label: "Total Pelanggan", value: "2,845", trend: "+12.5%", color: "blue" },
        { label: "Pendapatan Bulan Ini", value: "Rp 156.8M", trend: "+8.2%", color: "green" },
        { label: "Tagihan Tertunda", value: "156", trend: "-5.3%", color: "yellow" },
        { label: "Penggunaan Air", value: "45,678 m³", trend: "+3.1%", color: "cyan" }
    ];

    const customers = [
        { id: "34545898012332", name: "Budi Hartono", address: "Jakarta, Indonesia", service: "Rumah Tangga", phone: "081335810890", status: "Aktif" },
        { id: "34545898012333", name: "Siti Pratiwi", address: "Bandung, Indonesia", service: "Komersial", phone: "081234567890", status: "Aktif" },
        { id: "34545898012334", name: "Ahmad Maulana", address: "Surabaya, Indonesia", service: "Industri", phone: "081234567891", status: "Pending" }
    ];

    const payments = [
        { id: "BILL-001", customer: "Budi Hartono", period: "Februari 2025", amount: "Rp 275.000", date: "04 Feb 2025", status: "Terverifikasi" },
        { id: "BILL-002", customer: "Siti Pratiwi", period: "Februari 2025", amount: "Rp 480.000", date: "03 Feb 2025", status: "Menunggu" },
        { id: "BILL-003", customer: "Ahmad Maulana", period: "Februari 2025", amount: "Rp 1.250.000", date: "02 Feb 2025", status: "Terverifikasi" }
    ];

    const bills = [
        { id: "BILL-004", customerId: "34545898012332", period: "Februari 2025", reading: "30041", usage: "25", amount: "Rp 275.000", status: "Belum Dibayar" },
        { id: "BILL-005", customerId: "34545898012333", period: "Februari 2025", reading: "30042", usage: "40", amount: "Rp 480.000", status: "Belum Dibayar" }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Dashboard Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <Droplets className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                                    <p className="text-sm text-slate-600">PDAM Smart Management</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm font-semibold text-slate-900">Administrator</div>
                                <div className="text-xs text-slate-600">admin@pdamsmart.id</div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardStats.map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-sm font-medium text-slate-600">{stat.label}</div>
                                <TrendingUp className={`w-5 h-5 text-${stat.color}-600`} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                            <div className={`text-sm font-medium text-${stat.color}-600`}>{stat.trend} dari bulan lalu</div>
                        </div>
                    ))}
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Pelanggan Terbaru</h2>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                            + Tambah Pelanggan
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No. Pelanggan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Alamat</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Layanan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Telepon</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {customers.map((customer, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4"><strong className="font-semibold text-slate-900">{customer.id}</strong></td>
                                        <td className="px-6 py-4 text-slate-700">{customer.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{customer.address}</td>
                                        <td className="px-6 py-4 text-slate-700">{customer.service}</td>
                                        <td className="px-6 py-4 text-slate-600">{customer.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${customer.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Pembayaran Terbaru</h2>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                            Lihat Semua
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID Tagihan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pelanggan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Periode</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal Bayar</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {payments.map((payment, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4"><strong className="font-semibold text-slate-900">#{payment.id}</strong></td>
                                        <td className="px-6 py-4 text-slate-700">{payment.customer}</td>
                                        <td className="px-6 py-4 text-slate-600">{payment.period}</td>
                                        <td className="px-6 py-4"><strong className="font-semibold text-slate-900">{payment.amount}</strong></td>
                                        <td className="px-6 py-4 text-slate-600">{payment.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'Terverifikasi' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                                {payment.status === 'Terverifikasi' ? 'Lihat' : 'Verifikasi'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bills Management Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Manajemen Tagihan</h2>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                            + Buat Tagihan Baru
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID Tagihan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No. Pelanggan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Periode</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No. Pencatatan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Penggunaan (m³)</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Jumlah</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {bills.map((bill, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4"><strong className="font-semibold text-slate-900">#{bill.id}</strong></td>
                                        <td className="px-6 py-4 text-slate-700">{bill.customerId}</td>
                                        <td className="px-6 py-4 text-slate-600">{bill.period}</td>
                                        <td className="px-6 py-4 text-slate-700">{bill.reading}</td>
                                        <td className="px-6 py-4 text-slate-700">{bill.usage}</td>
                                        <td className="px-6 py-4"><strong className="font-semibold text-slate-900">{bill.amount}</strong></td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
