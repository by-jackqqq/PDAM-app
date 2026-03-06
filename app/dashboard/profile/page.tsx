"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { User, Phone, ShieldCheck, Hash } from "lucide-react"
import { api } from "@/lib/api"
import { Admin } from "@/types/admin"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import EditProfileModal from "@/app/components/dashboard/edit-profile-modal"

// ─── Field rows config ────────────────────────────────────────────────────────
const getFields = (admin: Admin) => [
  { icon: User,        label: "USERNAME",  value: admin.user.username, badge: "Primary", mono: false },
  { icon: Phone,       label: "PHONE",     value: admin.phone,         badge: "Primary", mono: false },
  { icon: ShieldCheck, label: "ROLE",      value: admin.user.role,     badge: null,      mono: false },
  { icon: Hash,        label: "ADMIN ID",  value: admin.id,            badge: null,      mono: true  },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-2">
      <Skeleton className="h-32 w-full rounded-t-2xl" />
      <Skeleton className="h-12 w-full rounded-none" />
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      <Skeleton className="h-16 w-full rounded-b-2xl" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [open, setOpen]   = useState(false)

  useEffect(() => {
    api.get<{ data: Admin }>("/admins/me").then(r => setAdmin(r.data.data))
  }, [])

  if (!admin) return <ProfileSkeleton />

  const initials = admin.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  const fields   = getFields(admin)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-2xl space-y-1"
      >
        {/* ── Page title ── */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">Profile details</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account information</p>
        </div>

        {/* ── Card ── */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

          {/* Banner */}
          <div className="relative h-28 bg-gradient-to-r from-primary via-primary/80 to-primary/50">
            {/* Subtle grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Identity section */}
          <div className="px-6 pb-4 -mt-8 relative">
            <div className="flex items-end justify-between">
              <Avatar className="h-16 w-16 border-[3px] border-background shadow-md ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="mb-1 shadow-sm"
                onClick={() => setOpen(true)}
              >
                Update profile
              </Button>
            </div>

            <div className="mt-3">
              <p className="text-lg font-bold leading-tight">{admin.name}</p>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
                {admin.user.role}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border mx-0" />

          {/* Field rows */}
          <div className="divide-y divide-border">
            {fields.map(({ icon: Icon, label, value, badge, mono }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                {/* Icon box */}
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={16} strokeWidth={2} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-widest mb-0.5">
                    {label}
                  </p>
                  <p className={`text-sm font-semibold text-foreground truncate ${mono ? "font-mono" : ""}`}>
                    {value}
                  </p>
                </div>

                {/* Badge */}
                {badge && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-primary/10 text-primary border-0 font-medium px-2.5"
                  >
                    {badge}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>

        </div>
      </motion.div>

      <EditProfileModal
        admin={admin}
        open={open}
        onClose={() => setOpen(false)}
        onUpdated={setAdmin}
      />
    </>
  )
}