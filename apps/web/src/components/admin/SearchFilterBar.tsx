import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface SearchFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  filterOptions: {
    label: string
    value: string
    selectItem: string
    options: string[]
  }[]
  filterValues: Record<string, string>
  onFilterChange: (filterName: string, value: string) => void
}

export function SearchFilterBar({
  search, onSearchChange, filterOptions, filterValues, onFilterChange
}: SearchFilterBarProps){
    return (
        <Card className="border-[#E5E7EB]">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Barra de búsqueda */}
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <Input
                            placeholder="Buscar por nombre o docente..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 border-[#E5E7EB]"
                        />
                    </div>
                    {/* Filtros dinámicos (le pasamos un array de filtros) */}
                    {filterOptions.map((filter) => (
                        <Select
                        key={filter.label}
                        value={filterValues[filter.value] || "all"}
                        onValueChange={(value) => onFilterChange(filter.value, value)}
                        >
                        <SelectTrigger className="w-full sm:w-44 border-[#E5E7EB]">
                            <SelectValue placeholder={filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{filter.selectItem}</SelectItem>
                            {filter.options.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}