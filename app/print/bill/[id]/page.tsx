"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Bill, MONTH_NAMES } from "@/types/bill"
import { Droplets, Printer } from "lucide-react"
import { getCookie } from "@/lib/client-cookies"

function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price)
}

function getBillTotal(bill: Bill) {
    return bill.service?.price && bill.usage_value
        ? bill.service.price * bill.usage_value
        : bill.total_price ?? 0
}

export default function PrintBillPage() {
    const params = useParams()
    const id = params.id as string
    const [bill, setBill] = useState<Bill | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        
        const fetchBill = async () => {
            try {
                const role = getCookie("role")
                const endpoint = role === "CUSTOMER" ? `/bills/me/${id}` : `/bills/${id}`
                const res = await api.get<{ data: Bill }>(endpoint)
                setBill(res.data.data)
                
                // Allow some time for rendering before printing
                setTimeout(() => {
                    window.print()
                }, 500)
            } catch (err: any) {
                setError("Gagal memuat data tagihan.")
            } finally {
                setLoading(false)
            }
        }
        
        fetchBill()
    }, [id])

    if (loading) return <div className="p-10 text-center font-mono text-sm text-gray-500">Memuat struk...</div>
    if (error) return <div className="p-10 text-center font-mono text-sm text-red-500">{error}</div>
    if (!bill) return <div className="p-10 text-center font-mono text-sm text-gray-500">Tagihan tidak ditemukan.</div>

    const total = getBillTotal(bill)
    const printDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
    
    const paymentDate = bill.payments?.updatedAt || bill.payments?.createdAt
    const paidDateStr = paymentDate ? new Date(paymentDate).toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric"
    }) : "-"

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex items-start justify-center print:bg-white print:p-0">
            {/* Non-print controls */}
            <div className="fixed bottom-6 right-6 flex gap-2 print:hidden z-50">
                <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm hover:bg-blue-700 hover:scale-105 transition-all"
                >
                    <Printer size={16} /> Cetak Sekarang
                </button>
            </div>

            {/* Receipt Container */}
            <div className="relative w-full max-w-sm bg-white overflow-hidden shadow-2xl rounded-sm print:shadow-none print:w-full print:max-w-none text-black selection:bg-gray-200">
                {/* Decorative dots top */}
                <div className="h-4 w-full bg-[radial-gradient(circle,transparent_4px,#fff_4px)] bg-[length:12px_12px] -mt-2.5 opacity-0 hidden print:block"></div>
                
                <div className="p-8 font-mono text-sm">
                    {/* Header */}
                    <div className="flex flex-col items-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-3">
                            <Droplets size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-widest uppercase">PDAM Smart</h1>
                        <p className="text-xs text-gray-500 mt-1">Bukti Pembayaran Resmi</p>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-2 mb-6 text-xs border-b-2 border-dashed border-gray-300 pb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-500">No. Tagihan</span>
                            <span className="font-semibold">{bill.id.toString().padStart(6, '0')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tgl. Cetak</span>
                            <span>{printDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tgl. Bayar</span>
                            <span>{paidDateStr}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="font-bold uppercase">( {bill.paid || bill.payments?.verified ? "LUNAS" : "BELUM LUNAS"} )</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-1 mb-6 border-b-2 border-dashed border-gray-300 pb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">Pelanggan</p>
                        <p className="font-bold text-base">{bill.customer?.name}</p>
                        <p className="text-gray-600">ID: {bill.customer?.customer_number}</p>
                    </div>

                    {/* Items */}
                    <div className="space-y-4 mb-6 border-b-2 border-dashed border-gray-300 pb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Rincian</p>
                        
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="font-semibold">Periode</span>
                                <span>{MONTH_NAMES[(bill.month ?? 1) - 1]} {bill.year}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Layanan</span>
                                <span>{bill.service?.name}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>No. Meter</span>
                                <span>{bill.measurement_number}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Pemakaian</span>
                                <span>{bill.usage_value} m³</span>
                            </div>
                        </div>

                        <div className="flex justify-between pt-2">
                            <span>Tarif / m³</span>
                            <span>{formatPrice(bill.service?.price ?? 0)}</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mb-10">
                        <span className="text-gray-500 uppercase tracking-widest font-bold">Total</span>
                        <span className="text-xl font-bold bg-black text-white px-3 py-1 rounded">
                            {formatPrice(total)}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="text-center space-y-2">
                        <p className="text-xs text-gray-400 italic">"Gunakan air secukupnya, hemat air hemat energi."</p>
                        <div className="flex justify-center -mb-2 mt-4 opacity-50">
                            {/* Fake barcode block */}
                            <div className="h-8 flex gap-1 items-end">
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className="bg-black" style={{ 
                                        width: Math.random() > 0.5 ? '2px' : '4px',
                                        height: Math.random() > 0.3 ? '100%' : '70%'
                                    }}></div>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-200">
                            {bill.id.toString().padStart(6, '0')}-{bill.customer_id}-{bill.month}{bill.year}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
