"use client"

import Image from "next/image"
import { Eye, Download, FileText} from "lucide-react"
import { Payment } from "@/types/payment"
import { MONTH_NAMES } from "@/types/bill"
import { BASE_PAYMENT_PROOF } from "@/global"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

interface ProofDialogProps {
    open: boolean
    onClose: () => void
    payment: Payment | null
}

function proofUrl(proof_file: string): string {
    if (proof_file.startsWith("http")) return proof_file
    return `${BASE_PAYMENT_PROOF}/${proof_file}`
}

export function ProofDialog({ open, onClose, payment }: ProofDialogProps) {
    const proof = payment?.payment_proof

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
                <div className="relative h-16 bg-linear-to-r from-blue-600 to-blue-500 flex items-end px-5 pb-0">
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} 
                    />
                </div>
                
                <div className="flex justify-center -mt-6 z-10 relative">
                    <div className="w-12 h-12 rounded-full bg-blue-600 border-4 border-background flex items-center justify-center shadow-lg">
                        <Eye size={18} className="text-white" />
                    </div>
                </div>

                <div className="px-6 pb-6 pt-3 space-y-3">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-base font-bold">Bukti Pembayaran</DialogTitle>
                        <DialogDescription className="text-xs">
                            Bulan {payment?.bill ? MONTH_NAMES[(payment.bill.month ?? 1) - 1] : ""} {payment?.bill?.year}
                        </DialogDescription>
                    </DialogHeader>

                    {proof ? (
                        <div className="space-y-4">
                            <div className="rounded-xl overflow-hidden border border-border bg-muted/30 relative aspect-4/3">
                                <Image
                                    src={proofUrl(proof)}
                                    alt="Bukti Pembayaran"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 h-9" onClick={onClose}>
                                    Tutup
                                </Button>
                                <a 
                                    href={proofUrl(proof)} 
                                    download="bukti-pembayaran" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex-1 block"
                                >
                                    <Button className="w-full h-9 bg-blue-600 hover:bg-blue-700 gap-1.5 shadow-sm text-xs font-medium text-white">
                                        <Download size={14} /> Download Bukti
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                            <FileText size={32} className="opacity-20" />
                            <p className="text-sm">Belum ada bukti pembayaran</p>
                            <Button variant="outline" className="w-full h-9 mt-4" onClick={onClose}>
                                Tutup
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}