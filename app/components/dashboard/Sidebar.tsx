"use client"

import Link from "next/link"

const menus = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admins", href: "/dashboard/admins" },
    { label: "Customers", href: "/dashboard/customers" },
    { label: "Services", href: "/dashboard/services" },
    { label: "Bills", href: "/dashboard/bills" },
    { label: "Payments", href: "/dashboard/payments" },
]

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r">
            <div className="p-6 font-bold text-xl text-blue-600">
                💧 PDAM Smart
            </div>

            <nav className="px-4 space-y-1">
                {menus.map((m) => (
                    <Link
                        key={m.href}
                        href={m.href}
                        className="block rounded-lg px-4 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                        {m.label}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}
