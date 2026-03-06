"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Admin } from "@/types/admin"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import EditProfileModal from "@/app/components/dashboard/edit-profile-modal"

export default function ProfilePage() {

    const [admin, setAdmin] = useState<Admin | null>(null)
    const [openEdit, setOpenEdit] = useState(false)

    useEffect(() => {

        const fetchProfile = async () => {

            const res = await api.get<{ data: Admin }>("/admins/me")

            setAdmin(res.data.data)

        }

        fetchProfile()

    }, [])

    if (!admin) return <p>Loading...</p>

    return (

        <div className="max-w-xl space-y-4">

            <Card>

                <CardHeader className="flex flex-row items-center justify-between">

                    <div className="flex items-center gap-4">

                        <Avatar>
                            <AvatarFallback>
                                {admin.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h2 className="font-semibold text-lg">
                                {admin.name}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {admin.user.role}
                            </p>

                        </div>

                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setOpenEdit(true)}
                    >
                        Edit Profile
                    </Button>

                </CardHeader>

                <CardContent className="space-y-3">

                    <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p>{admin.user.username}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{admin.phone}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Admin ID</p>
                        <p>{admin.id}</p>
                    </div>

                </CardContent>

            </Card>

            <EditProfileModal
                admin={admin}
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                onUpdated={(data) => setAdmin(data)}
            />

        </div>
    )
}