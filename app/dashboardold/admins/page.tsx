"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Admin } from "@/types/admin"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import AdminTable from "./admin-table"
import CreateAdminModal from "./create-admin-modal"

export default function AdminPage() {

    const [admins, setAdmins] = useState<Admin[]>([])
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(1)

    const [openCreate, setOpenCreate] = useState(false)

    const fetchAdmins = async () => {

        const res = await api.get("/admins", {
            params: {
                search,
                page,
                limit: 10
            }
        })

        setAdmins(res.data.data)
        setTotalPage(res.data.pagination?.total_page ?? 1)
    }

    useEffect(() => {
        fetchAdmins()
    }, [search, page])

    return (

        <div className="space-y-4">

            <div className="flex justify-between items-center">

                <h1 className="text-2xl font-semibold">
                    Admin Management
                </h1>

                <Button onClick={() => setOpenCreate(true)}>
                    + Add Admin
                </Button>

            </div>

            <Input
                placeholder="Search admin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <AdminTable
                admins={admins}
                refresh={fetchAdmins}
            />

            <div className="flex justify-end gap-2">

                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Prev
                </Button>

                <span className="px-2">
                    Page {page} / {totalPage}
                </span>

                <Button
                    variant="outline"
                    disabled={page === totalPage}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>

            </div>

            <CreateAdminModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={fetchAdmins}
            />

        </div>
    )
}