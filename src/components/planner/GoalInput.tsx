'use client'

import { useState } from 'react'

interface GoalInputProps {
  onSubmit: (goal: string) => void
  loading: boolean
}

export default function GoalInput({ onSubmit, loading }: GoalInputProps) {
  const [goal, setGoal] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal.trim()) return
    onSubmit(goal.trim())
  }

  const examples = [
    '3개월 안에 토익 900점 달성하기',
    '6개월 안에 풀스택 개발자로 취업하기',
    '1년 안에 10kg 감량하고 건강한 몸 만들기',
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">목표를 입력하세요</h2>
        <p className="text-gray-500 text-sm">AI가 7단계 실행 계획을 만들어드립니다</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="예: 6개월 안에 영어 회화 유창하게 하기"
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !goal.trim()}
            className="bg-black text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {loading ? '생성 중...' : '계획 만들기'}
          </button>
        </div>
      </form>

      <div className="w-full max-w-xl">
        <p className="text-xs text-gray-400 mb-2 text-center">예시 목표</p>
        <div className="flex flex-col gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setGoal(ex)}
              disabled={loading}
              className="text-left text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 transition-colors disabled:opacity-40"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
