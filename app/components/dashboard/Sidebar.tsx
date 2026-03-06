"use client"

import Link from "next/link"
import { LayoutDashboard, Users, User } from "lucide-react"

export default function Sidebar() {

    return (
        <aside className="w-64 bg-white border-r">

            <div className="p-6 font-bold text-lg">
                PDAM Dashboard
            </div>

            <nav className="space-y-1 px-3">

                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-2 rounded hover:bg-slate-100"
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </Link>

                <Link
                    href="/dashboard/admins"
                    className="flex items-center gap-3 p-2 rounded hover:bg-slate-100"
                >
                    <Users size={18} />
                    Admin
                </Link>

                <Link
                    href="/dashboard/customers"
                    className="flex items-center gap-3 p-2 rounded hover:bg-slate-100"
                >
                    <Users size={18} />
                    Customer
                </Link>
            </nav>

        </aside>
    )
}