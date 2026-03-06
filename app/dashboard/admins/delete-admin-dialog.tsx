"use client"

import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function DeleteAdminDialog({ admin, onClose, onDeleted }: any) {

    const handleDelete = async () => {

        await api.delete(`/admins/${admin.id}`)

        onDeleted()
        onClose()
    }

    return (

        <Dialog open onOpenChange={onClose}>

            <DialogContent>

                <DialogHeader>
                    <DialogTitle>
                        Delete Admin
                    </DialogTitle>
                </DialogHeader>

                <p>
                    Are you sure want to delete <b>{admin.name}</b>?
                </p>

                <div className="flex justify-end gap-2">

                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>

                </div>

            </DialogContent>

        </Dialog>

    )
}