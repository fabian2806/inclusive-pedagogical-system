export function StatusBadge({ 
  active, 
  inactive 
}: { 
  active: number
  inactive: number 
}) {
  return (
    <>
      <span className="flex items-center gap-1 text-[#059669]">
        <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
        {active} activos
      </span>
      <span className="flex items-center gap-1 text-[#6B7280]">
        <span className="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
        {inactive} inactivos
      </span>
    </>
  )
}