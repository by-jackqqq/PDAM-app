"use client"

import { Admin } from "@/types/admin"

import { Button } from "@/components/ui/button"

import EditAdminModal from "./edit-admin-modal"
import DeleteAdminDialog from "./delete-admin-dialog"

import { useState } from "react"

interface Props {
    admins: Admin[]
    refresh: () => void
}

export default function AdminTable({
    admins,
    refresh
}: Props) {

    const [editAdmin, setEditAdmin] = useState<Admin | null>(null)
    const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null)

    return (

        <div className="border rounded-lg overflow-hidden">

            <table className="w-full text-sm">

                <thead className="bg-slate-100">

                    <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Username</th>
                        <th className="p-3 text-left">Phone</th>
                        <th className="p-3 text-right">Action</th>
                    </tr>

                </thead>

                <tbody>

                    {admins.map((admin) => (

                        <tr key={admin.id} className="border-t">

                            <td className="p-3">{admin.name}</td>
                            <td className="p-3">{admin.user.username}</td>
                            <td className="p-3">{admin.phone}</td>

                            <td className="p-3 flex justify-end gap-2">

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditAdmin(admin)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteAdmin(admin)}
                                >
                                    Delete
                                </Button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            {editAdmin && (
                <EditAdminModal
                    admin={editAdmin}
                    onClose={() => setEditAdmin(null)}
                    onUpdated={refresh}
                />
            )}

            {deleteAdmin && (
                <DeleteAdminDialog
                    admin={deleteAdmin}
                    onClose={() => setDeleteAdmin(null)}
                    onDeleted={refresh}
                />
            )}

        </div>
    )
}