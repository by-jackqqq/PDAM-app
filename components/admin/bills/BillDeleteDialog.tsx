"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { Bill, MONTH_NAMES } from "@/types/bill"
import { api } from "@/lib/api"
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader,
    AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface Props {
    bill: Bill | null
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function BillDeleteDialog({ bill, open, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!bill) return
        setLoading(true)
        try {
            await api.delete(`/bills/${bill.id}`)
            onSuccess()
            onClose()
        } catch {
            /* silent */
        } finally {
            setLoading(false)
        }
    }

    const label = bill
        ? `${bill.customer?.name ?? "—"} — ${MONTH_NAMES[(bill.month ?? 1) - 1]} ${bill.year}`
        : ""

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-sm rounded-2xl">
                <AlertDialogHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 mb-1">
                        <Trash2 size={18} className="text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-base">Delete Bill</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Are you sure you want to delete bill for{" "}
                        <span className="font-semibold text-foreground">{label}</span>?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel disabled={loading} className="flex-1">Cancel</AlertDialogCancel>
                    <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={loading}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
