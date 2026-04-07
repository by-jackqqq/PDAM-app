"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { removeCookie } from "@/lib/client-cookies"
import {
    LayoutDashboard,
    ShieldCheck,
    Users,
    Wrench,
    FileText,
    CreditCard,
    LogOut,
    Menu,
    X,
    Droplets,
} from "lucide-react"

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Admins",
        href: "/admin/admins",
        icon: ShieldCheck,
    },
    {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
    },
    {
        label: "Services",
        href: "/admin/services",
        icon: Wrench,
    },
    {
        label: "Bills",
        href: "/admin/bills",
        icon: FileText,
    },
    {
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
    },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        removeCookie("token")
        removeCookie("role")
        localStorage.removeItem("user")
        router.push("/login")
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div
                className={`flex items-center gap-3 px-5 py-5 border-b border-blue-700/40 ${collapsed ? "justify-center px-3" : ""
                    }`}
            >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-white font-bold text-base leading-tight tracking-wide">
                            PDAM Smart
                        </p>
                        <p className="text-blue-200 text-xs">Admin Panel</p>
                    </div>
                )}
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    // aktif jika exact match untuk /admin, atau startsWith untuk subroute
                    const isActive =
                        item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                                    ? "bg-white text-blue-600 shadow-md shadow-blue-900/20"
                                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                                }
                ${collapsed ? "justify-center px-2" : ""}
              `}
                        >
                            <Icon
                                className={`flex-shrink-0 w-5 h-5 transition-transform duration-150 group-hover:scale-110 ${isActive ? "text-blue-600" : "text-blue-200"
                                    }`}
                            />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-blue-700/40">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-blue-100 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150 group
            ${collapsed ? "justify-center px-2" : ""}
          `}
                >
                    <LogOut className="flex-shrink-0 w-5 h-5 group-hover:scale-110 transition-transform duration-150" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <aside
                className={`hidden md:flex flex-col h-screen sticky top-0 bg-blue-600 transition-all duration-300 ease-in-out flex-shrink-0
          ${collapsed ? "w-16" : "w-60"}
        `}
            >
                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                    <span className="text-blue-600 text-xs font-bold">
                        {collapsed ? "›" : "‹"}
                    </span>
                </button>

                <SidebarContent />
            </aside>

            {/* ── Mobile: Hamburger button ── */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg"
                >
                    <Menu className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* ── Mobile: Overlay ── */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Mobile: Drawer ── */}
            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 bg-blue-600 shadow-2xl transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                >
                    <X className="w-4 h-4 text-white" />
                </button>

                <SidebarContent />
            </aside>
        </>
    )
}