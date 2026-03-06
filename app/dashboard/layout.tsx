"use client"

import React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Admin } from "@/types/admin"
import { AppSidebar } from "@/components/app-sidebar"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

function formatSegment(segment: string): string {
    return segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean)
    return segments.map((segment, index) => ({
        label: formatSegment(segment),
        href: "/" + segments.slice(0, index + 1).join("/"),
        isLast: index === segments.length - 1,
    }))
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [admin, setAdmin] = useState<Admin | null>(null)
    const pathname = usePathname()
    const breadcrumbs = buildBreadcrumbs(pathname)

    useEffect(() => {
        api.get<{ data: Admin }>("/admins/me")
            .then(res => setAdmin(res.data.data))
            .catch(() => { })
    }, [])

    return (
        <SidebarProvider>
            <AppSidebar admin={admin} />

            <SidebarInset>

                {/* ── Header ── */}
                <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 backdrop-blur px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="h-4 mr-1" />

                    {/* Breadcrumb — ✅ fix: separator di LUAR BreadcrumbItem */}
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:flex">
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            {breadcrumbs.slice(1).map((crumb) => (
                                <React.Fragment key={crumb.href}>
                                    {/* ✅ Separator OUTSIDE BreadcrumbItem — fixes hydration error */}
                                    <BreadcrumbSeparator className="hidden md:flex" />

                                    <BreadcrumbItem>
                                        {crumb.isLast ? (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild className="hidden md:flex">
                                                <Link href={crumb.href}>{crumb.label}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* ── Content ── */}
                <main className="flex flex-1 flex-col gap-4 p-6 bg-muted/20 min-h-0">
                    {children}
                </main>

            </SidebarInset>
        </SidebarProvider>
    )
}