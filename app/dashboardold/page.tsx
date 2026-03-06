import StatCard from "../components/dashboard/Statcard"

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Dashboard PDAM
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Customer" value="1.245" />
        <StatCard title="Tagihan Aktif" value="342" />
        <StatCard title="Pembayaran Pending" value="23" />
        <StatCard title="Total Layanan" value="6" />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-lg mb-4">
          Aktivitas Terbaru
        </h2>
        <p className="text-slate-500 text-sm">
          Data akan ditampilkan setelah integrasi API.
        </p>
      </div>
    </>
  )
}
