'use client'

import { useState } from 'react'
import GoalInput from '@/components/planner/GoalInput'
import PlanCard from '@/components/planner/PlanCard'
import ChatInput from '@/components/planner/ChatInput'
import CreditDisplay from '@/components/planner/CreditDisplay'
import { useRouter } from 'next/navigation'

export default function DashboardClient() {
  const [steps, setSteps] = useState<any[]>([])
  const [selectedStep, setSelectedStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoal = async (goal: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      })
      const data = await res.json()
      if (data.steps) setSteps(data.steps)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleChat = async (message: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, steps })
      })
      const data = await res.json()
      if (data.steps) setSteps(data.steps)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b">
        <h1 className="text-xl font-bold">SevenDay</h1>
        <CreditDisplay onCharge={() => router.push('/pricing')} />
      </header>

      <div className="flex flex-1">
        {steps.length > 0 && (
          <aside className="w-48 border-r p-4 flex flex-col gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedStep(i)}
                className={`text-left px-3 py-2 rounded text-sm ${selectedStep === i ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                Step {i + 1}
              </button>
            ))}
          </aside>
        )}

        <main className="flex-1 flex flex-col items-center justify-center p-6">
          {steps.length === 0 ? (
            <GoalInput onSubmit={handleGoal} loading={loading} />
          ) : (
            <PlanCard step={steps[selectedStep]} stepNumber={selectedStep + 1} />
          )}
        </main>
      </div>

      {steps.length > 0 && (
        <ChatInput onSubmit={handleChat} loading={loading} />
      )}
    </div>
  )
}
