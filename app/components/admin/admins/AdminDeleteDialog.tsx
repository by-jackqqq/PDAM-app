"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Admin } from "@/types/admin"
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
    admin: Admin | null
    onClose: () => void
    onSuccess: () => void
}

export default function AdminDeleteDialog({ open, admin, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!admin) return
        setLoading(true)
        try {
            await api.delete(`/admins/${admin.id}`)
            toast.success(`Admin "${admin.name}" deleted`)
            onSuccess()
            onClose()
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Failed to delete admin"
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">{admin?.name}</span>?
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