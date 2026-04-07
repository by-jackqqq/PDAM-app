"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Admin } from "@/types/admin"
import { toast } from "react-toastify"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
    open: boolean
    admin: Admin | null   // null = create mode, Admin = edit mode
    onClose: () => void
    onSuccess: () => void
}

const EMPTY = { name: "", username: "", phone: "", password: "" }

export default function AdminFormModal({ open, admin, onClose, onSuccess }: Props) {
    const isEdit = !!admin
    const [form, setForm] = useState(EMPTY)
    const [loading, setLoading] = useState(false)

    // Isi form saat edit
    useEffect(() => {
        if (admin) {
            setForm({
                name: admin.name,
                username: admin.user.username,
                phone: admin.phone,
                password: "",
            })
        } else {
            setForm(EMPTY)
        }
    }, [admin, open])

    const set = (key: keyof typeof EMPTY) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isEdit) {
                // PATCH /admins/:id — hanya kirim field yang diisi
                const payload: Record<string, string> = {}
                if (form.name) payload.name = form.name
                if (form.phone) payload.phone = form.phone
                if (form.password) payload.password = form.password
                await api.patch(`/admins/${admin!.id}`, payload)
                toast.success("Admin updated successfully")
            } else {
                // POST /admins
                await api.post("/admins", {
                    username: form.username,
                    password: form.password,
                    name: form.name,
                    phone: form.phone,
                })
                toast.success("Admin created successfully")
            }
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (isEdit ? "Failed to update admin" : "Failed to create admin")
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Admin" : "Add Admin"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Admin Full Name"
                            value={form.name}
                            onChange={set("name")}
                            required
                        />
                    </div>

                    {/* Username — hanya tampil saat create */}
                    {!isEdit && (
                        <div className="space-y-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="username"
                                value={form.username}
                                onChange={set("username")}
                                required
                            />
                        </div>
                    )}

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="08xxxxxxxxxx"
                            value={form.phone}
                            onChange={set("phone")}
                            required={!isEdit}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">
                            Password{isEdit && <span className="text-muted-foreground text-xs ml-1">(leave blank to keep current)</span>}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={isEdit ? "••••••••" : "password"}
                            value={form.password}
                            onChange={set("password")}
                            required={!isEdit}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Admin"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}