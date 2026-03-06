"use client"

import { useState } from "react"
import { api } from "@/lib/api"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditAdminModal({ admin, onClose, onUpdated }: any) {

    const [name, setName] = useState(admin.name)
    const [phone, setPhone] = useState(admin.phone)

    const handleUpdate = async () => {

        await api.put(`/admins/${admin.id}`, {
            name,
            phone
        })

        onUpdated()
        onClose()
    }

    return (

        <Dialog open onOpenChange={onClose}>

            <DialogContent>

                <DialogHeader>
                    <DialogTitle>Edit Admin</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">

                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

                    <Button onClick={handleUpdate}>
                        Update Admin
                    </Button>

                </div>

            </DialogContent>

        </Dialog>

    )
}