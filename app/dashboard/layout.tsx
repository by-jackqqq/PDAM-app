"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

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
        const fetchAdmin = async () => {
            const res = await api.get<{ data: Admin }>("/admins/me")
            setAdmin(res.data.data)
        }

        fetchAdmin()
    }, [])

    return (
        <SidebarProvider>

            <AppSidebar admin={admin} />

            <SidebarInset>

                {/* HEADER */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b">

                    <div className="flex items-center gap-2 px-4">

                        <SidebarTrigger className="-ml-1" />

                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />

                        <Breadcrumb>
                            <BreadcrumbList>

                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>

                                {breadcrumbs.slice(1).map((crumb) => (
                                    <BreadcrumbItem key={crumb.href}>

                                        <BreadcrumbSeparator className="hidden md:block" />

                                        {crumb.isLast ? (
                                            <BreadcrumbPage>
                                                {crumb.label}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink
                                                href={crumb.href}
                                                className="hidden md:block"
                                            >
                                                {crumb.label}
                                            </BreadcrumbLink>
                                        )}

                                    </BreadcrumbItem>
                                ))}

                            </BreadcrumbList>
                        </Breadcrumb>

                    </div>

                </header>

                {/* CONTENT */}
                <main className="flex flex-1 flex-col gap-4 p-6">
                    {children}
                </main>

            </SidebarInset>

        </SidebarProvider>
    )
}