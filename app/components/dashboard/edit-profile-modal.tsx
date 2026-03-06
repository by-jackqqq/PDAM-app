"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, User, Phone, AtSign, Lock } from "lucide-react"
import { Admin, UpdateProfilePayload } from "@/types/admin"
import { api } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Props {
    admin: Admin
    open: boolean
    onClose: () => void
    onUpdated: (admin: Admin) => void
}

const inputFields = [
    { key: "name", label: "Full Name", icon: User, type: "text", placeholder: "Enter your name" },
    { key: "username", label: "Username", icon: AtSign, type: "text", placeholder: "Enter username" },
    { key: "phone", label: "Phone", icon: Phone, type: "text", placeholder: "Enter phone number" },
]

export default function EditProfileModal({ admin, open, onClose, onUpdated }: Props) {
    const [form, setForm] = useState({ name: admin.name, username: admin.user.username, phone: admin.phone, password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    const isDirty = form.name !== admin.name || form.username !== admin.user.username
        || form.phone !== admin.phone || !!form.password

    const handleSubmit = async () => {
        setLoading(true); setError(null)
        try {
            const payload: UpdateProfilePayload = { name: form.name, phone: form.phone, username: form.username }
            if (form.password) payload.password = form.password
            const res = await api.put<{ data: Admin }>(`/admins/${admin.id}`, payload)
            onUpdated(res.data.data)
            onClose()
        } catch {
            setError("Failed to update profile. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Banner + Avatar */}
                <div className="relative h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/50">
                    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="1" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                </div>

                <div className="flex justify-center -mt-7 relative z-10">
                    <Avatar className="h-14 w-14 border-4 border-background shadow-lg ring-2 ring-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="px-6 pt-3 pb-6 space-y-5">
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-base font-bold">Edit Profile</DialogTitle>
                        <DialogDescription className="text-xs">Update your account information</DialogDescription>
                    </DialogHeader>

                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Input fields */}
                        {inputFields.map(({ key, label, icon: Icon, type, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <Label htmlFor={key} className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                    {label}
                                </Label>
                                <div className="relative">
                                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id={key}
                                        type={type}
                                        placeholder={placeholder}
                                        value={form[key as keyof typeof form]}
                                        onChange={set(key)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        ))}

                        <Separator />

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                New Password{" "}
                                <span className="normal-case font-normal opacity-50">(optional)</span>
                            </Label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    value={form.password}
                                    onChange={set("password")}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleSubmit} disabled={!isDirty || loading}>
                            {loading
                                ? <Loader2 size={14} className="animate-spin" />
                                : "Save changes"
                            }
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}