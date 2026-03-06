"use client"

import { useState } from "react"
import { Admin, UpdateProfilePayload } from "@/types/admin"
import { api } from "@/lib/api"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Props {
    admin: Admin
    open: boolean
    onClose: () => void
    onUpdated: (admin: Admin) => void
}

export default function EditProfileModal({
    admin,
    open,
    onClose,
    onUpdated
}: Props) {

    const [name, setName] = useState(admin.name)
    const [phone, setPhone] = useState(admin.phone)
    const [username, setUsername] = useState(admin.user.username)
    const [password, setPassword] = useState("")

    const handleSubmit = async () => {

        const payload: UpdateProfilePayload = {
            name,
            phone,
            username
        }

        if (password) payload.password = password

        const res = await api.put<{ data: Admin }>(
            `/admins/${admin.id}`,
            payload
        )

        onUpdated(res.data.data)

        onClose()
    }

    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent>

                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">

                    <Input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <Input
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <Input
                        type="password"
                        placeholder="New Password (optional)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                    >
                        Update Profile
                    </Button>

                </div>

            </DialogContent>

        </Dialog>
    )
}