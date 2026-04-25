'use client'

interface PlanCardProps {
  step: any
  stepNumber: number
}

export default function PlanCard({ step, stepNumber }: PlanCardProps) {
  if (!step) return null

  return (
    <div className="w-full max-w-2xl bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full">
          Step {stepNumber}
        </span>
        <h2 className="text-lg font-bold">{step.title}</h2>
      </div>
      <p className="text-gray-600 mb-4">{step.description}</p>
      {step.tasks && (
        <ul className="space-y-2">
          {step.tasks.map((task: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1 w-4 h-4 border rounded flex-shrink-0" />
              {task}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
