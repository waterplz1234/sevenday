import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const INITIAL_CREDITS = 50
const COST_PER_REQUEST = 10

// 서비스 롤 클라이언트 (RLS 우회, 크레딧 차감용)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 요청 쿠키로 현재 로그인 유저 가져오기
async function getUser(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
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

// GET /api/credits - 현재 크레딧 조회
export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  // 프로필이 없으면 기본 크레딧으로 생성
  if (error?.code === 'PGRST116') {
    const { data: newProfile, error: insertError } = await admin
      .from('profiles')
      .insert({ id: user.id, credits: INITIAL_CREDITS })
      .select('credits')
      .single()

    if (insertError) {
      return Response.json({ error: '크레딧 조회 실패' }, { status: 500 })
    }
    return Response.json({ credits: newProfile.credits })
  }

  if (error) {
    return Response.json({ error: '크레딧 조회 실패' }, { status: 500 })
  }

  return Response.json({ credits: data.credits })
}

// POST /api/credits - 크레딧 차감
export async function POST(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const admin = createAdminClient()

  // 현재 크레딧 조회
  const { data, error } = await admin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (error) {
    return Response.json({ error: '크레딧 조회 실패' }, { status: 500 })
  }

  if (data.credits < COST_PER_REQUEST) {
    return Response.json(
      { error: '크레딧이 부족합니다.', credits: data.credits },
      { status: 402 }
    )
  }

  // 크레딧 차감
  const { data: updated, error: updateError } = await admin
    .from('profiles')
    .update({ credits: data.credits - COST_PER_REQUEST })
    .eq('id', user.id)
    .select('credits')
    .single()

  if (updateError) {
    return Response.json({ error: '크레딧 차감 실패' }, { status: 500 })
  }

  return Response.json({ credits: updated.credits })
}
