export default function PricingPage() {
  const STRIPE_BUY_URL = 'https://buy.stripe.com/test_00wdRa7TubM98BF1yd3F600'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">크레딧 충전</h1>
        <p className="text-gray-500 text-sm">
          크레딧을 충전하고 AI 플래너를 계속 이용하세요
        </p>
      </div>

      {/* 크레딧 안내 */}
      <div className="flex items-center gap-2 mb-8 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
        <span className="text-amber-600 text-sm font-medium">💎 1회 AI 요청 = 10 크레딧 차감</span>
      </div>

      {/* 결제 카드 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8 w-full max-w-sm relative overflow-hidden">
        {/* 추천 배지 */}
        <div className="absolute top-0 right-0 bg-black text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
          추천
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">💎</span>
          <div>
            <p className="text-2xl font-bold text-gray-900">100 크레딧</p>
            <p className="text-sm text-gray-500">AI 요청 10회 분량</p>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">$9.99</span>
          <span className="text-gray-400 text-sm ml-1">/ 1회 결제</span>
        </div>

        <ul className="space-y-2 mb-8 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            AI 7단계 계획 생성 10회
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            계획 수정 및 질문 10회
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            만료 기간 없음
          </li>
        </ul>

        <a
          href={STRIPE_BUY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-black text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          결제하기
        </a>

        <p className="text-xs text-gray-400 text-center mt-3">
          Stripe 보안 결제 · 결제 후 자동으로 크레딧이 추가됩니다
        </p>
      </div>

      {/* 결제 후 안내 */}
      <div className="mt-8 text-center text-xs text-gray-400 max-w-sm">
        <p>결제 완료 후 크레딧이 즉시 반영되지 않으면</p>
        <p>잠시 후 페이지를 새로고침해 주세요.</p>
      </div>
    </div>
  )
}
