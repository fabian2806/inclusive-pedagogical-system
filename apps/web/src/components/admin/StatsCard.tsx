import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type CardColor = 'yellow' | 'blue' | 'purple' | 'green'

interface StatsCardProps {
  icon: LucideIcon
  title: string
  value: number | string
  color: CardColor
  subtitle?: string | React.ReactNode
}

const colorConfig: Record<CardColor, {
  bg: string
  icon: string
  border: string
}> = {
  yellow: {
    bg: 'bg-[#FEF3C7]',
    icon: 'text-[#D97706]',
    border: 'border-[#FDE68A]'
  },
  blue: {
    bg: 'bg-[#EEF2FF]',
    icon: 'text-[#3B82F6]',
    border: 'border-[#DBEAFE]'
  },
  purple: {
    bg: 'bg-[#F3E8FF]',
    icon: 'text-[#8B5CF6]',
    border: 'border-[#E9D5FF]'
  },
  green: {
    bg: 'bg-[#ECFDF5]',
    icon: 'text-[#059669]',
    border: 'border-[#D1FAE5]'
  }
}

export function StatsCard({ icon: Icon, title, value, color, subtitle }: StatsCardProps) {
  const colors = colorConfig[color]

  return (
    <Card className="border-[#E5E7EB]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${colors.bg}`}>
            <Icon size={20} className={colors.icon} />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E3A5F]">{value}</p>
            <p className="text-xs text-[#6B7280]">{title}</p>
          </div>
        </div>
        {subtitle && (
          <div className="mt-3 flex gap-3 text-xs">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  )
}