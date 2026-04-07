"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { Customer, CreateCustomerPayload } from "@/types/customer"
import { CustomerService } from "@/types/customer"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
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
        if (open) fetchServices()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isEdit) {
                // PATCH /customers/:id — hanya field yang diisi
                const payload: Record<string, string> = {}
                if (form.name) payload.name = form.name
                if (form.phone) payload.phone = form.phone
                if (form.address) payload.address = form.address
                if (form.password) payload.password = form.password
                await api.patch(`/customers/${customer!.id}`, payload)
                toast.success("Customer updated successfully")
            } else {
                // POST /customers
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
                toast.success("Customer created successfully")
            }
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (isEdit ? "Failed to update customer" : "Failed to create customer")
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="c-name">Full Name</Label>
                        <Input
                            id="c-name"
                            placeholder="Customer Full Name"
                            value={form.name}
                            onChange={set("name")}
                            required
                        />
                    </div>

                    {/* Username — hanya create */}
                    {!isEdit && (
                        <div className="space-y-1.5">
                            <Label htmlFor="c-username">Username</Label>
                            <Input
                                id="c-username"
                                placeholder="username"
                                value={form.username}
                                onChange={set("username")}
                                required
                            />
                        </div>
                    )}

                    {/* NIK — hanya create */}
                    {!isEdit && (
                        <div className="space-y-1.5">
                            <Label htmlFor="c-nik">NIK (Customer Number)</Label>
                            <Input
                                id="c-nik"
                                placeholder="16-digit NIK"
                                value={form.customer_number}
                                onChange={set("customer_number")}
                                required
                            />
                        </div>
                    )}

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="c-phone">Phone</Label>
                        <Input
                            id="c-phone"
                            placeholder="08xxxxxxxxxx"
                            value={form.phone}
                            onChange={set("phone")}
                            required={!isEdit}
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <Label htmlFor="c-address">Address</Label>
                        <Input
                            id="c-address"
                            placeholder="Full address"
                            value={form.address}
                            onChange={set("address")}
                            required={!isEdit}
                        />
                    </div>

                    {/* Service — hanya create */}
                    {!isEdit && (
                        <div className="space-y-1.5">
                            <Label>Service</Label>
                            <Select
                                value={form.service_id}
                                onValueChange={(v) => setForm((f) => ({ ...f, service_id: v }))}
                                required
                            >
                                <SelectTrigger>
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
                        <Label htmlFor="c-password">
                            Password
                            {isEdit && (
                                <span className="text-muted-foreground text-xs ml-1">
                                    (leave blank to keep current)
                                </span>
                            )}
                        </Label>
                        <Input
                            id="c-password"
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
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Customer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}