"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Trash2, RefreshCw, Eye, ShieldCheck, Download, CreditCard, X, FileText, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { Payment, PaymentListResponse } from "@/types/payment"
import { MONTH_NAMES } from "@/types/bill"
import { BASE_PAYMENT_PROOF } from "@/global"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Pagination, PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

const PAGE_SIZE = 10

type StatusFilter = "all" | "pending" | "verified"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all",      label: "All" },
    { value: "pending",  label: "Pending Verification" },
    { value: "verified", label: "Verified" },
]

function getPageNumbers(current: number, total: number) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "…", current - 1, current, current + 1, "…", total]
}

function initials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function proofUrl(proof_file: string): string {
    if (proof_file.startsWith("http")) return proof_file
    return `${BASE_PAYMENT_PROOF}/${proof_file}`
}

function StatusBadge({ verified }: { verified: boolean }) {
    if (verified)
        return <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0 gap-1 shrink-0"><CheckCircle2 size={10} />Verified</Badge>
    return <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-0 gap-1 shrink-0"><Clock size={10} />Pending</Badge>
}
import { Clock } from "lucide-react"

// ─── Proof Image Dialog ───────────────────────────────────────────────────────
function ProofDialog({ open, onClose, payment }: { open: boolean; onClose: () => void; payment: Payment | null }) {
    const proof = payment?.payment_proof;
    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
                <div className="relative h-16 bg-linear-to-r from-blue-600 to-blue-500 flex items-end px-5 pb-0">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
                </div>
                <div className="flex justify-center -mt-6 z-10 relative">
                    <div className="w-12 h-12 rounded-full bg-blue-600 border-4 border-background flex items-center justify-center shadow-lg">
                        <Eye size={18} className="text-white" />
                    </div>
                </div>
                <div className="px-6 pb-6 pt-3 space-y-3">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-base font-bold">Bukti Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs">
                            {payment?.bill?.customer?.name} — {payment?.bill ? MONTH_NAMES[(payment.bill.month ?? 1) - 1] : ""} {payment?.bill?.year}
                        </DialogDescription>
                    </DialogHeader>
                    {proof ? (
                        <div className="space-y-4">
                            <div className="rounded-xl overflow-hidden border border-border bg-muted/30 relative aspect-4/3">
                                <Image
                                    src={proofUrl(proof)}
                                    alt="Bukti Pembayaran"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 h-9" onClick={onClose}>Tutup</Button>
                                <a href={proofUrl(proof)} download="bukti-pembayaran" target="_blank" rel="noreferrer" className="flex-1 block">
                                    <Button className="w-full h-9 bg-blue-600 hover:bg-blue-700 gap-1.5 shadow-sm text-xs font-medium text-white">
                                        <Download size={14} /> Download Bukti
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                            <FileText size={32} className="opacity-20" />
                            <p className="text-sm">Belum ada bukti pembayaran</p>
                            <Button variant="outline" className="w-full h-9 mt-4" onClick={onClose}>Tutup</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Verify Confirm Dialog ────────────────────────────────────────────────────
function VerifyDialog({ open, onClose, payment, onSuccess }: {
    open: boolean; onClose: () => void; payment: Payment | null; onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleVerify = async () => {
        if (!payment?.id) return
        setLoading(true); setError(null)
        try {
            await api.patch(`/payments/${payment.id}`)
            onSuccess()
            onClose()
        } catch (e: unknown) {
            setError(
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? "Gagal memverifikasi pembayaran."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
                <div className="h-14 bg-linear-to-r from-emerald-600 to-emerald-500 relative">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
                </div>
                <div className="flex justify-center -mt-6 z-10 relative">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center shadow-lg">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                </div>
                <div className="px-6 pb-6 pt-3 space-y-4">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-base font-bold">Verifikasi Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs">
                            Konfirmasi verifikasi tagihan <span className="font-semibold">{payment?.bill?.customer?.name}</span> bulan{" "}
                            {payment?.bill ? MONTH_NAMES[(payment.bill.month ?? 1) - 1] : ""} {payment?.bill?.year}.
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">{error}</p>
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>Batal</Button>
                        <Button className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700" onClick={handleVerify} disabled={loading}>
                            {loading ? "Memproses…" : "Verifikasi"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteDialog({ open, onClose, payment, onSuccess }: {
    open: boolean; onClose: () => void; payment: Payment | null; onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!payment?.id) return
        setLoading(true); setError(null)
        try {
            await api.delete(`/payments/${payment.id}`)
            onSuccess()
            onClose()
        } catch (e: unknown) {
            setError(
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? "Gagal menghapus pembayaran."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
                <div className="h-14 bg-linear-to-r from-red-600 to-red-500 relative" />
                <div className="flex justify-center -mt-6 z-10 relative">
                    <div className="w-12 h-12 rounded-full bg-red-500 border-4 border-background flex items-center justify-center shadow-lg">
                        <Trash2 size={18} className="text-white" />
                    </div>
                </div>
                <div className="px-6 pb-6 pt-3 space-y-4">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-base font-bold">Hapus Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs">
                            Anda yakin ingin menghapus data pembayaran ini? Data yang terhapus tidak dapat dikembalikan.
                        </DialogDescription>
                    </DialogHeader>
                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">{error}</p>
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>Batal</Button>
                        <Button className="flex-1 h-9 bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={loading}>
                            {loading ? "Menghapus…" : "Hapus"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
    const [allPayments, setAllPayments] = useState<Payment[]>([])
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [loading, setLoading] = useState(true)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [proofOpen, setProofOpen] = useState(false)
    const [verifyOpen, setVerifyOpen] = useState(false)
    const [selected, setSelected] = useState<Payment | null>(null)

    const fetchPayments = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<PaymentListResponse>("/payments", {
                params: { page: 1, quantity: 9999, search: "" },
            })
            setAllPayments(res.data.data ?? [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPayments() }, [fetchPayments])
    useEffect(() => { setPage(1) }, [search, statusFilter])

    // Filter
    const filtered = allPayments
        .filter(p =>
            p.bill?.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.bill?.customer?.customer_number?.toLowerCase().includes(search.toLowerCase())
        )
        .filter(p => {
            if (statusFilter === "all") return true
            if (statusFilter === "verified") return p.verified
            if (statusFilter === "pending") return !p.verified
            return true
        })

    const total = filtered.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const pages = getPageNumbers(page, totalPages)
    const payments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    // Count badges for filter tabs
    const counts = {
        pending:  allPayments.filter(p => !p.verified).length,
        verified: allPayments.filter(p => p.verified).length,
    }

    const openDelete = (p: Payment) => { setSelected(p); setDeleteOpen(true) }
    const openProof  = (p: Payment) => { setSelected(p); setProofOpen(true) }
    const openVerify = (p: Payment) => { setSelected(p); setVerifyOpen(true) }

    return (
        <>
            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Payment Management</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Verify and structure customer payments</p>
                    </div>
                </div>

                {/* Status Filter Tabs */}
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
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
                        <div className="relative w-72">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search customer…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-8 h-8 text-sm"
                            />
                            <AnimatePresence>
                                {search && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setSearch("")}
                                    >
                                        <X size={13} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs gap-1 h-6">
                                <CreditCard size={11} /> {allPayments.length} payment{allPayments.length !== 1 ? "s" : ""}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchPayments} title="Refresh">
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center text-xs">#</TableHead>
                                <TableHead className="text-xs">Customer</TableHead>
                                <TableHead className="text-xs">Bill Period</TableHead>
                                <TableHead className="text-xs">Date Submitted</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs text-right pr-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Skeleton */}
                            {loading && [...Array(5)].map((_, i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    <TableCell><Skeleton className="h-3.5 w-4 mx-auto" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                            <Skeleton className="h-3.5 w-28" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                    <TableCell className="text-right pr-5">
                                        <div className="flex justify-end gap-1">
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Empty */}
                            {!loading && payments.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={6}>
                                        <div className="flex flex-col items-center py-14 gap-2 text-muted-foreground">
                                            <CreditCard size={32} className="opacity-20" />
                                            <p className="text-sm">
                                                {search ? `No payments found for "${search}"` : "No payments yet"}
                                            </p>
                                            {search && (
                                                <Button variant="ghost" size="sm" className="text-xs h-7 mt-1"
                                                    onClick={() => setSearch("")}>
                                                    Clear search
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Data rows */}
                            {!loading && (
                                <AnimatePresence>
                                    {payments.map((payment, i) => {
                                        return (
                                            <motion.tr
                                                key={payment.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03, duration: 0.2 }}
                                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                            >
                                                <TableCell className="text-center text-xs text-muted-foreground w-12">
                                                    {(page - 1) * PAGE_SIZE + i + 1}
                                                </TableCell>

                                                {/* Customer */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-[11px] font-semibold">
                                                                {initials(payment.bill?.customer?.name ?? "?")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-tight">{payment.bill?.customer?.name ?? "—"}</p>
                                                            <p className="text-[11px] text-muted-foreground font-mono">{payment.bill?.customer?.customer_number ?? ""}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Period */}
                                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {payment.bill ? `${MONTH_NAMES[(payment.bill.month ?? 1) - 1]} ${payment.bill.year}` : "—"}
                                                </TableCell>

                                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {new Date(payment.createdAt ?? "").toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <StatusBadge verified={payment.verified} />
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right pr-5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                                            title="Lihat bukti bayar"
                                                            onClick={() => openProof(payment)}>
                                                            <Eye size={13} />
                                                        </Button>
                                                        {/* Verifikasi — hanya jika pending */}
                                                        {!payment.verified && (
                                                            <Button variant="ghost" size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                                                                title="Verifikasi pembayaran"
                                                                onClick={() => openVerify(payment)}>
                                                                <ShieldCheck size={13} />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            title="Hapus pembayaran" onClick={() => openDelete(payment)}>
                                                            <Trash2 size={13} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        )
                                    })}
                                </AnimatePresence>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                            <p className="text-xs text-muted-foreground">
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                                </span>{" "}
                                of <span className="font-medium text-foreground">{total}</span> payments
                            </p>
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    {pages.map((p, i) =>
                                        p === "…" ? (
                                            <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                                        ) : (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={page === p}
                                                    onClick={() => setPage(p as number)}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>

            <DeleteDialog
                open={deleteOpen}
                payment={selected}
                onClose={() => setDeleteOpen(false)}
                onSuccess={fetchPayments}
            />
            <ProofDialog
                open={proofOpen}
                payment={selected}
                onClose={() => setProofOpen(false)}
            />
            <VerifyDialog
                open={verifyOpen}
                payment={selected}
                onClose={() => setVerifyOpen(false)}
                onSuccess={fetchPayments}
            />
        </>
    )
}
