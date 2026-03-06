"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Toolbox, CheckCircle2, ArrowDownUp, Banknote } from "lucide-react"
import { Service, CreateServicePayload, UpdateServicePayload } from "@/types/service"
import { api } from "@/lib/api"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    service?: Service | null
}

export default function ServiceFormModal({ open, onClose, onSuccess, service }: Props) {
    const isEdit = !!service

    const [form, setForm] = useState({
        name: "", min_usage: "", max_usage: "", price: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (open) {
            setForm({
                name: service?.name ?? "",
                min_usage: service?.min_usage?.toString() ?? "",
                max_usage: service?.max_usage?.toString() ?? "",
                price: service?.price?.toString() ?? "",
            })
            setError(null)
            setSuccess(false)
        }
    }, [open, service])

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    const isValid = form.name.trim() &&
        form.min_usage !== "" && form.max_usage !== "" && form.price !== "" &&
        Number(form.min_usage) >= 0 && Number(form.max_usage) > Number(form.min_usage) &&
        Number(form.price) > 0

    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true); setError(null)
        try {
            if (isEdit) {
                const payload: UpdateServicePayload = {
                    name: form.name.trim(),
                    min_usage: Number(form.min_usage),
                    max_usage: Number(form.max_usage),
                    price: Number(form.price),
                }
                await api.patch(`/services/${service!.id}`, payload)
            } else {
                const payload: CreateServicePayload = {
                    name: form.name.trim(),
                    min_usage: Number(form.min_usage),
                    max_usage: Number(form.max_usage),
                    price: Number(form.price),
                }
                await api.post("/services", payload)
            }
            setSuccess(true)
            setTimeout(() => { onSuccess(); onClose() }, 800)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong.")
        } finally { setLoading(false) }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Banner */}
                <div className="relative h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">
                    <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="dots-svc" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="white" />
                        </pattern></defs>
                        <rect width="100%" height="100%" fill="url(#dots-svc)" />
                    </svg>
                </div>

                <div className="flex justify-center -mt-7 relative z-10">
                    <div className="h-14 w-14 rounded-full border-4 border-background shadow-lg ring-2 ring-blue-500/20 bg-blue-500 flex items-center justify-center">
                        <Toolbox size={22} className="text-white" />
                    </div>
                </div>

                <div className="px-6 pt-3 pb-6 space-y-4">
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-base font-bold">
                            {isEdit ? "Edit Service" : "Create Service"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {isEdit ? "Update service tier information" : "Fill in details for the new service tier"}
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {error && <Feedback key="err" msg={error} type="error" />}
                        {success && <Feedback key="ok" msg={isEdit ? "Service updated!" : "Service created!"} type="success" />}
                    </AnimatePresence>

                    <div className="space-y-3">
                        {/* Name */}
                        <FieldInput
                            id="svc-name" label="Service Name" Icon={Toolbox} type="text"
                            placeholder="e.g. Layanan Rumah Tangga 1"
                            value={form.name} onChange={set("name")} disabled={loading}
                        />

                        {/* Min & Max usage — side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <FieldInput
                                id="min-usage" label="Min Usage (m³)" Icon={ArrowDownUp} type="number"
                                placeholder="e.g. 0"
                                value={form.min_usage} onChange={set("min_usage")} disabled={loading}
                            />
                            <FieldInput
                                id="max-usage" label="Max Usage (m³)" Icon={ArrowDownUp} type="number"
                                placeholder="e.g. 10"
                                value={form.max_usage} onChange={set("max_usage")} disabled={loading}
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-1.5">
                            <Label htmlFor="price" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                Price / m³ (IDR)
                            </Label>
                            <div className="relative">
                                <Banknote size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="price" type="number" placeholder="e.g. 2000"
                                    value={form.price} onChange={set("price")}
                                    disabled={loading} className="pl-8 h-9 text-sm"
                                />
                            </div>
                            {form.price && Number(form.price) > 0 && (
                                <p className="text-[11px] text-muted-foreground pl-1">
                                    = {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(form.price))}
                                </p>
                            )}
                        </div>

                        {/* Usage range warning */}
                        {form.min_usage && form.max_usage &&
                            Number(form.max_usage) <= Number(form.min_usage) && (
                                <p className="text-[11px] text-destructive pl-1">
                                    Max usage must be greater than min usage.
                                </p>
                            )}
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-9 bg-blue-600 hover:bg-blue-700"
                            onClick={handleSubmit}
                            disabled={!isValid || loading || success}
                        >
                            {loading
                                ? <Loader2 size={14} className="animate-spin" />
                                : success
                                    ? <CheckCircle2 size={14} />
                                    : isEdit ? "Save changes" : "Create service"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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