'use client'

import { useState } from 'react'
import GoalInput from '@/components/planner/GoalInput'
import PlanCard from '@/components/planner/PlanCard'
import ChatInput from '@/components/planner/ChatInput'

interface Step {
  step: number
  title: string
  description: string
  tasks: string[]
  duration: string
  tip: string
}

interface Plan {
  goal: string
  steps: Step[]
}

export default function DashboardPage() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [selectedStep, setSelectedStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generatePlan(goal: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan(data)
      setSelectedStep(1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleChat(message: string) {
    if (!plan) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, steps: plan.steps }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPlan(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = plan?.steps.find((s) => s.step === selectedStep)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold text-gray-900">SevenDay</h1>
        {plan && (
          <button
            onClick={() => { setPlan(null); setError('') }}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            새 목표 입력
          </button>
        )}
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-sm text-red-600 shrink-0">
          {error}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-hidden">
        {!plan ? (
          /* 목표 입력 화면 */
          <div className="h-full">
            <GoalInput onSubmit={generatePlan} loading={loading} />
          </div>
        ) : (
          /* 계획 화면: 좌측 스텝 목록 + 중앙 카드 */
          <div className="flex h-full">
            {/* 좌측 스텝 사이드바 */}
            <aside className="w-56 bg-white border-r border-gray-200 overflow-y-auto shrink-0 py-4 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-3">
                7단계 계획
              </p>
              <p className="text-xs text-gray-500 px-2 mb-4 leading-relaxed line-clamp-3">
                {plan.goal}
              </p>
              <nav className="space-y-1">
                {plan.steps.map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setSelectedStep(s.step)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors ${
                      selectedStep === s.step
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`text-xs font-medium block ${selectedStep === s.step ? 'text-gray-300' : 'text-gray-400'}`}>
                      Step {s.step}
                    </span>
                    <span className="text-sm font-medium leading-snug">{s.title}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* 중앙 카드 */}
            <section className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">AI가 계획을 수정하고 있습니다...</p>
                  </div>
                </div>
              ) : currentStep ? (
                <div className="max-w-2xl mx-auto h-full">
                  <PlanCard step={currentStep} />
                </div>
              ) : null}
            </section>
          </div>
        )}
      </main>

      {/* 하단 채팅 입력 */}
      <div className="shrink-0">
        <ChatInput
          onSend={handleChat}
          loading={loading}
          disabled={!plan}
        />
      </div>
    </div>
  )
}
