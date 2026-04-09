"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { removeCookie } from "@/lib/client-cookies"
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    Droplets,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

const menuItems = [
    { label: "Dashboard",   href: "/customer",          icon: LayoutDashboard },
    { label: "My Bills",    href: "/customer/bills",    icon: FileText },
    { label: "My Payments", href: "/customer/payments", icon: CreditCard },
    { label: "Profile",     href: "/customer/profile",  icon: User },
]

function NavItems({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
    const pathname = usePathname()

    return (
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => {
                const Icon = item.icon
                const isActive =
                    item.href === "/customer"
                        ? pathname === "/customer"
                        : pathname.startsWith(item.href)

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                            flex items-center gap-3 rounded-xl text-sm font-medium
                            transition-all duration-200 group relative
                            ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                            ${isActive
                                ? "bg-white text-blue-700 shadow-md shadow-blue-900/15"
                                : "text-blue-100/90 hover:bg-white/15 hover:text-white"
                            }
                        `}
                    >
                        {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-300 rounded-r-full" />
                        )}
                        <Icon
                            size={18}
                            className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                isActive ? "text-blue-600" : "text-blue-200"
                            }`}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}

                        {collapsed && (
                            <div className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-lg z-50">
                                {item.label}
                            </div>
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}

function SidebarBody({ collapsed, onClose, onLogout }: { collapsed: boolean; onClose?: () => void; onLogout: () => void }) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0 ${collapsed ? "justify-center px-2" : ""}`}>
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner shadow-white/10 ring-1 ring-white/20">
                    <Droplets className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-white font-extrabold text-[15px] leading-tight tracking-wide truncate">PDAM Smart</p>
                        <p className="text-blue-200/70 text-[11px] font-medium tracking-widest uppercase">Customer Portal</p>
                    </div>
                )}
            </div>

            {!collapsed && (
                <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200/50">Menu</p>
            )}

            <NavItems collapsed={collapsed} onClose={onClose} />

            {/* Logout */}
            <div className="px-2 pb-4 pt-2 border-t border-white/10 shrink-0">
                <button
                    onClick={onLogout}
                    className={`flex items-center gap-3 w-full rounded-xl text-sm font-medium text-blue-100/80 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 group ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}`}
                >
                    <LogOut size={18} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    )
}

export default function CustomerSidebar() {
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        removeCookie("token")
        removeCookie("role")
        localStorage.removeItem("user")
        router.push("/login")
    }

    return (
        <>
            {/* Desktop */}
            <aside className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 bg-linear-to-b from-blue-500 via-blue-600 to-blue-700 shadow-xl shadow-blue-900/25 transition-all duration-300 ease-in-out overflow-visible ${collapsed ? "w-[68px]" : "w-[230px]"}`}>
                {/* Glow overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 80% 0%, rgba(255,255,255,0.12) 0%, transparent 55%)" }} />
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <SidebarBody collapsed={collapsed} onLogout={handleLogout} />

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-[72px] z-20 w-6 h-6 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 text-blue-600"
                >
                    {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronLeft size={12} strokeWidth={2.5} />}
                </button>
            </aside>

            {/* Mobile: hamburger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button onClick={() => setMobileOpen(true)} className="w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-500 transition-colors active:scale-95">
                    <Menu className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Mobile: overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-blue-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile: drawer */}
            <aside className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 bg-linear-to-b from-blue-500 via-blue-600 to-blue-700 shadow-2xl shadow-blue-900/30 transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
                    <X className="w-4 h-4 text-white" />
                </button>
                <SidebarBody collapsed={false} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />
            </aside>
        </>
    )
}
