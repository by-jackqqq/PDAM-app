"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, User, Phone, AtSign, Lock, CheckCircle2, KeyRound } from "lucide-react"
import { Admin, CreateAdminPayload, UpdateAdminPayload } from "@/types/admin"
import { api } from "@/lib/api"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    admin?: Admin | null
}

const FIELDS = [
    { key: "name", label: "Full Name", icon: User, type: "text", ph: "Enter full name" },
    { key: "username", label: "Username", icon: AtSign, type: "text", ph: "Enter username" },
    { key: "phone", label: "Phone", icon: Phone, type: "text", ph: "Enter phone number" },
] as const

export default function AdminFormModal({ open, onClose, onSuccess, admin }: Props) {
    const isEdit = !!admin

    // Info form state
    const [form, setForm] = useState({ name: "", username: "", phone: "", password: "" })
    // Reset password state
    const [newPass, setNewPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")

    const [loading, setLoading] = useState(false)
    const [loadingPw, setLoadingPw] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errorPw, setErrorPw] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [successPw, setSuccessPw] = useState(false)

    useEffect(() => {
        if (open) {
            setForm({ name: admin?.name ?? "", username: admin?.user.username ?? "", phone: admin?.phone ?? "", password: "" })
            setNewPass(""); setConfirmPass("")
            setError(null); setErrorPw(null)
            setSuccess(false); setSuccessPw(false)
        }
    }, [open, admin])

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    const isValid = form.name.trim() && form.username.trim() && form.phone.trim()
        && (!isEdit ? form.password.trim() : true)

    // Submit info / create
    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true); setError(null)
        try {
            if (isEdit) {
                const payload: UpdateAdminPayload = { name: form.name.trim(), phone: form.phone.trim(), username: form.username.trim() }
                if (form.password) payload.password = form.password
                await api.patch(`/admins/${admin!.id}`, payload)
            } else {
                const payload: CreateAdminPayload = { name: form.name.trim(), username: form.username.trim(), phone: form.phone.trim(), password: form.password.trim() }
                await api.post("/admins", payload)
            }
            setSuccess(true)
            setTimeout(() => { onSuccess(); onClose() }, 800)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong.")
        } finally { setLoading(false) }
    }

    // Reset password
    const handleResetPassword = async () => {
        if (!newPass.trim()) { setErrorPw("New password is required."); return }
        if (newPass !== confirmPass) { setErrorPw("Passwords do not match."); return }
        setLoadingPw(true); setErrorPw(null)
        try {
            await api.patch(`/admins/${admin!.id}`, { password: newPass.trim() })
            setSuccessPw(true)
            setTimeout(() => { setSuccessPw(false); setNewPass(""); setConfirmPass("") }, 1200)
        } catch (err: unknown) {
            setErrorPw((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to reset password.")
        } finally { setLoadingPw(false) }
    }

    const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD"

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Banner */}
                <div className="relative h-20 bg-gradient-to-r from-primary via-primary/80 to-primary/50">
                    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="form-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="white" />
                        </pattern></defs>
                        <rect width="100%" height="100%" fill="url(#form-dots)" />
                    </svg>
                </div>

                <div className="flex justify-center -mt-7 relative z-10">
                    <Avatar className="h-14 w-14 border-4 border-background shadow-lg ring-2 ring-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="px-6 pt-3 pb-6 space-y-4">
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-base font-bold">
                            {isEdit ? "Edit Admin" : "Create Admin"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {isEdit ? "Update admin account information" : "Fill in details for the new admin"}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs — only show when editing */}
                    {isEdit ? (
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="w-full h-8 text-xs">
                                <TabsTrigger value="info" className="flex-1 text-xs gap-1.5"><User size={12} /> Info</TabsTrigger>
                                <TabsTrigger value="reset" className="flex-1 text-xs gap-1.5"><KeyRound size={12} /> Reset Password</TabsTrigger>
                            </TabsList>

                            {/* ── Info tab ── */}
                            <TabsContent value="info" className="mt-4 space-y-4">
                                <AnimatePresence mode="wait">
                                    {error && <Feedback key="err" msg={error} type="error" />}
                                    {success && <Feedback key="ok" msg="Admin updated!" type="success" />}
                                </AnimatePresence>

                                <div className="space-y-3">
                                    {FIELDS.map(({ key, label, icon: Icon, type, ph }) => (
                                        <FieldInput key={key} id={key} label={label} Icon={Icon} type={type}
                                            placeholder={ph} value={form[key as keyof typeof form]}
                                            onChange={set(key)} disabled={loading} />
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>Cancel</Button>
                                    <Button className="flex-1 h-9" onClick={handleSubmit} disabled={!isValid || loading || success}>
                                        {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <CheckCircle2 size={14} /> : "Save changes"}
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* ── Reset password tab ── */}
                            <TabsContent value="reset" className="mt-4 space-y-4">
                                <AnimatePresence mode="wait">
                                    {errorPw && <Feedback key="err" msg={errorPw} type="error" />}
                                    {successPw && <Feedback key="ok" msg="Password reset successfully!" type="success" />}
                                </AnimatePresence>

                                <div className="space-y-3">
                                    <FieldInput id="new-pass" label="New Password" Icon={Lock} type="password"
                                        placeholder="Enter new password" value={newPass} onChange={e => setNewPass(e.target.value)} disabled={loadingPw} />
                                    <FieldInput id="confirm-pass" label="Confirm Password" Icon={Lock} type="password"
                                        placeholder="Repeat new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} disabled={loadingPw} />
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loadingPw}>Cancel</Button>
                                    <Button className="flex-1 h-9" onClick={handleResetPassword}
                                        disabled={!newPass || !confirmPass || loadingPw || successPw}>
                                        {loadingPw ? <Loader2 size={14} className="animate-spin" /> : successPw ? <CheckCircle2 size={14} /> : "Reset Password"}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        /* ── Create mode (no tabs) ── */
                        <>
                            <AnimatePresence mode="wait">
                                {error && <Feedback key="err" msg={error} type="error" />}
                                {success && <Feedback key="ok" msg="Admin created!" type="success" />}
                            </AnimatePresence>

                            <div className="space-y-3">
                                {FIELDS.map(({ key, label, icon: Icon, type, ph }) => (
                                    <FieldInput key={key} id={key} label={label} Icon={Icon} type={type}
                                        placeholder={ph} value={form[key as keyof typeof form]}
                                        onChange={set(key)} disabled={loading} />
                                ))}
                                <Separator />
                                <FieldInput id="password" label="Password" Icon={Lock} type="password"
                                    placeholder="Enter password" value={form.password}
                                    onChange={set("password")} disabled={loading} />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>Cancel</Button>
                                <Button className="flex-1 h-9" onClick={handleSubmit} disabled={!isValid || loading || success}>
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <CheckCircle2 size={14} /> : "Create admin"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function Feedback({ msg, type }: { msg: string; type: "error" | "success" }) {
    return (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${type === "error"
                    ? "text-destructive bg-destructive/10 border-destructive/20"
                    : "text-emerald-600 bg-emerald-50 border-emerald-200"
                }`}>
            {type === "success" && <CheckCircle2 size={12} />}
            {msg}
        </motion.div>
    )
}

function FieldInput({ id, label, Icon, type, placeholder, value, onChange, disabled }: {
    id: string; label: string; Icon: React.ElementType; type: string
    placeholder: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; disabled: boolean
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                {label}
            </Label>
            <div className="relative">
                <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input id={id} type={type} placeholder={placeholder} value={value}
                    onChange={onChange} disabled={disabled} className="pl-8 h-9 text-sm" />
            </div>
        </div>
    )
}