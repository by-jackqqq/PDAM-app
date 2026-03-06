"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Pencil, Trash2, RefreshCw, Toolbox, X } from "lucide-react"
import { api } from "@/lib/api"
import { Service, ServiceListResponse } from "@/types/service"
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
import ServiceFormModal from "@/app/components/dashboard/services/service-form-modal"
import ServiceDeleteDialog from "@/app/components/dashboard/services/service-delete-dialog"

const PAGE_SIZE = 10

function getPageNumbers(current: number, total: number) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
    if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
    return [1, "…", current - 1, current, current + 1, "…", total]
}

function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price)
}

export default function ServicesPage() {
    const [allServices, setAllServices] = useState<Service[]>([])
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    const [formOpen, setFormOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Service | null>(null)

    const fetchServices = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get<ServiceListResponse>("/services", {
                params: { page: 1, quantity: 9999 },
            })
            setAllServices(res.data.data ?? [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchServices() }, [fetchServices])
    useEffect(() => { setPage(1) }, [search])

    const filtered = allServices.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    )
    const total = filtered.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const pages = getPageNumbers(page, totalPages)
    const services = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const openCreate = () => { setSelected(null); setFormOpen(true) }
    const openEdit = (s: Service) => { setSelected(s); setFormOpen(true) }
    const openDelete = (s: Service) => { setSelected(s); setDeleteOpen(true) }

    return (
        <>
            <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Service Management</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage water usage service tiers</p>
                    </div>
                    <Button size="sm" className="gap-1.5 shrink-0" onClick={openCreate}>
                        <Plus size={15} /> Add Service
                    </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
                        <div className="relative w-72">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search by service name…"
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
                                <Toolbox size={11} /> {allServices.length} service{allServices.length !== 1 ? "s" : ""}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchServices} title="Refresh">
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-12 text-center text-xs">#</TableHead>
                                <TableHead className="text-xs">Service Name</TableHead>
                                <TableHead className="text-xs">Min Usage (m³)</TableHead>
                                <TableHead className="text-xs">Max Usage (m³)</TableHead>
                                <TableHead className="text-xs">Price / m³</TableHead>
                                <TableHead className="text-xs text-right pr-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Skeleton */}
                            {loading && [...Array(4)].map((_, i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    <TableCell><Skeleton className="h-3.5 w-4 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                                    <TableCell className="text-right pr-5">
                                        <div className="flex justify-end gap-1">
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Empty */}
                            {!loading && services.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={6}>
                                        <div className="flex flex-col items-center py-14 gap-2 text-muted-foreground">
                                            <Toolbox size={32} className="opacity-20" />
                                            <p className="text-sm">
                                                {search ? `No services found for "${search}"` : "No services yet"}
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
                                    {services.map((service, i) => (
                                        <motion.tr
                                            key={service.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04, duration: 0.2 }}
                                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground w-12">
                                                {(page - 1) * PAGE_SIZE + i + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                        <Toolbox size={14} className="text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium">{service.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {service.min_usage} m³
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {service.max_usage} m³
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {formatPrice(service.price)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                        title="Edit service" onClick={() => openEdit(service)}>
                                                        <Pencil size={13} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        title="Delete service" onClick={() => openDelete(service)}>
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
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
                                of <span className="font-medium text-foreground">{total}</span> services
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
                                            <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
                                        ) : (
                                            <PaginationItem key={p}>
                                                <PaginationLink isActive={page === p} onClick={() => setPage(p as number)} className="cursor-pointer">
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

            <ServiceFormModal
                open={formOpen}
                service={selected}
                onClose={() => setFormOpen(false)}
                onSuccess={fetchServices}
            />
            <ServiceDeleteDialog
                open={deleteOpen}
                service={selected}
                onClose={() => setDeleteOpen(false)}
                onSuccess={fetchServices}
            />
        </>
    )
}