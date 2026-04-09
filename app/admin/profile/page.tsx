"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Phone, ShieldCheck, Hash, AtSign, Calendar, Pencil, Droplets, Mail } from "lucide-react"
import { api } from "@/lib/api"
import { Admin } from "@/types/admin"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import EditProfileModal from "@/components/dashboard/edit-profile-modal"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  })
}

function ProfileSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <Skeleton className="h-72 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    api.get<{ data: Admin }>("/admins/me")
      .then(r => setAdmin(r.data.data))
      .catch(() => { })
  }, [])

  if (!admin) return <ProfileSkeleton />

  const initials = admin.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const fields = [
    {
      icon: AtSign,
      label: "Username",
      value: `@${admin.user.username}`,
      sub: "Login identity",
    },
    {
      icon: Phone,
      label: "Phone",
      value: admin.phone,
      sub: "Contact number",
    },
    {
      icon: ShieldCheck,
      label: "Role",
      value: admin.user.role,
      sub: "Access level",
    },
    {
      icon: Hash,
      label: "Admin ID",
      value: `#${admin.id}`,
      sub: "System identifier",
      mono: true,
    },
    ...(admin.createdAt ? [{
      icon: Calendar,
      label: "Member Since",
      value: formatDate(admin.createdAt),
      sub: "Account created",
    }] : []),
  ]

  return (
    <>
      <div className="w-full">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage your account details</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">

          {/* ── Left: Identity card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">

              {/* Top banner */}
              <div className="relative h-24 bg-gradient-to-br from-blue-600 to-blue-400 overflow-hidden">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute bottom-0 left-0 right-0 h-12"
                  style={{
                    background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08))"
                  }}
                />
                {/* Dot grid */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <defs>
                    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
                <div className="absolute top-3 left-3 opacity-25">
                  <Droplets size={28} className="text-white" />
                </div>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center -mt-9 px-5 pb-5">
                <Avatar className="h-[72px] w-[72px] border-4 border-white shadow-lg ring-2 ring-blue-100">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-white text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-3 text-center">
                  <h2 className="text-base font-bold tracking-tight text-gray-900">{admin.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">@{admin.user.username}</p>
                  <Badge className="mt-2 bg-blue-50 text-blue-600 border border-blue-100 font-semibold text-[11px] capitalize hover:bg-blue-50">
                    {admin.user.role}
                  </Badge>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-100 my-4" />

                {/* Quick stats */}
                <div className="w-full grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-blue-50 py-2.5 px-2">
                    <p className="text-xs font-bold text-blue-600">#{admin.id}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Admin ID</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 py-2.5 px-2">
                    <p className="text-xs font-bold text-blue-600">Active</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Status</p>
                  </div>
                </div>

                <Button
                  onClick={() => setOpen(true)}
                  className="mt-4 w-full h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold"
                >
                  <Pencil size={13} />
                  Edit Profile
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Info grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ icon: Icon, label, value, sub, mono }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.38, ease: "easeOut" }}
                className="rounded-2xl border border-blue-50 bg-white shadow-sm px-5 py-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
              >
                {/* Icon */}
                <div className="h-10 w-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-blue-500" strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                    {label}
                  </p>
                  <p className={`text-sm font-bold text-gray-800 truncate ${mono ? "font-mono" : ""}`}>
                    {value}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                </div>

                {/* Right accent */}
                <div className="h-8 w-0.5 rounded-full bg-blue-100 group-hover:bg-blue-300 transition-colors" />
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      <EditProfileModal
        admin={admin}
        open={open}
        onClose={() => setOpen(false)}
        onUpdated={setAdmin}
      />
    </>
  )
}