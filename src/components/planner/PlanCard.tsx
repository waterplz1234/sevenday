interface Step {
  step: number
  title: string
  description: string
  tasks: string[]
  duration: string
  tip: string
}

interface PlanCardProps {
  step: Step
}

export default function PlanCard({ step }: PlanCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col gap-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
          {step.step}
        </span>
        <div>
          <p className="text-xs text-gray-400 font-medium">Step {step.step}</p>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{step.title}</h3>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

      {/* 할 일 목록 */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">할 일</p>
        <ul className="space-y-2">
          {step.tasks.map((task, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0 text-xs text-gray-400 font-medium">
                {i + 1}
              </span>
              {task}
            </li>
          ))}
        </ul>
      </div>

      {/* 예상 기간 */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">예상 기간</span>
        <span className="text-sm font-medium text-black bg-gray-100 rounded-full px-3 py-0.5">
          {step.duration}
        </span>
      </div>

      {/* 팁 */}
      <div className="mt-auto bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">핵심 팁</p>
        <p className="text-sm text-amber-800 leading-relaxed">{step.tip}</p>
      </div>
    </div>
  )
}
