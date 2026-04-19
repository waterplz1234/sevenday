import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: '서명이 없습니다.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[Stripe Webhook] 서명 검증 실패:', err)
    return Response.json({ error: '웹훅 서명 검증 실패' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const customerEmail = session.customer_details?.email
    if (!customerEmail) {
      console.error('[Stripe Webhook] 이메일 없음')
      return Response.json({ error: '이메일 없음' }, { status: 400 })
    }

    const admin = createAdminClient()

    // 이메일로 유저 조회
    const { data: users, error: userError } = await admin.auth.admin.listUsers()
    if (userError) {
      console.error('[Stripe Webhook] 유저 조회 실패:', userError)
      return Response.json({ error: '유저 조회 실패' }, { status: 500 })
    }

    const user = users.users.find((u) => u.email === customerEmail)
    if (!user) {
      console.error('[Stripe Webhook] 유저를 찾을 수 없음:', customerEmail)
      return Response.json({ error: '유저를 찾을 수 없음' }, { status: 404 })
    }

    // 현재 크레딧 조회
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Stripe Webhook] 프로필 조회 실패:', profileError)
      return Response.json({ error: '프로필 조회 실패' }, { status: 500 })
    }

    // 크레딧 100 추가
    const { error: updateError } = await admin
      .from('profiles')
      .update({ credits: profile.credits + 100 })
      .eq('id', user.id)

    if (updateError) {
      console.error('[Stripe Webhook] 크레딧 업데이트 실패:', updateError)
      return Response.json({ error: '크레딧 업데이트 실패' }, { status: 500 })
    }

    console.log(`[Stripe Webhook] ${customerEmail} 크레딧 +100 완료 (잔액: ${profile.credits + 100})`)
  }

  return Response.json({ received: true })
}
