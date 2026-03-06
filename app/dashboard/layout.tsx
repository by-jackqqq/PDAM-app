import Sidebar from "@/app/components/dashboard/Sidebar"
import Topbar from "@/app/components/dashboard/Topbar"

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-slate-50">

            <Sidebar />

            <main className="flex-1 flex flex-col">

                <Topbar />

                <div className="p-6 overflow-auto">
                    {children}
                </div>

            </main>

        </div>
    )
}