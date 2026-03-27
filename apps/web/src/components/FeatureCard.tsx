import type { LucideIcon } from "lucide-react"

type Feature = {
    title: string
    description: string
    icon: LucideIcon
}

export function FeatureCard({ title, description, icon }: Feature) {
    const Icon = icon
    return (
        <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
                <Icon size={20} className="text-[#3B82F6]" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-[#1E3A5F] mb-1">{title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{description}</p>
            </div>
        </div>)
}