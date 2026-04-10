"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, RefreshCw, FileText, X, Droplets,
    CheckCircle2, Clock, XCircle, Upload, Image as ImageIcon, Loader2, Printer,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { api } from "@/lib/api"
import { Bill, BillListResponse, MONTH_NAMES } from "@/types/bill"
import { BASE_PAYMENT_PROOF } from "@/global"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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

type StatusFilter = "all" | "unpaid" | "pending" | "verified"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all",      label: "Semua" },
    { value: "unpaid",   label: "Belum Terbayar" },
    { value: "pending",  label: "Menunggu Verifikasi" },
    { value: "verified", label: "Lunas" },
]

function getPageNumbers(current: number, total: number) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "…", current - 1, current, current + 1, "…", total]
}

function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price)
}

function getBillTotal(bill: Bill) {
    return bill.service?.price && bill.usage_value
        ? bill.service.price * bill.usage_value
        : bill.total_price ?? 0
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

function proofUrl(proof_file: string): string {
    if (proof_file.startsWith("http")) return proof_file
    return `${BASE_PAYMENT_PROOF}/${proof_file}`
}

function StatusBadge({ status }: { status: string }) {
    if (status === "verified")
        return <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0 gap-1 shrink-0"><CheckCircle2 size={10} />Lunas</Badge>
    if (status === "pending")
        return <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-0 gap-1 shrink-0"><Clock size={10} />Menunggu Verifikasi</Badge>
    return <Badge className="text-[10px] bg-red-500/10 text-red-600 border-0 gap-1 shrink-0"><XCircle size={10} />Belum Terbayar</Badge>
}

// ─── Upload Payment Dialog ────────────────────────────────────────────────────
function UploadPaymentDialog({ open, onClose, bill, onSuccess }: {
    open: boolean; onClose: () => void; bill: Bill | null; onSuccess: () => void
}) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!open) { setFile(null); setPreview(null); setError(null) }
    }, [open])

    const handleFile = (f: File) => {
        setFile(f)
        setPreview(URL.createObjectURL(f))
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f && f.type.startsWith("image/")) handleFile(f)
    }

    const handleSubmit = async () => {
        if (!bill || !file) return
        setLoading(true); setError(null)
        try {
            const formData = new FormData()
            formData.append("bill_id", String(bill.id))
            formData.append("file", file)
            await api.post("/payments", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            onSuccess()
            onClose()
        } catch (e: unknown) {
            setError(
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? "Gagal mengunggah bukti pembayaran."
            )
        } finally {
            setLoading(false)
        }
    }

    const total = bill ? getBillTotal(bill) : 0

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
                {/* Banner */}
                <div className="relative h-20 bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
                </div>
                <div className="flex justify-center -mt-7 z-10 relative">
                    <div className="w-14 h-14 rounded-full bg-blue-600 border-4 border-background flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
                        <Upload size={22} className="text-white" />
                    </div>
                </div>

                <div className="px-6 pb-6 pt-3 space-y-4">
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-base font-bold">Upload Bukti Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs">
                            {bill ? `${MONTH_NAMES[(bill.month ?? 1) - 1]} ${bill.year}` : ""} —{" "}
                            <span className="font-semibold text-foreground">{formatPrice(total)}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">{error}</p>
                    )}

                    {/* Drop zone */}
                    <div
                        className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer group ${
                            preview ? "border-blue-300 bg-blue-50/50" : "border-border hover:border-blue-400 hover:bg-blue-50/30"
                        }`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                        {preview ? (
                            <div className="relative aspect-4/3 rounded-lg overflow-hidden">
                                <Image src={preview} alt="preview" fill className="object-contain" unoptimized />
                                <button
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                                    onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                                >
                                    <X size={12} className="text-white" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground group-hover:text-blue-600 transition-colors">
                                <ImageIcon size={28} className="opacity-40" />
                                <p className="text-sm font-medium">Klik atau drag & drop gambar</p>
                                <p className="text-xs opacity-60">PNG, JPG, JPEG (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button
                            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700"
                            onClick={handleSubmit}
                            disabled={!file || loading}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : "Kirim Bukti"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Proof Viewer Dialog ──────────────────────────────────────────────────────
function ProofViewDialog({ open, onClose, bill }: { open: boolean; onClose: () => void; bill: Bill | null }) {
    const proof = bill?.payments?.payment_proof;
    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
                <div className="h-14 bg-linear-to-r from-amber-500 to-orange-400" />
                <div className="flex justify-center -mt-6 z-10 relative">
                    <div className="w-12 h-12 rounded-full bg-amber-500 border-4 border-background flex items-center justify-center shadow-lg">
                        <ImageIcon size={18} className="text-white" />
                    </div>
                </div>
                <div className="px-6 pb-6 pt-3 space-y-3">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-base font-bold">Bukti Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs">
                            {bill ? `${MONTH_NAMES[(bill.month ?? 1) - 1]} ${bill.year}` : ""} — Menunggu Verifikasi
                        </DialogDescription>
                    </DialogHeader>
                    {proof ? (
                        <div className="rounded-xl overflow-hidden border border-border bg-muted/30 relative aspect-4/3">
                            <Image src={proofUrl(proof)} alt="Bukti Pembayaran" fill className="object-contain" unoptimized />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                            <FileText size={32} className="opacity-20" />
                            <p className="text-sm">Belum ada bukti pembayaran</p>
                        </div>
                    )}
                    <Button variant="outline" className="w-full h-9" onClick={onClose}>Tutup</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomerBillsPage() {
    const [allBills, setAllBills] = useState<Bill[]>([])
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [loading, setLoading] = useState(true)

    const [uploadBill, setUploadBill] = useState<Bill | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [proofBill, setProofBill] = useState<Bill | null>(null)
    const [proofOpen, setProofOpen] = useState(false)

    const fetchBills = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<BillListResponse>("/bills/me", {
                params: { page: 1, quantity: 9999 },
            })
            setAllBills(res.data.data ?? [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchBills() }, [fetchBills])
    useEffect(() => { setPage(1) }, [search, statusFilter])

    const filtered = allBills
        .filter(b =>
            b.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
            b.measurement_number?.toLowerCase().includes(search.toLowerCase()) ||
            String(b.month).includes(search) ||
            String(b.year).includes(search)
        )
        .filter(b => {
            if (statusFilter === "all") return true
            return getBillStatus(b) === statusFilter
        })

    const total = filtered.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const pages = getPageNumbers(page, totalPages)
    const bills = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const counts = {
        unpaid:   allBills.filter(b => getBillStatus(b) === "unpaid").length,
        pending:  allBills.filter(b => getBillStatus(b) === "pending").length,
        verified: allBills.filter(b => getBillStatus(b) === "verified").length,
    }

    return (
        <>
            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tagihan Saya</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Lihat dan bayar tagihan air Anda</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 shrink-0" onClick={fetchBills}>
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                    </Button>
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
                                placeholder="Cari layanan, nomor meter…"
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
                        <Badge variant="secondary" className="text-xs gap-1 h-6">
                            <FileText size={11} /> {allBills.length} tagihan
                        </Badge>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center text-xs">#</TableHead>
                                <TableHead className="text-xs">Periode</TableHead>
                                <TableHead className="text-xs">Layanan</TableHead>
                                <TableHead className="text-xs">No. Meter</TableHead>
                                <TableHead className="text-xs">Penggunaan</TableHead>
                                <TableHead className="text-xs">Total</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs text-right pr-5">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && [...Array(5)].map((_, i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    <TableCell><Skeleton className="h-3.5 w-4 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                                    <TableCell className="text-right pr-5"><Skeleton className="h-7 w-24 rounded-md ml-auto" /></TableCell>
                                </TableRow>
                            ))}

                            {!loading && bills.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={8}>
                                        <div className="flex flex-col items-center py-14 gap-2 text-muted-foreground">
                                            <FileText size={32} className="opacity-20" />
                                            <p className="text-sm">Tidak ada tagihan ditemukan</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && (
                                <AnimatePresence>
                                    {bills.map((bill, i) => {
                                        const billStatus = getBillStatus(bill)
                                        return (
                                            <motion.tr
                                                key={bill.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03, duration: 0.2 }}
                                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                            >
                                                <TableCell className="text-center text-xs text-muted-foreground w-12">
                                                    {(page - 1) * PAGE_SIZE + i + 1}
                                                </TableCell>

                                                <TableCell className="text-sm font-medium whitespace-nowrap">
                                                    {MONTH_NAMES[(bill.month ?? 1) - 1]} {bill.year}
                                                </TableCell>

                                                <TableCell>
                                                    <Badge className="text-[11px] bg-blue-500/10 text-blue-600 border-0 font-medium hover:bg-blue-500/10">
                                                        {bill.service?.name ?? "—"}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-sm text-muted-foreground font-mono">
                                                    {bill.measurement_number}
                                                </TableCell>

                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs font-mono gap-1">
                                                        <Droplets size={10} className="text-blue-500" />
                                                        {bill.usage_value} m³
                                                    </Badge>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {formatPrice(getBillTotal(bill))}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <StatusBadge status={billStatus} />
                                                </TableCell>

                                                <TableCell className="text-right pr-5">
                                                    {billStatus === "unpaid" && (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 gap-1"
                                                            onClick={() => { setUploadBill(bill); setUploadOpen(true) }}
                                                        >
                                                            <Upload size={11} /> Bayar
                                                        </Button>
                                                    )}
                                                    {billStatus === "pending" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
                                                            onClick={() => { setProofBill(bill); setProofOpen(true) }}
                                                        >
                                                            <ImageIcon size={11} /> Lihat Bukti
                                                        </Button>
                                                    )}
                                                    {billStatus === "verified" && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/print/bill/${bill.id}`} target="_blank">
                                                                <Button variant="ghost" size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                                                    title="Cetak Struk Pembayaran">
                                                                    <Printer size={13} />
                                                                </Button>
                                                            </Link>
                                                            {bill.payments?.payment_proof && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                                                    title="Lihat Bukti"
                                                                    onClick={() => { setProofBill(bill); setProofOpen(true) }}
                                                                >
                                                                    <ImageIcon size={13} />
                                                                </Button>
                                                            )}
                                                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                                <CheckCircle2 size={12} /> Lunas
                                                            </span>
                                                        </div>
                                                    )}
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
                                Menampilkan <span className="font-medium text-foreground">
                                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                                </span> dari <span className="font-medium text-foreground">{total}</span> tagihan
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
                                                >{p}</PaginationLink>
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

            <UploadPaymentDialog
                open={uploadOpen}
                bill={uploadBill}
                onClose={() => setUploadOpen(false)}
                onSuccess={fetchBills}
            />
            <ProofViewDialog
                open={proofOpen}
                bill={proofBill}
                onClose={() => setProofOpen(false)}
            />
        </>
    )
}
