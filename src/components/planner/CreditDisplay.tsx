'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function CreditDisplay({ onCharge }: { onCharge: () => void }) {
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (data) setCredits(data.credits)
    }
    fetchCredits()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <span>💎 {credits ?? '...'} 크레딧</span>
      {credits !== null && credits < 20 && (
        <button onClick={onCharge} className="text-sm bg-black text-white px-3 py-1 rounded">
          크레딧 충전
        </button>
      )}
    </div>
  )
}
