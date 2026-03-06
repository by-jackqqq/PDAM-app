"use client"

import { Admin } from "@/types/admin"
import Link from "next/link"
import { api } from "@/lib/api"

interface Props {
    admins: Admin[]
}

export default function AdminTable({ admins }: Props) {

    const handleDelete = async (id: string) => {
        if (!confirm("Delete admin?")) return

        await api.delete(`/admins/${id}`)
        location.reload()
    }

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">

            <div className="flex justify-between p-4">
                <h2 className="font-semibold">Admin List</h2>

                <Link
                    href="/dashboard/admins/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    + Add Admin
                </Link>
            </div>

            <table className="w-full text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Username</th>
                        <th className="p-4 text-left">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {admins.map((admin) => (
                        <tr key={admin.id} className="border-t">

                            <td className="p-4">{admin.name}</td>
                            <td className="p-4">{admin.user.username}</td>

                            <td className="p-4 flex gap-3">

                                <Link
                                    href={`/dashboard/admins/edit/${admin.id}`}
                                    className="text-blue-600"
                                >
                                    Edit
                                </Link>

                                <button
                                    onClick={() => handleDelete(admin.id)}
                                    className="text-red-600"
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}