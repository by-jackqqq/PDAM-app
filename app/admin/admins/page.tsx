"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Pencil, Trash2, RefreshCw, Users, X } from "lucide-react"
import { api } from "@/lib/api"
import { Admin, AdminListResponse } from "@/types/admin"
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import AdminFormModal from "@/app/components/admin/admins/AdminFormModal"
import AdminDeleteDialog from "@/app/components/admin/admins/AdminDeleteDialog"

const PAGE_SIZE = 5

function getPageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "…", current - 1, current, current + 1, "…", total]
}

export default function AdminsPage() {
  const [allAdmins, setAllAdmins] = useState<Admin[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Admin | null>(null)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<AdminListResponse>("/admins", {
        params: { page: 1, quantity: 9999 },
      })
      setAllAdmins(res.data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])
  useEffect(() => { setPage(1) }, [search])

  // Filter & paginate di client
  const filtered = allAdmins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.user.username.toLowerCase().includes(search.toLowerCase())
  )
  const total = filtered.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pages = getPageNumbers(page, totalPages)
  const admins = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => { setSelected(null); setFormOpen(true) }
  const openEdit = (a: Admin) => { setSelected(a); setFormOpen(true) }
  const openDelete = (a: Admin) => { setSelected(a); setDeleteOpen(true) }

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage all admin accounts</p>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus size={15} /> Add Admin
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
            <div className="relative w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name or username…"
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
                <Users size={11} /> {allAdmins.length} admin{allAdmins.length !== 1 ? "s" : ""}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchAdmins} title="Refresh">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Admin</TableHead>
                <TableHead className="text-xs">Username</TableHead>
                <TableHead className="text-xs">Phone</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Loading skeleton */}
              {loading && [...Array(5)].map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-3.5 w-4 mx-auto" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell className="text-right pr-5">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {/* Empty state */}
              {!loading && admins.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center py-14 gap-2 text-muted-foreground">
                      <Users size={32} className="opacity-20" />
                      <p className="text-sm">
                        {search ? `No admins found for "${search}"` : "No admins yet"}
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
                  {admins.map((admin, i) => (
                    <motion.tr
                      key={admin.id}
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
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-[11px] font-semibold">
                              {initials(admin.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{admin.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        @{admin.user.username}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {admin.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-[11px] bg-blue-100 text-blue-600 border-0 font-medium capitalize hover:bg-blue-100">
                          {admin.user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Edit admin" onClick={() => openEdit(admin)}>
                            <Pencil size={13} />
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete admin" onClick={() => openDelete(admin)}>
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
                of <span className="font-medium text-foreground">{total}</span> admins
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

      <AdminFormModal
        open={formOpen}
        admin={selected}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchAdmins}
      />
      <AdminDeleteDialog
        open={deleteOpen}
        admin={selected}
        onClose={() => setDeleteOpen(false)}
        onSuccess={fetchAdmins}
      />
    </>
  )
}