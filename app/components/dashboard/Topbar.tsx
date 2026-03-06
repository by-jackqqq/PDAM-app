"use client"

import { useRouter } from "next/navigation"

export default function Topbar() {
    const router = useRouter()

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="flex items-center justify-between px-6 py-4">

                {/* LEFT */}
                <div>
                    <h1 className="text-lg font-semibold text-slate-800">
                        Dashboard
                    </h1>
                    <p className="text-xs text-slate-500">
                        PDAM Smart Management System
                    </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">

                    {/* Notification (UI only) */}
                    <button className="relative w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center">
                        🔔
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-200" />

                    {/* Profile */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-700">
                                Admin PDAM
                            </p>
                            <p className="text-xs text-slate-400">
                                Administrator
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow">
                            A
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => router.push("/login")}
                        className="ml-2 px-4 py-2 rounded-full border border-slate-300 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}
