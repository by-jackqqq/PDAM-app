type StatCardProps = {
    title: string
    value: string | number
    icon?: React.ReactNode
    subtitle?: string
    trend?: "up" | "down"
}

export default function StatCard({
    title,
    value,
    icon,
    subtitle,
    trend,
}: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">

                {/* Title */}
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    {icon || "📊"}
                </div>
            </div>

            {/* Value */}
            <h2 className="text-3xl font-bold text-slate-800">
                {value}
            </h2>

            {/* Subtitle / Trend */}
            {(subtitle || trend) && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    {trend === "up" && <span className="text-green-600">▲</span>}
                    {trend === "down" && <span className="text-red-600">▼</span>}
                    <span>{subtitle}</span>
                </div>
            )}
        </div>
    )
}
