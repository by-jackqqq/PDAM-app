"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Topbar() {

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">

            <h1 className="font-semibold">
                PDAM Admin Panel
            </h1>

            <div className="flex items-center gap-3">
                
                <Link
                    href="/dashboard/profile"
                >
                    <Avatar>
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                </Link>
            </div>

        </header>
    )
}