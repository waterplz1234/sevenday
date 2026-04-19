import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `당신은 목표 달성 전문 코치입니다.
사용자의 목표를 분석하고 실행 가능한 7단계 계획을 JSON 형식으로 반환하세요.

반드시 아래 JSON 구조만 반환하세요. 마크다운 코드블록 없이 순수 JSON만:
{
  "goal": "사용자 목표 요약",
  "steps": [
    {
      "step": 1,
      "title": "단계 제목 (간결하게)",
      "description": "이 단계에서 해야 할 일과 목적을 2~3문장으로 설명",
      "tasks": ["구체적 할 일 1", "구체적 할 일 2", "구체적 할 일 3"],
      "duration": "예상 소요 기간 (예: 1주일, 2~3일)",
      "tip": "이 단계를 잘 수행하기 위한 핵심 팁"
    }
  ]
}`

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

async function checkAndDeductCredits(userId: string): Promise<{ ok: boolean; credits?: number; error?: string }> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error) return { ok: false, error: '크레딧 조회 실패' }
  if (data.credits < 10) return { ok: false, error: '크레딧이 부족합니다.' }

  const { data: updated, error: updateError } = await admin
    .from('profiles')
    .update({ credits: data.credits - 10 })
    .eq('id', userId)
    .select('credits')
    .single()

  if (updateError) return { ok: false, error: '크레딧 차감 실패' }

  return { ok: true, credits: updated.credits }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 크레딧 확인 및 차감
    const creditResult = await checkAndDeductCredits(user.id)
    if (!creditResult.ok) {
      return Response.json(
        { error: creditResult.error },
        { status: creditResult.error === '크레딧이 부족합니다.' ? 402 : 500 }
      )
    }

    const { goal, message, steps } = await request.json()

    // 계획 수정/질문 모드
    if (message && steps) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `현재 7단계 계획:\n${JSON.stringify(steps, null, 2)}\n\n사용자 요청: ${message}\n\n위 계획을 사용자 요청에 맞게 수정하여 동일한 JSON 형식으로 반환하세요.`,
          },
        ],
        temperature: 0.7,
      })

      const content = completion.choices[0].message.content ?? ''
      const parsed = JSON.parse(content)
      return Response.json({ ...parsed, credits: creditResult.credits })
    }

    // 최초 계획 생성 모드
    if (!goal) {
      return Response.json({ error: '목표를 입력해주세요.' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `목표: ${goal}` },
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0].message.content ?? ''
    const parsed = JSON.parse(content)
    return Response.json({ ...parsed, credits: creditResult.credits })
  } catch (err) {
    console.error('[AI Route Error]', err)
    return Response.json({ error: 'AI 응답 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
