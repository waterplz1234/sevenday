'use client'

import { useEffect, useState } from 'react'

interface CreditDisplayProps {
  credits: number | null
  onCharge?: () => void
}

const LOW_CREDIT_THRESHOLD = 20

export default function CreditDisplay({ credits, onCharge }: CreditDisplayProps) {
  const [animate, setAnimate] = useState(false)

  // 크레딧 변경 시 애니메이션
  useEffect(() => {
    if (credits === null) return
    setAnimate(true)
    const timer = setTimeout(() => setAnimate(false), 600)
    return () => clearTimeout(timer)
  }, [credits])

  const isLow = credits !== null && credits < LOW_CREDIT_THRESHOLD
  const isEmpty = credits !== null && credits <= 0

  if (credits === null) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 text-sm">
        <span>💎</span>
        <span>--</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          isEmpty
            ? 'bg-red-100 text-red-600'
            : isLow
            ? 'bg-amber-100 text-amber-700'
            : 'bg-gray-100 text-gray-700'
        } ${animate ? 'scale-110' : 'scale-100'}`}
      >
        <span>💎</span>
        <span>{credits} 크레딧</span>
      </div>

      {isLow && onCharge && (
        <button
          onClick={onCharge}
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-black text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          {isEmpty ? '크레딧 없음 · 충전' : '충전하기'}
        </button>
      )}
    </div>
  )
}
