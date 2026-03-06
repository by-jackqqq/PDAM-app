"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Layers,
  FileText,
  CreditCard,
  Droplets,
} from "lucide-react"

import { Admin } from "@/types/admin"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  admin: Admin | null
}

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Admins",
    url: "/dashboard/admins",
    icon: ShieldCheck,
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Services",
    url: "/dashboard/services",
    icon: Layers,
  },
  {
    title: "Bills",
    url: "/dashboard/bills",
    icon: FileText,
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: CreditCard,
  },
]

export function AppSidebar({ admin, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>

      {/* ── Header / Logo ── */}
      <SidebarHeader className="pb-4">
        <div className="flex items-center gap-3 px-1 py-2">
          {/* Logo icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary shadow-sm">
            <Droplets size={20} className="text-sidebar-primary-foreground" />
          </div>
          {/* Brand text */}
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-sidebar-foreground">
              PDAM Smart
            </span>
            <span className="text-xs text-sidebar-foreground/50">
              Admin Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Navigation ── */}
      <SidebarContent className="pt-2">
        {/* Label */}
        <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          Menu
        </p>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarSeparator />

      {/* ── Footer / User ── */}
      <SidebarFooter className="pt-2">
        {admin ? (
          <NavUser
            user={{
              name: admin.name,
              username: admin.user.username,
              avatar: "",
            }}
          />
        ) : (
          // Skeleton saat admin belum load
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-sidebar-accent" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-2.5 w-24 animate-pulse rounded bg-sidebar-accent" />
              <div className="h-2 w-16 animate-pulse rounded bg-sidebar-accent" />
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}