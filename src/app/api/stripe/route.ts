import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', {
      apiVersion: '2024-06-20' as any,
    })

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (event.type === 'checkout.session.completed') {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const session = event.data.object as any
      const email = session.customer_details?.email
      if (email) {
        const { data: user } = await supabase
          .from('profiles')
          .select('id, credits')
          .eq('email', email)
          .single()
        if (user) {
          await supabase
            .from('profiles')
            .update({ credits: (user.credits ?? 0) + 100 })
            .eq('id', user.id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
