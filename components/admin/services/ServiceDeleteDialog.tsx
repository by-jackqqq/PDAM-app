"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { Service } from "@/types/service"
import { api } from "@/lib/api"
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader,
    AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface Props {
    service: Service | null
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ServiceDeleteDialog({ service, open, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!service) return
        setLoading(true)
        try {
            await api.delete(`/services/${service.id}`)
            onSuccess()
            onClose()
        } catch {
            /* error handling optional */
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-sm rounded-2xl">
                <AlertDialogHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 mb-1">
                        <Trash2 size={18} className="text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-base">Delete Service</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">{service?.name}</span>?
                        This may affect customers assigned to this service.
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
