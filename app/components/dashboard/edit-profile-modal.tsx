"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Loader2, User, Phone, AtSign, Lock,
    CheckCircle2, ShieldCheck, AlertCircle,
} from "lucide-react"
import { Admin, UpdateAdminPayload } from "@/types/admin"
import { api } from "@/lib/api"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Props {
    admin: Admin
    open: boolean
    onClose: () => void
    onUpdated: (admin: Admin) => void
}

const INFO_FIELDS = [
    { key: "name", label: "Full Name", icon: User, type: "text", placeholder: "Enter your full name" },
    { key: "username", label: "Username", icon: AtSign, type: "text", placeholder: "Enter username" },
    { key: "phone", label: "Phone", icon: Phone, type: "text", placeholder: "Enter phone number" },
] as const

export default function EditProfileModal({ admin, open, onClose, onUpdated }: Props) {
    const [form, setForm] = useState({ name: "", username: "", phone: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [newPass, setNewPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [loadingPw, setLoadingPw] = useState(false)
    const [errorPw, setErrorPw] = useState<string | null>(null)
    const [successPw, setSuccessPw] = useState(false)

    useEffect(() => {
        if (open) {
            setForm({ name: admin.name, username: admin.user.username, phone: admin.phone })
            setNewPass(""); setConfirmPass("")
            setError(null); setErrorPw(null)
            setSuccess(false); setSuccessPw(false)
        }
    }, [open, admin])

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }))

    const isDirty =
        form.name !== admin.name ||
        form.username !== admin.user.username ||
        form.phone !== admin.phone

    const handleSubmit = async () => {
        if (!isDirty) return
        setLoading(true); setError(null)
        try {
            const payload: UpdateAdminPayload = {
                name: form.name.trim(), phone: form.phone.trim(), username: form.username.trim(),
            }
            const res = await api.patch<{ data: Admin }>(`/admins/${admin.id}`, payload)
            setSuccess(true)
            onUpdated(res.data.data)
            setTimeout(() => { setSuccess(false); onClose() }, 900)
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } }
            setError(e?.response?.data?.message ?? "Failed to update profile.")
        } finally { setLoading(false) }
    }

    const handleResetPassword = async () => {
        if (!newPass.trim()) { setErrorPw("New password is required."); return }
        if (newPass !== confirmPass) { setErrorPw("Passwords do not match."); return }
        setLoadingPw(true); setErrorPw(null)
        try {
            await api.patch(`/admins/${admin.id}`, { password: newPass.trim() })
            setSuccessPw(true)
            setTimeout(() => { setSuccessPw(false); setNewPass(""); setConfirmPass("") }, 1200)
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } }
            setErrorPw(e?.response?.data?.message ?? "Failed to reset password.")
        } finally { setLoadingPw(false) }
    }

    const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD"
    const passwordsMatch = newPass && confirmPass && newPass === confirmPass

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl border border-blue-100 shadow-xl">

                {/* ── Header ── */}
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 px-5 pt-5 pb-12 overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full opacity-10">
                        <defs>
                            <pattern id="mdots" width="16" height="16" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mdots)" />
                    </svg>
                    <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10" />

                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-lg font-bold text-white">Edit Profile</DialogTitle>
                        <DialogDescription className="text-blue-100 text-xs mt-0.5">
                            Update your account information
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* ── Avatar overlapping ── */}
                <div className="flex items-center gap-3 px-5 -mt-7 relative z-10 mb-1">
                    <Avatar className="h-14 w-14 border-[3px] border-white shadow-lg ring-2 ring-blue-100 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-400 text-white text-lg font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 shadow-sm border border-blue-50">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{form.name || admin.name}</p>
                        <p className="text-[11px] text-gray-400">@{form.username || admin.user.username}</p>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="px-5 pb-5 pt-3">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="w-full h-8 rounded-lg bg-blue-50 mb-4 p-0.5">
                            <TabsTrigger value="info"
                                className="flex-1 text-xs gap-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-semibold text-gray-500">
                                <User size={11} /> Info
                            </TabsTrigger>
                            <TabsTrigger value="reset"
                                className="flex-1 text-xs gap-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-semibold text-gray-500">
                                <ShieldCheck size={11} /> Security
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Info tab ── */}
                        <TabsContent value="info" className="mt-0 space-y-3">
                            <AnimatePresence mode="wait">
                                {error && <Feedback key="err" msg={error} type="error" />}
                                {success && <Feedback key="ok" msg="Profile updated!" type="success" />}
                            </AnimatePresence>

                            <div className="space-y-2.5">
                                {INFO_FIELDS.map(({ key, label, icon: Icon, type, placeholder }) => (
                                    <div key={key} className="space-y-1">
                                        <Label htmlFor={key} className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                            {label}
                                        </Label>
                                        <div className="relative">
                                            <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                                            <Input
                                                id={key} type={type} placeholder={placeholder}
                                                value={form[key as keyof typeof form]}
                                                onChange={set(key)} disabled={loading}
                                                className="pl-8 h-9 text-sm rounded-xl border-blue-100 bg-blue-50/50 focus:bg-white focus:border-blue-300 transition-colors font-medium"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" className="flex-1 h-9 rounded-xl text-sm font-semibold border-blue-100 text-gray-600 hover:bg-blue-50" onClick={onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-9 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleSubmit} disabled={!isDirty || loading || success}
                                >
                                    {loading ? <Loader2 size={13} className="animate-spin" />
                                        : success ? <><CheckCircle2 size={13} /> Saved</>
                                            : "Save Changes"}
                                </Button>
                            </div>
                        </TabsContent>

                        {/* ── Security tab ── */}
                        <TabsContent value="reset" className="mt-0 space-y-3">
                            <AnimatePresence mode="wait">
                                {errorPw && <Feedback key="err" msg={errorPw} type="error" />}
                                {successPw && <Feedback key="ok" msg="Password changed successfully!" type="success" />}
                            </AnimatePresence>

                            <div className="space-y-2.5">
                                <FieldInput
                                    id="new-pass" label="New Password" Icon={Lock} type="password"
                                    placeholder="Enter new password"
                                    value={newPass} onChange={e => setNewPass(e.target.value)} disabled={loadingPw}
                                />
                                <FieldInput
                                    id="confirm-pass" label="Confirm Password" Icon={Lock} type="password"
                                    placeholder="Repeat new password"
                                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)} disabled={loadingPw}
                                />
                                {/* Live match indicator */}
                                {newPass && confirmPass && (
                                    <motion.p
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className={`text-[11px] font-semibold flex items-center gap-1 pl-0.5 ${passwordsMatch ? "text-emerald-600" : "text-red-500"
                                            }`}
                                    >
                                        {passwordsMatch
                                            ? <><CheckCircle2 size={11} /> Passwords match</>
                                            : <><AlertCircle size={11} /> Passwords do not match</>
                                        }
                                    </motion.p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" className="flex-1 h-9 rounded-xl text-sm font-semibold border-blue-100 text-gray-600 hover:bg-blue-50" onClick={onClose} disabled={loadingPw}>
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 h-9 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleResetPassword}
                                    disabled={!newPass || !confirmPass || !passwordsMatch || loadingPw || successPw}
                                >
                                    {loadingPw ? <Loader2 size={13} className="animate-spin" />
                                        : successPw ? <><CheckCircle2 size={13} /> Changed</>
                                            : "Change Password"}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

            </DialogContent>
        </Dialog>
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Feedback({ msg, type }: { msg: string; type: "error" | "success" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 font-medium border ${type === "error"
                    ? "text-red-600 bg-red-50 border-red-100"
                    : "text-emerald-700 bg-emerald-50 border-emerald-100"
                }`}
        >
            {type === "success" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {msg}
        </motion.div>
    )
}

function FieldInput({ id, label, Icon, type, placeholder, value, onChange, disabled }: {
    id: string; label: string; Icon: React.ElementType; type: string
    placeholder: string; value: string
    onChange: React.ChangeEventHandler<HTMLInputElement>; disabled: boolean
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {label}
            </Label>
            <div className="relative">
                <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                <Input
                    id={id} type={type} placeholder={placeholder} value={value}
                    onChange={onChange} disabled={disabled}
                    className="pl-8 h-9 text-sm rounded-xl border-blue-100 bg-blue-50/50 focus:bg-white focus:border-blue-300 transition-colors font-medium"
                />
            </div>
        </div>
    )
}