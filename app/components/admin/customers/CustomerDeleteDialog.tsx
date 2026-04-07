"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Customer } from "@/types/customer"
import { toast } from "react-toastify"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

interface Props {
    open: boolean
    customer: Customer | null
    onClose: () => void
    onSuccess: () => void
}

export default function CustomerDeleteDialog({ open, customer, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!customer) return
        setLoading(true)
        try {
            await api.delete(`/customers/${customer.id}`)
            toast.success(`Customer "${customer.name}" deleted`)
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Failed to delete customer"
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">{customer?.name}</span>?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? "Deleting…" : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}