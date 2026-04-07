"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Users,  Receipt, Toolbox, 
  TrendingUp, RefreshCw, ArrowRight, CheckCircle2, Clock, XCircle,
  Plus, Activity, UserPlus, FilePlus, Wallet, UserStar
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"

// ─── Types ────────────────────────────────────────────────────────────────────
type StatsState = {
  admins: number; customers: number; services: number
  bills: number; payments: number
}

type RecentBill = {
  id: number; period?: string; usage?: number
  amount?: number; status?: string; createdAt?: string
  customer?: { name: string }
}

type RecentPayment = {
  id: number; amount?: number; status?: string; createdAt?: string
  bill?: { customer?: { name: string } }
}

type RecentAdmin = {
  id: number; name: string; createdAt?: string
}

type RecentCustomer = {
  id: number; name: string; createdAt?: string
}

type ActivityItem = {
  id: string
  type: "admin" | "customer" | "bill" | "payment"
  title: string
  subtitle: string
  time: string
  timestamp: number
}

type MonthlyData = { month: string; bills: number; payments: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, href, loading, delay = 0 }: {
  label: string; value: number; icon: React.ElementType
  color: string; href: string; loading: boolean; delay?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}>
      <Link href={href}>
        <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
              <Icon size={18} className="text-white" />
            </div>
            <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            {loading
              ? <Skeleton className="h-8 w-16 mb-1" />
              : <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
            }
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "").toLowerCase()
  if (s === "verified" || s === "paid")
    return <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0 gap-1"><CheckCircle2 size={10} />{status}</Badge>
  if (s === "pending")
    return <Badge className="text-[10px] bg-yellow-500/10 text-yellow-600 border-0 gap-1"><Clock size={10} />{status}</Badge>
  return <Badge className="text-[10px] bg-red-500/10 text-red-600 border-0 gap-1"><XCircle size={10} />{status ?? "—"}</Badge>
}

