import CustomerSidebar from "@/components/customer/CustomerSidebar"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background">
            <CustomerSidebar />
            <main className="flex-1 overflow-auto px-6 py-6">
                {children}
            </main>
        </div>
    )
}
