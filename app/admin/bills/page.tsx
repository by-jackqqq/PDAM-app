"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, Search, Pencil, Trash2, RefreshCw, FileText, X,
    Droplets, CheckCircle2, Clock, XCircle, Printer, Download,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { api } from "@/lib/api"
import { Bill, BillPayment, BillListResponse, MONTH_NAMES } from "@/types/bill"
import { BASE_PAYMENT_PROOF } from "@/global"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import BillFormModal from "@/components/admin/bills/BillFormModal"
import BillDeleteDialog from "@/components/admin/bills/BillDeleteDialog"

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

function initials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function getBillTotal(bill: Bill) {
    return bill.service?.price && bill.usage_value
        ? bill.service.price * bill.usage_value
        : bill.total_price ?? 0
}

/** Returns the effective status: prefer bill.payment.status if exists, else bill.status */
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

function StatusBadge({ status }: { status: string }) {
    if (status === "verified")
        return <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0 gap-1 shrink-0"><CheckCircle2 size={10} />Lunas</Badge>
    if (status === "pending")
        return <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-0 gap-1 shrink-0"><Clock size={10} />Menunggu Verifikasi</Badge>
    return <Badge className="text-[10px] bg-red-500/10 text-red-600 border-0 gap-1 shrink-0"><XCircle size={10} />Belum Terbayar</Badge>
}

function proofUrl(proof_file: string): string {
    if (proof_file.startsWith("http")) return proof_file
    return `${BASE_PAYMENT_PROOF}/${proof_file}`
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BillsPage() {
    const [allBills, setAllBills] = useState<Bill[]>([])
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [loading, setLoading] = useState(true)

    const [formOpen, setFormOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Bill | null>(null)

    const fetchBills = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<BillListResponse>("/bills", {
                params: { page: 1, quantity: 9999, search: "" },
            })
            setAllBills(res.data.data ?? [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchBills() }, [fetchBills])
    useEffect(() => { setPage(1) }, [search, statusFilter])

    // Filter
    const filtered = allBills
        .filter(b =>
            b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
            b.customer?.customer_number?.toLowerCase().includes(search.toLowerCase()) ||
            b.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
            b.measurement_number?.toLowerCase().includes(search.toLowerCase())
        )
        .filter(b => {
            if (statusFilter === "all") return true
            return getBillStatus(b) === statusFilter
        })

    const total = filtered.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const pages = getPageNumbers(page, totalPages)
    const bills = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    // Count badges for filter tabs
    const counts = {
        unpaid:   allBills.filter(b => getBillStatus(b) === "unpaid").length,
        pending:  allBills.filter(b => getBillStatus(b) === "pending").length,
        verified: allBills.filter(b => getBillStatus(b) === "verified").length,
    }

    const openCreate = () => { setSelected(null); setFormOpen(true) }
    const openEdit   = (b: Bill) => { setSelected(b); setFormOpen(true) }
    const openDelete = (b: Bill) => { setSelected(b); setDeleteOpen(true) }

    return (
        <>
            <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Bill Management</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage water usage bills and verify payments</p>
                    </div>
                    <Button size="sm" className="gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
                        <Plus size={15} /> Add Bill
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
                                placeholder="Search customer, service, or meter…"
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
                                <FileText size={11} /> {allBills.length} bill{allBills.length !== 1 ? "s" : ""}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchBills} title="Refresh">
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
                                <TableHead className="text-xs">Period</TableHead>
                                <TableHead className="text-xs">Service</TableHead>
                                <TableHead className="text-xs">Meter No.</TableHead>
                                <TableHead className="text-xs">Usage</TableHead>
                                <TableHead className="text-xs">Total</TableHead>
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
                                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
                                    <TableCell className="text-right pr-5">
                                        <div className="flex justify-end gap-1">
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Empty */}
                            {!loading && bills.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={9}>
                                        <div className="flex flex-col items-center py-14 gap-2 text-muted-foreground">
                                            <FileText size={32} className="opacity-20" />
                                            <p className="text-sm">
                                                {search ? `No bills found for "${search}"` : "No bills yet"}
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

                                                {/* Customer */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-[11px] font-semibold">
                                                                {initials(bill.customer?.name ?? "?")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-tight">{bill.customer?.name ?? "—"}</p>
                                                            <p className="text-[11px] text-muted-foreground font-mono">{bill.customer?.customer_number ?? ""}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Period */}
                                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {MONTH_NAMES[(bill.month ?? 1) - 1]} {bill.year}
                                                </TableCell>

                                                {/* Service */}
                                                <TableCell>
                                                    <Badge className="text-[11px] bg-emerald-500/10 text-emerald-600 border-0 font-medium hover:bg-emerald-500/10">
                                                        {bill.service?.name ?? "—"}
                                                    </Badge>
                                                </TableCell>

                                                {/* Meter No */}
                                                <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                                                    {bill.measurement_number}
                                                </TableCell>

                                                {/* Usage */}
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs font-mono gap-1">
                                                        <Droplets size={10} className="text-blue-500" />
                                                        {bill.usage_value} m³
                                                    </Badge>
                                                </TableCell>

                                                {/* Total */}
                                                <TableCell>
                                                    <Badge className="text-[11px] bg-emerald-500/10 text-emerald-700 border-0 font-semibold hover:bg-emerald-500/10">
                                                        {formatPrice(getBillTotal(bill))}
                                                    </Badge>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <StatusBadge status={billStatus} />
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right pr-5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {billStatus === "verified" && (
                                                            <Link href={`/print/bill/${bill.id}`} target="_blank">
                                                                <Button variant="ghost" size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                                                    title="Cetak Struk Pembayaran">
                                                                    <Printer size={13} />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Button variant="ghost" size="icon"
                                                            disabled={billStatus === "verified"}
                                                            className={`h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted ${billStatus === "verified" ? "opacity-50 cursor-not-allowed" : ""}`}
                                                            title={billStatus === "verified" ? "Tidak dapat diedit karena sudah lunas" : "Edit bill"} onClick={() => openEdit(bill)}>
                                                            <Pencil size={13} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            title="Delete bill" onClick={() => openDelete(bill)}>
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
                                of <span className="font-medium text-foreground">{total}</span> bills
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

            <BillFormModal
                open={formOpen}
                bill={selected}
                onClose={() => setFormOpen(false)}
                onSuccess={fetchBills}
            />
            <BillDeleteDialog
                open={deleteOpen}
                bill={selected}
                onClose={() => setDeleteOpen(false)}
                onSuccess={fetchBills}
            />
        </>
    )
}