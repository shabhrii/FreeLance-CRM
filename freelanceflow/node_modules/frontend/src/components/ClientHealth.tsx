import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Activity } from 'lucide-react'

export default function ClientHealth({ clientId }: { clientId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health', clientId],
    queryFn: () => fetchApi(`/ai/health/${clientId}`),
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  })

  if (isLoading) {
    return <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2 animate-pulse"><Activity size={12}/> Analyzing health...</div>
  }

  if (isError || !data) {
    return null
  }

  const scoreColor = data.healthScore > 75 ? 'text-green-600' : data.healthScore > 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="mt-2 pt-2 border-t text-xs">
      <div className="flex items-center gap-1 font-medium mb-1">
        <Activity size={12} className={scoreColor} />
        <span className={scoreColor}>Health Score: {data.healthScore}/100</span>
      </div>
      <p className="text-muted-foreground text-[11px] leading-tight">{data.summary}</p>
    </div>
  )
}
