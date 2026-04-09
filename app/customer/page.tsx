"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
    FileText, CreditCard, CheckCircle2, Clock, XCircle,
    RefreshCw, ArrowRight, Droplets, Wallet, Receipt,
    AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Bill } from "@/types/bill"

// ─── Helpers ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function formatPrice(n: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(n)
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
    })
}

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "Selamat pagi"
    if (h < 17) return "Selamat siang"
    return "Selamat malam"
}

function getToday() {
    return new Date().toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    })
}

function getBillTotal(bill: Bill) {
    return bill.service?.price && bill.usage_value
        ? bill.service.price * bill.usage_value
        : bill.total_price ?? 0
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
    const s = (status ?? "").toLowerCase()
    if (s === "verified" || s === "paid")
        return <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0 gap-1"><CheckCircle2 size={10} />Paid</Badge>
    if (s === "pending")
        return <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-0 gap-1"><Clock size={10} />Pending</Badge>
    return <Badge className="text-[10px] bg-red-500/10 text-red-600 border-0 gap-1"><XCircle size={10} />{status ?? "Unpaid"}</Badge>
}

function getBillStatus(bill: Bill): string {
    if (bill.paid) return "verified"
    if (bill.payments) {
        if (bill.payments.verified) return "verified"
        return "pending"
    }
    const bs = bill.status?.toLowerCase() || ""
    if (["verified", "paid", "success", "lunas"].includes(bs)) return "verified"
    if (["pending", "menunggu"].includes(bs)) return "pending"
    return "unpaid"
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
    const [bills, setBills] = useState<Bill[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchAll = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
            const billsRes = await api.get("/bills/me", { params: { page: 1, quantity: 9999 } })
            setBills(billsRes.data.data ?? [])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => { fetchAll() }, [fetchAll])

    // ── Derived stats ──────────────────────────────────────────────────────────
    const totalBills = bills.length
    const paidBills = bills.filter(b => ["paid", "verified"].includes(getBillStatus(b))).length
    const unpaidBills = totalBills - paidBills
    const totalUnpaidAmount = bills
        .filter(b => !["paid", "verified"].includes(getBillStatus(b)))
        .reduce((sum, b) => sum + getBillTotal(b), 0)
        
    const payments = bills
        .filter(b => b.payments)
        .map(b => ({ ...b.payments, createdAt: b.payments?.createdAt || b.payments?.payment_date, bill: b }))
        .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())

    const totalPaidPayments = payments.filter(p => p.verified).length

    const recentBills = [...bills].reverse().slice(0, 5)
    // Gunakan `Payment | any` karena kita sudah membentuk ulang untuk UI recent payments
    const recentPayments: any[] = payments.slice(0, 5)

    const statCards = [
        {
            label: "Total Tagihan", value: totalBills, icon: FileText,
            gradient: "bg-blue-500", sub: "semua periode",
            href: "/customer/bills", delay: 0,
        },
        {
            label: "Sudah Dibayar", value: paidBills, icon: CheckCircle2,
            gradient: "bg-emerald-500", sub: "tagihan lunas",
            href: "/customer/bills", delay: 0.05,
        },
        {
            label: "Belum Dibayar", value: unpaidBills, icon: AlertCircle,
            gradient: "bg-amber-500", sub: "perlu dilunasi",
            href: "/customer/bills", delay: 0.1,
        },
        {
            label: "Total Pembayaran", value: totalPaidPayments, icon: CreditCard,
            gradient: "bg-violet-500", sub: "transaksi",
            href: "/customer/payments", delay: 0.15,
        },
    ]

    const customerName = bills[0]?.customer?.name ?? bills[bills.length - 1]?.customer?.name

    return (
        <div className="space-y-6">

            {/* ── Hero Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-2xl overflow-hidden bg-linear-to-br from-blue-600 to-blue-500 p-6 shadow-lg shadow-blue-500/20"
            >
                <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-0 right-16 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                                <Droplets size={14} className="text-white" />
                            </div>
                            <span className="text-blue-100 text-xs font-medium">PDAM Smart — Customer Portal</span>
                        </div>
                        <h1 className="text-white text-2xl font-bold tracking-tight">
                            {getGreeting()}{customerName ? `, ${customerName.split(" ")[0]}` : ""}! 👋
                        </h1>
                        <p className="text-blue-100/80 text-sm mt-0.5">{getToday()}</p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 shrink-0 bg-white/15 border-white/25 text-white hover:bg-white/25 hover:text-white backdrop-blur-sm"
                        onClick={() => fetchAll(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            {/* ── Unpaid alert ── */}
            {!loading && unpaidBills > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3.5"
                >
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                        <AlertCircle size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-800">
                            Kamu memiliki {unpaidBills} tagihan yang belum dibayar
                        </p>
                        <p className="text-xs text-amber-600">
                            Total tunggakan: <span className="font-bold">{formatPrice(totalUnpaidAmount)}</span>
                        </p>
                    </div>
                    <Link href="/customer/bills">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1 shrink-0 text-xs">
                            Bayar <ArrowRight size={12} />
                        </Button>
                    </Link>
                </motion.div>
            )}

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: s.delay, duration: 0.35 }}
                    >
                        <Link href={s.href}>
                            <div className="relative rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden">
                                <div className={`absolute top-0 left-0 right-0 h-[3px] ${s.gradient} rounded-t-2xl`} />
                                <div className="flex items-start justify-between">
                                    <div className={`h-10 w-10 rounded-xl ${s.gradient} flex items-center justify-center`}>
                                        <s.icon size={18} className="text-white" />
                                    </div>
                                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <div className="mt-4">
                                    {loading
                                        ? <Skeleton className="h-8 w-16 mb-1" />
                                        : <p className="text-3xl font-bold tracking-tight">{s.value.toLocaleString()}</p>
                                    }
                                    <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
                                    <p className="text-[11px] text-muted-foreground/60">{s.sub}</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* ── Total Tunggakan card ── */}
            {!loading && totalUnpaidAmount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-5 flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                        <Wallet size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600/70">Total Tunggakan</p>
                        <p className="text-2xl font-bold text-amber-700">{formatPrice(totalUnpaidAmount)}</p>
                        <p className="text-xs text-amber-600/60 mt-0.5">dari {unpaidBills} tagihan yang belum lunas</p>
                    </div>
                    <Link href="/customer/bills">
                        <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 gap-1">
                            Lihat Tagihan <ArrowRight size={12} />
                        </Button>
                    </Link>
                </motion.div>
            )}

            {/* ── Recent Bills + Recent Payments ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Recent Bills */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div>
                            <p className="text-sm font-semibold">Tagihan Terbaru</p>
                            <p className="text-xs text-muted-foreground">5 tagihan terakhir</p>
                        </div>
                        <Link href="/customer/bills">
                            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Semua <ArrowRight size={11} />
                            </Button>
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {loading && [...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3">
                                <div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /></div>
                                <div className="flex items-center gap-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-16 rounded-full" /></div>
                            </div>
                        ))}
                        {!loading && recentBills.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-10">Belum ada tagihan</p>
                        )}
                        {!loading && recentBills.map(bill => (
                            <div key={bill.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Receipt size={14} className="text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {MONTH_NAMES[(bill.month ?? 1) - 1]} {bill.year}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {bill.service?.name ?? "—"} · {bill.usage_value} m³
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <p className="text-xs font-semibold">{formatPrice(getBillTotal(bill))}</p>
                                    <StatusBadge status={bill.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Payments */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-border bg-card overflow-hidden"
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div>
                            <p className="text-sm font-semibold">Riwayat Pembayaran</p>
                            <p className="text-xs text-muted-foreground">5 pembayaran terakhir</p>
                        </div>
                        <Link href="/customer/payments">
                            <Button variant="ghost" size="sm" className="text-xs h-7 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Semua <ArrowRight size={11} />
                            </Button>
                        </Link>
                    </div>
                    <div className="divide-y divide-border">
                        {loading && [...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3">
                                <div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /></div>
                                <div className="flex items-center gap-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-16 rounded-full" /></div>
                            </div>
                        ))}
                        {!loading && recentPayments.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-10">Belum ada pembayaran</p>
                        )}
                        {!loading && recentPayments.map(p => (
                            <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                                            {p.bill?.service?.name?.[0] ?? "P"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {p.bill
                                                ? `${MONTH_NAMES[(p.bill.month ?? 1) - 1]} ${p.bill.year}`
                                                : `Payment #${p.id}`
                                            }
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {p.createdAt ? formatDate(p.createdAt) : "—"}
                                            {p.bill?.service?.name && ` · ${p.bill.service.name}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <p className="text-xs font-semibold">{formatPrice(p.amount ?? 0)}</p>
                                    <StatusBadge status={p.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

        </div>
    )
}
