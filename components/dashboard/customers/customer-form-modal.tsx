"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, User, Phone, AtSign, Lock, CheckCircle2, KeyRound, MapPin, CreditCard, Layers } from "lucide-react"
import { Customer, CreateCustomerPayload, UpdateCustomerPayload, Service, ServiceListResponse } from "@/types/customer"
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
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    customer?: Customer | null
}

export default function CustomerFormModal({ open, onClose, onSuccess, customer }: Props) {
    const isEdit = !!customer

    const [form, setForm] = useState({
        name: "", username: "", phone: "",
        password: "", customer_number: "",
        address: "", service_id: "",
    })
    const [newPass, setNewPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [services, setServices] = useState<Service[]>([])

    const [loading, setLoading] = useState(false)
    const [loadingPw, setLoadingPw] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errorPw, setErrorPw] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [successPw, setSuccessPw] = useState(false)

    // Fetch services for dropdown
    useEffect(() => {
        if (!open) return
        api.get<ServiceListResponse>("/services", { params: { page: 1, quantity: 9999 } })
            .then(res => setServices(res.data.data ?? []))
            .catch(() => { })
    }, [open])

    // Reset form
    useEffect(() => {
        if (open) {
            setForm({
                name: customer?.name ?? "",
                username: customer?.user.username ?? "",
                phone: customer?.phone ?? "",
                password: "",
                customer_number: customer?.customer_number ?? "",
                address: customer?.address ?? "",
                service_id: customer?.service_id?.toString() ?? "",
            })
            setNewPass(""); setConfirmPass("")
            setError(null); setErrorPw(null)
            setSuccess(false); setSuccessPw(false)
        }
    }, [open, customer])

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    const isValid = form.name.trim() && form.username.trim() && form.phone.trim() &&
        form.customer_number.trim() && form.address.trim() && form.service_id &&
        (!isEdit ? form.password.trim() : true)

    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true); setError(null)
        try {
            if (isEdit) {
                const payload: UpdateCustomerPayload = {
                    name: form.name.trim(),
                    username: form.username.trim(),
                    phone: form.phone.trim(),
                    customer_number: form.customer_number.trim(),
                    address: form.address.trim(),
                    service_id: Number(form.service_id),
                }
                if (form.password) payload.password = form.password
                await api.patch(`/customers/${customer!.id}`, payload)
            } else {
                const payload: CreateCustomerPayload = {
                    name: form.name.trim(),
                    username: form.username.trim(),
                    phone: form.phone.trim(),
                    password: form.password.trim(),
                    customer_number: form.customer_number.trim(),
                    address: form.address.trim(),
                    service_id: Number(form.service_id),
                }
                await api.post("/customers", payload)
            }
            setSuccess(true)
            setTimeout(() => { onSuccess(); onClose() }, 800)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong.")
        } finally { setLoading(false) }
    }

    const handleResetPassword = async () => {
        if (!newPass.trim()) { setErrorPw("New password is required."); return }
        if (newPass !== confirmPass) { setErrorPw("Passwords do not match."); return }
        setLoadingPw(true); setErrorPw(null)
        try {
            await api.patch(`/customers/${customer!.id}`, { password: newPass.trim() })
            setSuccessPw(true)
            setTimeout(() => { setSuccessPw(false); setNewPass(""); setConfirmPass("") }, 1200)
        } catch (err: unknown) {
            setErrorPw((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to reset password.")
        } finally { setLoadingPw(false) }
    }

    const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "CU"

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Banner */}
                <div className="relative h-20 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400">
                    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="white" />
                        </pattern></defs>
                        <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                </div>

                <div className="flex justify-center -mt-7 relative z-10">
                    <Avatar className="h-14 w-14 border-4 border-background shadow-lg ring-2 ring-emerald-500/20">
                        <AvatarFallback className="bg-emerald-500 text-white text-lg font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="px-6 pt-3 pb-6 space-y-4">
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-base font-bold">
                            {isEdit ? "Edit Customer" : "Create Customer"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {isEdit ? "Update customer account information" : "Fill in details for the new customer"}
                        </DialogDescription>
                    </DialogHeader>

                    {isEdit ? (
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="w-full h-8 text-xs">
                                <TabsTrigger value="info" className="flex-1 text-xs gap-1.5"><User size={12} /> Info</TabsTrigger>
                                <TabsTrigger value="reset" className="flex-1 text-xs gap-1.5"><KeyRound size={12} /> Reset Password</TabsTrigger>
                            </TabsList>

                            {/* Info tab */}
                            <TabsContent value="info" className="mt-4 space-y-4">
                                <AnimatePresence mode="wait">
                                    {error && <Feedback key="err" msg={error} type="error" />}
                                    {success && <Feedback key="ok" msg="Customer updated!" type="success" />}
                                </AnimatePresence>

                                <div className="space-y-3">
                                    <FieldInput id="name" label="Full Name" Icon={User} type="text" placeholder="Enter full name" value={form.name} onChange={set("name")} disabled={loading} />
                                    <FieldInput id="username" label="Username" Icon={AtSign} type="text" placeholder="Enter username" value={form.username} onChange={set("username")} disabled={loading} />
                                    <FieldInput id="phone" label="Phone" Icon={Phone} type="text" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} disabled={loading} />
                                    <FieldInput id="nik" label="NIK" Icon={CreditCard} type="text" placeholder="Enter NIK (16 digits)" value={form.customer_number} onChange={set("customer_number")} disabled={loading} />
                                    <FieldInput id="address" label="Address" Icon={MapPin} type="text" placeholder="Enter address" value={form.address} onChange={set("address")} disabled={loading} />
                                    <ServiceSelect value={form.service_id} services={services}
                                        onChange={v => setForm(f => ({ ...f, service_id: v }))} disabled={loading} />
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>Cancel</Button>
                                    <Button className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={!isValid || loading || success}>
                                        {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <CheckCircle2 size={14} /> : "Save changes"}
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Reset password tab */}
                            <TabsContent value="reset" className="mt-4 space-y-4">
                                <AnimatePresence mode="wait">
                                    {errorPw && <Feedback key="err" msg={errorPw} type="error" />}
                                    {successPw && <Feedback key="ok" msg="Password reset successfully!" type="success" />}
                                </AnimatePresence>
                                <div className="space-y-3">
                                    <FieldInput id="new-pass" label="New Password" Icon={Lock} type="password" placeholder="Enter new password" value={newPass} onChange={e => setNewPass(e.target.value)} disabled={loadingPw} />
                                    <FieldInput id="confirm-pass" label="Confirm Password" Icon={Lock} type="password" placeholder="Repeat new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} disabled={loadingPw} />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loadingPw}>Cancel</Button>
                                    <Button className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700" onClick={handleResetPassword}
                                        disabled={!newPass || !confirmPass || loadingPw || successPw}>
                                        {loadingPw ? <Loader2 size={14} className="animate-spin" /> : successPw ? <CheckCircle2 size={14} /> : "Reset Password"}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        /* Create mode */
                        <>
                            <AnimatePresence mode="wait">
                                {error && <Feedback key="err" msg={error} type="error" />}
                                {success && <Feedback key="ok" msg="Customer created!" type="success" />}
                            </AnimatePresence>

                            <div className="space-y-3">
                                <FieldInput id="name" label="Full Name" Icon={User} type="text" placeholder="Enter full name" value={form.name} onChange={set("name")} disabled={loading} />
                                <FieldInput id="username" label="Username" Icon={AtSign} type="text" placeholder="Enter username" value={form.username} onChange={set("username")} disabled={loading} />
                                <FieldInput id="phone" label="Phone" Icon={Phone} type="text" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} disabled={loading} />
                                <FieldInput id="nik" label="NIK" Icon={CreditCard} type="text" placeholder="Enter NIK (16 digits)" value={form.customer_number} onChange={set("customer_number")} disabled={loading} />
                                <FieldInput id="address" label="Address" Icon={MapPin} type="text" placeholder="Enter address" value={form.address} onChange={set("address")} disabled={loading} />
                                <ServiceSelect value={form.service_id} services={services}
                                    onChange={v => setForm(f => ({ ...f, service_id: v }))} disabled={loading} />
                                <Separator />
                                <FieldInput id="password" label="Password" Icon={Lock} type="password"
                                    placeholder="Enter password" value={form.password} onChange={set("password")} disabled={loading} />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>Cancel</Button>
                                <Button className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit} disabled={!isValid || loading || success}>
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : success ? <CheckCircle2 size={14} /> : "Create customer"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ServiceSelect({ value, services, onChange, disabled }: {
    value: string; services: Service[]
    onChange: (v: string) => void; disabled: boolean
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Service
            </Label>
            <div className="relative">
                <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                <Select value={value} onValueChange={onChange} disabled={disabled}>
                    <SelectTrigger className="pl-8 h-9 text-sm">
                        <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                        {services.map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

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
    placeholder: string; value: string
    onChange: React.ChangeEventHandler<HTMLInputElement>; disabled: boolean
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