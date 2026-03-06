"use client"

import { useState } from "react"
import { api } from "@/lib/api"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CreateAdminModal({ open, onClose, onCreated }: any) {

    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")

    const handleCreate = async () => {

        await api.post("/admins", {
            name,
            username,
            phone,
            password
        })

        onCreated()
        onClose()
    }

    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent>

                <DialogHeader>
                    <DialogTitle>Create Admin</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">

                    <Input placeholder="Name" onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    <Input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
                    <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

                    <Button onClick={handleCreate}>
                        Create Admin
                    </Button>

                </div>

            </DialogContent>

        </Dialog>

    )
}