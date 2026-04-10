"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, Eye, CreditCard, CheckCircle2, Clock } from "lucide-react"
import { api } from "@/lib/api"
import { Payment, PaymentListResponse } from "@/types/payment"
import { MONTH_NAMES } from "@/types/bill"

// UI Components
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

// Import Modal yang sudah dipisah
import { ProofDialog } from "@/components/dashboard/payments/proof-dialog"

const PAGE_SIZE = 10
type StatusFilter = "all" | "pending" | "verified"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "pending", label: "Menunggu Verifikasi" },
    { value: "verified", label: "Lunas" },
]

// Helper Functions
function getPageNumbers(current: number, total: number) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "…", current - 1, current, current + 1, "…", total]
}

function StatusBadge({ verified }: { verified: boolean }) {
    if (verified)
        return <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0 gap-1 shrink-0"><CheckCircle2 size={10} />Lunas</Badge>
    return <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-0 gap-1 shrink-0"><Clock size={10} />Pending</Badge>
}

export default function CustomerPaymentsPage() {
    const [allPayments, setAllPayments] = useState<Payment[]>([])
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [loading, setLoading] = useState(true)

    // State untuk Modal
    const [proofOpen, setProofOpen] = useState(false)
    const [selected, setSelected] = useState<Payment | null>(null)

    const fetchPayments = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<PaymentListResponse>("/payments/me", {
                params: { page: 1, quantity: 9999, search: "" },
            })
            setAllPayments(res.data.data ?? [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPayments() }, [fetchPayments])
    useEffect(() => { setPage(1) }, [statusFilter])

    const filtered = allPayments.filter(p => {
        if (statusFilter === "all") return true
        if (statusFilter === "verified") return p.verified
        return !p.verified
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const pages = getPageNumbers(page, totalPages)
    const payments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const counts = {
        pending: allPayments.filter(p => !p.verified).length,
        verified: allPayments.filter(p => p.verified).length,
    }

    const openProof = (p: Payment) => {
        setSelected(p)
        setProofOpen(true)
    }

    return (
        <div className="p-6 space-y-5">
            {/* Header & Filter Tabs (Sama seperti sebelumnya) */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembayaran</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Lihat status dan bukti pembayaran Anda</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                            statusFilter === f.value
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground"
                        }`}
                    >
                        {f.label}
                        {f.value !== "all" && (
                            <span className={`px-1 rounded text-[10px] font-bold ${
                                statusFilter === f.value ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                            }`}>
                                {counts[f.value as keyof typeof counts]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12 text-center text-xs">#</TableHead>
                            <TableHead className="text-xs">Periode Tagihan</TableHead>
                            <TableHead className="text-xs">Tgl Upload</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs text-right pr-5">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ))
                        ) : payments.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-10 opacity-50">Data tidak ditemukan</TableCell></TableRow>
                        ) : (
                            <AnimatePresence>
                                {payments.map((payment, i) => (
                                    <motion.tr 
                                        key={payment.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b last:border-0 hover:bg-muted/30"
                                    >
                                        <TableCell className="text-center text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {payment.bill ? `${MONTH_NAMES[(payment.bill.month ?? 1) - 1]} ${payment.bill.year}` : "—"}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(payment.createdAt ?? "").toLocaleDateString("id-ID")}
                                        </TableCell>
                                        <TableCell><StatusBadge verified={payment.verified} /></TableCell>
                                        <TableCell className="text-right pr-5">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openProof(payment)}>
                                                <Eye size={13} />
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination (Sama seperti sebelumnya) */}
            </div>

            {/* Modal Dialog Dipanggil di Sini */}
            <ProofDialog
                open={proofOpen}
                payment={selected}
                onClose={() => setProofOpen(false)}
            />
        </div>
    )
}