function activityIcon(type: ActivityItem["type"]) {
  const map = {
    admin: { bg: "bg-violet-500/10", color: "text-violet-600", Icon: UserStar },
    customer: { bg: "bg-emerald-500/10", color: "text-emerald-600", Icon: UserPlus },
    bill: { bg: "bg-orange-500/10", color: "text-orange-600", Icon: FilePlus },
    payment: { bg: "bg-pink-500/10", color: "text-pink-600", Icon: Wallet },
  }
  return map[type]
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<StatsState>({ admins: 0, customers: 0, services: 0, bills: 0, payments: 0 })
  const [recentBills, setRecentBills] = useState<RecentBill[]>([])
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [chartData, setChartData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [adminsRes, customersRes, servicesRes, billsRes, paymentsRes] = await Promise.allSettled([
        api.get("/admins", { params: { page: 1, quantity: 9999 } }),
        api.get("/customers", { params: { page: 1, quantity: 9999 } }),
        api.get("/services", { params: { page: 1, quantity: 9999 } }),
        api.get("/bills", { params: { page: 1, quantity: 9999 } }),
        api.get("/payments", { params: { page: 1, quantity: 9999 } }),
      ])

      const get = (r: typeof adminsRes) => r.status === "fulfilled" ? r.value.data : { data: [], count: 0 }
      const adminsData = get(adminsRes)
      const customersData = get(customersRes)
      const servicesData = get(servicesRes)
      const billsData = get(billsRes)
      const paymentsData = get(paymentsRes)

      // Stats
      setStats({
        admins: adminsData.count ?? adminsData.data?.length ?? 0,
        customers: customersData.count ?? customersData.data?.length ?? 0,
        services: servicesData.count ?? servicesData.data?.length ?? 0,
        bills: billsData.count ?? billsData.data?.length ?? 0,
        payments: paymentsData.count ?? paymentsData.data?.length ?? 0,
      })

      // Recent bills & payments (5 terbaru)
      const bills: RecentBill[] = [...(billsData.data ?? [])].reverse()
      const payments: RecentPayment[] = [...(paymentsData.data ?? [])].reverse()
      setRecentBills(bills.slice(0, 5))
      setRecentPayments(payments.slice(0, 5))

      // ── Activity feed ──────────────────────────────────────────────────────
      const activityList: ActivityItem[] = []

        ; (adminsData.data as RecentAdmin[] ?? []).slice(-5).forEach(a => {
          if (!a.createdAt) return
          activityList.push({
            id: `admin-${a.id}`, type: "admin",
            title: `New admin registered`,
            subtitle: a.name,
            time: timeAgo(a.createdAt),
            timestamp: new Date(a.createdAt).getTime(),
          })
        })
        ; (customersData.data as RecentCustomer[] ?? []).slice(-5).forEach(c => {
          if (!c.createdAt) return
          activityList.push({
            id: `customer-${c.id}`, type: "customer",
            title: `New customer registered`,
            subtitle: c.name,
            time: timeAgo(c.createdAt),
            timestamp: new Date(c.createdAt).getTime(),
          })
        })
        ; (bills as RecentBill[]).slice(0, 5).forEach(b => {
          if (!b.createdAt) return
          activityList.push({
            id: `bill-${b.id}`, type: "bill",
            title: `New bill created`,
            subtitle: b.customer?.name ?? `Bill #${b.id}`,
            time: timeAgo(b.createdAt),
            timestamp: new Date(b.createdAt).getTime(),
          })
        })
        ; (payments as RecentPayment[]).slice(0, 5).forEach(p => {
          if (!p.createdAt) return
          activityList.push({
            id: `payment-${p.id}`, type: "payment",
            title: `Payment ${p.status ?? "received"}`,
            subtitle: p.bill?.customer?.name ?? `Payment #${p.id}`,
            time: timeAgo(p.createdAt),
            timestamp: new Date(p.createdAt).getTime(),
          })
        })

      // Sort by newest
      activityList.sort((a, b) => b.timestamp - a.timestamp)
      setActivities(activityList.slice(0, 8))

      // ── Chart data ─────────────────────────────────────────────────────────
      const monthMap: Record<string, { bills: number; payments: number }> = {}
      const monthLabel = (iso: string) =>
        new Date(iso).toLocaleDateString("id-ID", { month: "short", year: "2-digit" })

        ; (billsData.data ?? []).forEach((b: RecentBill) => {
          if (!b.createdAt) return
          const m = monthLabel(b.createdAt)
          if (!monthMap[m]) monthMap[m] = { bills: 0, payments: 0 }
          monthMap[m].bills++
        })
        ; (paymentsData.data ?? []).forEach((p: RecentPayment) => {
          if (!p.createdAt) return
          const m = monthLabel(p.createdAt)
          if (!monthMap[m]) monthMap[m] = { bills: 0, payments: 0 }
          monthMap[m].payments++
        })
      setChartData(Object.entries(monthMap).slice(-6).map(([month, v]) => ({ month, ...v })))

    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const statCards = [
    { label: "Total Admins", value: stats.admins, icon: UserStar, color: "bg-violet-500", href: "/admin/admins", delay: 0 },
    { label: "Total Customers", value: stats.customers, icon: Users, color: "bg-emerald-500", href: "/admin/customers", delay: 0.05 },
    { label: "Total Services", value: stats.services, icon: Toolbox, color: "bg-blue-500", href: "/admin/services", delay: 0.1 },
    { label: "Total Bills", value: stats.bills, icon: Receipt, color: "bg-orange-500", href: "/admin/bills", delay: 0.15 },
    { label: "Total Payments", value: stats.payments, icon: Wallet, color: "bg-pink-500", href: "/admin/payments", delay: 0.2 },
  ]

  const quickActions = [
    { label: "Add Admin", icon: UserStar, color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20", href: "/admin/admins?action=create" },
    { label: "Add Customer", icon: Users, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20", href: "/admin/customers?action=create" },
    { label: "Create Bill", icon: Receipt, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20", href: "/admin/bills?action=create" },
    { label: "Add Payment", icon: Wallet, color: "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20", href: "/admin/payments?action=create" },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back! Heres whats happening today.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0"
          onClick={() => fetchAll(true)} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Plus size={15} className="text-muted-foreground" />
          <p className="text-sm font-semibold">Quick Actions</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, color, href }) => (
            <Link key={label} href={href}>
              <div className={`rounded-xl p-4 flex flex-col items-center gap-2.5 cursor-pointer transition-colors ${color}`}>
                <Icon size={20} />
                <span className="text-xs font-medium text-center">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Chart + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
          className="lg:col-span-3 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold">Bills & Payments</p>
              <p className="text-xs text-muted-foreground">Monthly overview</p>
            </div>
            <TrendingUp size={16} className="text-muted-foreground" />
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              No chart data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{
                  borderRadius: "10px", border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))", fontSize: "12px",
                }} />
                <Bar dataKey="bills" name="Bills" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payments" name="Payments" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-sm bg-primary" /> Bills
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Payments
            </div>
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="lg:col-span-2 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-muted-foreground" />
            <p className="text-sm font-semibold">Recent Activity</p>
          </div>

          <div className="space-y-3">
            {loading && [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}

            {!loading && activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
            )}

            {!loading && activities.map((item) => {
              const { bg, color, Icon } = activityIcon(item.type)
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Bills + Recent Payments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Bills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-sm font-semibold">Recent Bills</p>
              <p className="text-xs text-muted-foreground">Latest 5 bills</p>
            </div>
            <Link href="/admin/bills">
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">View all <ArrowRight size={11} /></Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading && [...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /></div>
                <div className="flex items-center gap-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-16 rounded-full" /></div>
              </div>
            ))}
            {!loading && recentBills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">No bills yet</p>
            )}
            {!loading && recentBills.map(bill => (
              <div key={bill.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-orange-500/10 text-orange-600 text-[10px] font-bold">
                      {initials(bill.customer?.name ?? "BL")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{bill.customer?.name ?? `Bill #${bill.id}`}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {bill.period ?? "—"} · {bill.usage ?? 0} m³
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <p className="text-xs font-semibold">{formatPrice(bill.amount ?? 0)}</p>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-sm font-semibold">Recent Payments</p>
              <p className="text-xs text-muted-foreground">Latest 5 transactions</p>
            </div>
            <Link href="/admin/payments">
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">View all <ArrowRight size={11} /></Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading && [...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /></div>
                <div className="flex items-center gap-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-16 rounded-full" /></div>
              </div>
            ))}
            {!loading && recentPayments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">No payments yet</p>
            )}
            {!loading && recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-pink-500/10 text-pink-600 text-[10px] font-bold">
                      {initials(p.bill?.customer?.name ?? "PY")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.bill?.customer?.name ?? `Payment #${p.id}`}</p>
                    <p className="text-[11px] text-muted-foreground">{p.createdAt ? formatDate(p.createdAt) : "—"}</p>
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