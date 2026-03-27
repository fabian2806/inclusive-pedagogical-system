type Metric = {
    icon: any
    value: string
    label: string
    sub: string
}

export function MetricCard({ icon: Icon, value, label, sub }: Metric) {
    return (
        <div className="flex flex-col items-center text-center gap-2">
            <div className="flex items-center gap-2 mb-1">
                <Icon size={20} className="text-[#93C5FD]" />
                <span className="text-3xl font-extrabold text-white">{value}</span>
            </div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-[#93C5FD]">{sub}</p>
        </div>
    )
}