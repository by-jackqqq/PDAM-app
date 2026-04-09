"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Loader2, FileText, CheckCircle2,
    User, Layers, Hash, Droplets, CalendarDays, Calculator,
} from "lucide-react"
import { api } from "@/lib/api"
import { Bill, CreateBillPayload, UpdateBillPayload, MONTH_NAMES } from "@/types/bill"
import { CustomerService } from "@/types/customer"
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

interface CustomerOption {
    id: number
    name: string
    customer_number: string
}

interface Props {
    open: boolean
    bill: Bill | null
    onClose: () => void
    onSuccess: () => void
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)

const EMPTY = {
    customer_id: "",
    service_id: "",
    month: "",
    year: String(CURRENT_YEAR),
    measurement_number: "",
    usage_value: "",
}

export default function BillFormModal({ open, bill, onClose, onSuccess }: Props) {
    const isEdit = !!bill

    const [form, setForm] = useState(EMPTY)
    const [customers, setCustomers] = useState<CustomerOption[]>([])
    const [services, setServices] = useState<CustomerService[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Derived: selected service object for price preview
    const selectedService = services.find(s => String(s.id) === form.service_id) ?? null
    // For edit, find service by bill.service_id
    const editService = isEdit && bill
        ? services.find(s => s.id === bill.service_id) ?? null
        : null
    const activeService = isEdit ? editService : selectedService
    const usageNum = Number(form.usage_value)
    const estimatedTotal = activeService && usageNum > 0
        ? activeService.price * usageNum
        : null

    const fetchOptions = useCallback(async () => {
        try {
            const [cRes, sRes] = await Promise.all([
                api.get("/customers", { params: { page: 1, quantity: 9999 } }),
                api.get("/services", { params: { page: 1, quantity: 9999 } }),
            ])
            setCustomers(cRes.data.data ?? [])
            setServices(sRes.data.data ?? [])
        } catch {
            // silent
        }
    }, [])

    useEffect(() => {
        if (open) {
            fetchOptions()
            setError(null)
            setSuccess(false)
        }
    }, [open, fetchOptions])

    useEffect(() => {
        if (bill) {
            setForm({
                customer_id: String(bill.customer_id),
                service_id: String(bill.service_id),
                month: String(bill.month),
                year: String(bill.year),
                measurement_number: bill.measurement_number,
                usage_value: String(bill.usage_value),
            })
        } else {
            setForm(EMPTY)
        }
    }, [bill, open])

    const set = (key: keyof typeof EMPTY) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm(f => ({ ...f, [key]: e.target.value }))

    const setSelect = (key: keyof typeof EMPTY) => (v: string) =>
        setForm(f => ({ ...f, [key]: v }))

    const isValid = isEdit
        ? form.usage_value !== "" && Number(form.usage_value) > 0
        : form.customer_id !== "" && form.service_id !== "" &&
          form.month !== "" && form.year !== "" &&
          form.measurement_number.trim() !== "" &&
          form.usage_value !== "" && Number(form.usage_value) > 0

    const handleSubmit = async () => {
        if (!isValid) return
        setLoading(true)
        setError(null)
        try {
            if (isEdit) {
                const payload: UpdateBillPayload = {
                    usage_value: Number(form.usage_value),
                    measurement_number: form.measurement_number || undefined,
                }
                await api.patch(`/bills/${bill!.id}`, payload)
            } else {
                const payload: CreateBillPayload = {
                    customer_id: Number(form.customer_id),
                    service_id: Number(form.service_id),
                    month: Number(form.month),
                    year: Number(form.year),
                    measurement_number: form.measurement_number.trim(),
                    usage_value: Number(form.usage_value),
                }
                await api.post("/bills", payload)
            }
            setSuccess(true)
            setTimeout(() => { onSuccess(); onClose() }, 800)
        } catch (err: unknown) {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (isEdit ? "Failed to update bill." : "Failed to create bill.")
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
                        <defs><pattern id="dots-bill" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="white" />
                        </pattern></defs>
                        <rect width="100%" height="100%" fill="url(#dots-bill)" />
                    </svg>
                </div>

                <div className="flex justify-center -mt-7 relative z-10">
                    <div className="h-14 w-14 rounded-full border-4 border-background shadow-lg ring-2 ring-emerald-500/20 bg-emerald-500 flex items-center justify-center">
                        <FileText size={22} className="text-white" />
                    </div>
                </div>

                <div className="px-6 pt-3 pb-6 space-y-4">
                    <DialogHeader className="text-center space-y-0.5">
                        <DialogTitle className="text-base font-bold">
                            {isEdit ? "Edit Bill" : "Create Bill"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {isEdit ? "Update bill usage information" : "Fill in details for the new bill"}
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {error && <Feedback key="err" msg={error} type="error" />}
                        {success && <Feedback key="ok" msg={isEdit ? "Bill updated!" : "Bill created!"} type="success" />}
                    </AnimatePresence>

                    <div className="space-y-3">
                        {/* Customer — hanya create */}
                        {!isEdit && (
                            <SelectField
                                label="Customer" Icon={User}
                                value={form.customer_id}
                                onValueChange={setSelect("customer_id")}
                                placeholder="Select customer"
                                disabled={loading}
                            >
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name} <span className="text-muted-foreground text-xs">({c.customer_number})</span>
                                    </SelectItem>
                                ))}
                            </SelectField>
                        )}

                        {/* Service — hanya create */}
                        {!isEdit && (
                            <SelectField
                                label="Service" Icon={Layers}
                                value={form.service_id}
                                onValueChange={setSelect("service_id")}
                                placeholder="Select service"
                                disabled={loading}
                            >
                                {services.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                ))}
                            </SelectField>
                        )}

                        {/* Month & Year — hanya create */}
                        {!isEdit && (
                            <div className="grid grid-cols-2 gap-3">
                                <SelectField
                                    label="Month" Icon={CalendarDays}
                                    value={form.month}
                                    onValueChange={setSelect("month")}
                                    placeholder="Month"
                                    disabled={loading}
                                >
                                    {MONTH_NAMES.map((m, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                                    ))}
                                </SelectField>
                                <SelectField
                                    label="Year" Icon={CalendarDays}
                                    value={form.year}
                                    onValueChange={setSelect("year")}
                                    placeholder="Year"
                                    disabled={loading}
                                >
                                    {YEARS.map(y => (
                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                    ))}
                                </SelectField>
                            </div>
                        )}

                        {/* Measurement Number */}
                        <FieldInput
                            id="b-meter" label="Measurement Number" Icon={Hash} type="text"
                            placeholder="e.g. 30041"
                            value={form.measurement_number} onChange={set("measurement_number")} disabled={loading}
                        />

                        {/* Usage Value */}
                        <FieldInput
                            id="b-usage" label="Usage Value (m³)" Icon={Droplets} type="number"
                            placeholder="e.g. 20"
                            value={form.usage_value} onChange={set("usage_value")} disabled={loading}
                        />

                        {/* Live total preview */}
                        {estimatedTotal !== null && (
                            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                                    <Calculator size={15} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600/70">
                                        Estimated Total
                                    </p>
                                    <p className="text-sm font-bold text-emerald-700">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency", currency: "IDR", maximumFractionDigits: 0,
                                        }).format(estimatedTotal)}
                                    </p>
                                </div>
                                <p className="text-[10px] text-emerald-600/60 shrink-0 text-right">
                                    {usageNum} m³ ×{" "}
                                    {new Intl.NumberFormat("id-ID", {
                                        style: "currency", currency: "IDR", maximumFractionDigits: 0,
                                    }).format(activeService!.price)}
                                </p>
                            </div>
                        )}
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
                                    : isEdit ? "Save changes" : "Create bill"}
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

function SelectField({ label, Icon, value, onValueChange, placeholder, disabled, children }: {
    label: string; Icon: React.ElementType
    value: string; onValueChange: (v: string) => void
    placeholder: string; disabled: boolean
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Icon size={11} />{label}
            </Label>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>{children}</SelectContent>
            </Select>
        </div>
    )
}
