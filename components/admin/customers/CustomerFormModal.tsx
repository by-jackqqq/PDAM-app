"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Loader2, Users, CheckCircle2,
    User, KeyRound, Phone, MapPin, CreditCard, Layers,
} from "lucide-react"
import { api } from "@/lib/api"
import { Customer, CreateCustomerPayload, CustomerService } from "@/types/customer"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface Props {
    open: boolean
    customer: Customer | null
    onClose: () => void
    onSuccess: () => void
}

const EMPTY = {
    name: "",
    username: "",
    phone: "",
    address: "",
    customer_number: "",
    password: "",
    service_id: "",
}

export default function CustomerFormModal({ open, customer, onClose, onSuccess }: Props) {
    const isEdit = !!customer

    const [form, setForm] = useState(EMPTY)
    const [services, setServices] = useState<CustomerService[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Fetch daftar service untuk dropdown
    const fetchServices = useCallback(async () => {
        try {
            const res = await api.get("/services", { params: { page: 1, quantity: 9999 } })
            setServices(res.data.data ?? [])
        } catch {
            // silent
        }
    }, [])

    useEffect(() => {
        if (open) {
            fetchServices()
            setError(null)
            setSuccess(false)
        }
    }, [open, fetchServices])

    // Isi form saat edit
    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name,
                username: customer.user.username,
                phone: customer.phone,
                address: customer.address,
                customer_number: customer.customer_number,
                password: "",
                service_id: String(customer.service_id),
            })
        } else {
            setForm(EMPTY)
        }
    }, [customer, open])

    const set = (key: keyof typeof EMPTY) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, [key]: e.target.value }))

    const isValid = isEdit
        ? form.name.trim() !== ""
        : form.name.trim() !== "" &&
          form.username.trim() !== "" &&
          form.password.trim() !== "" &&
          form.customer_number.trim() !== "" &&
          form.phone.trim() !== "" &&
          form.address.trim() !== "" &&
          form.service_id !== ""

    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true)
        setError(null)
        try {
            if (isEdit) {
                const payload: Record<string, string> = {}
                if (form.name) payload.name = form.name
                if (form.phone) payload.phone = form.phone
                if (form.address) payload.address = form.address
                if (form.password) payload.password = form.password
                await api.patch(`/customers/${customer!.id}`, payload)
            } else {
                const payload: CreateCustomerPayload = {
                    username: form.username,
                    password: form.password,
                    name: form.name,
                    phone: form.phone,
                    address: form.address,
                    customer_number: form.customer_number,
                    service_id: Number(form.service_id),
                }
                await api.post("/customers", payload)
            }
            setSuccess(true)
            setTimeout(() => { onSuccess(); onClose() }, 800)
        } catch (err: unknown) {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (isEdit ? "Failed to update customer." : "Failed to create customer.")
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Banner */}
                <div className="relative h-20 bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-400">
                    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="dots-cust" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="white" />
                        </pattern></defs>
                        <rect width="100%" height="100%" fill="url(#dots-cust)" />
                    </svg>
                </div>

                <div className="flex justify-center -mt-7 relative z-10">
                    <div className="h-14 w-14 rounded-full border-4 border-background shadow-lg ring-2 ring-emerald-500/20 bg-emerald-500 flex items-center justify-center">
                        <Users size={22} className="text-white" />
                    </div>
                </div>

                <div className="px-6 pt-3 pb-6 space-y-4">
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-base font-bold">
                            {isEdit ? "Edit Customer" : "Add Customer"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {isEdit ? "Update customer account information" : "Fill in details for the new customer"}
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {error && <Feedback key="err" msg={error} type="error" />}
                        {success && <Feedback key="ok" msg={isEdit ? "Customer updated!" : "Customer created!"} type="success" />}
                    </AnimatePresence>

                    <div className="space-y-3">
                        {/* Name */}
                        <FieldInput
                            id="c-name" label="Full Name" Icon={User} type="text"
                            placeholder="Customer Full Name"
                            value={form.name} onChange={set("name")} disabled={loading}
                        />

                        {/* Username — hanya create */}
                        {!isEdit && (
                            <FieldInput
                                id="c-username" label="Username" Icon={User} type="text"
                                placeholder="username"
                                value={form.username} onChange={set("username")} disabled={loading}
                            />
                        )}

                        {/* NIK — hanya create */}
                        {!isEdit && (
                            <FieldInput
                                id="c-nik" label="NIK (Customer Number)" Icon={CreditCard} type="text"
                                placeholder="16-digit NIK"
                                value={form.customer_number} onChange={set("customer_number")} disabled={loading}
                            />
                        )}

                        {/* Phone & Address: 2 kolom */}
                        <div className="grid grid-cols-2 gap-3">
                            <FieldInput
                                id="c-phone" label="Phone" Icon={Phone} type="tel"
                                placeholder="08xxxxxxxxxx"
                                value={form.phone} onChange={set("phone")} disabled={loading}
                            />
                            <FieldInput
                                id="c-address" label="Address" Icon={MapPin} type="text"
                                placeholder="Full address"
                                value={form.address} onChange={set("address")} disabled={loading}
                            />
                        </div>

                        {/* Service — hanya create */}
                        {!isEdit && (
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Layers size={11} />
                                    Service
                                </Label>
                                <Select
                                    value={form.service_id}
                                    onValueChange={(v) => setForm((f) => ({ ...f, service_id: v }))}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="c-password" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Password{isEdit && <span className="normal-case ml-1 font-normal">(leave blank to keep)</span>}
                            </Label>
                            <div className="relative">
                                <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="c-password" type="password"
                                    placeholder={isEdit ? "••••••••" : "password"}
                                    value={form.password} onChange={set("password")}
                                    disabled={loading} className="pl-8 h-9 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleSubmit}
                            disabled={!isValid || loading || success}
                        >
                            {loading
                                ? <Loader2 size={14} className="animate-spin" />
                                : success
                                    ? <CheckCircle2 size={14} />
                                    : isEdit ? "Save changes" : "Create customer"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
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