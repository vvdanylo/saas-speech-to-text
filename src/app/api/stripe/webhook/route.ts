import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const requestHeaders = await headers();
  const signature = requestHeaders.get('stripe-signature') as string;

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Webhook verification failed: ${error}` },
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.client_reference_id;

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (user) {
        try {
          await prisma.payment.create({
            data: {
              userId: user.id,
              stripeSessionId: session.id,
              amount: session.amount_total! / 100,
              status: 'completed',
            },
          });
        } catch (error) {
          return NextResponse.json(
            { error: `Failed to save payment: ${error}` },
            { status: 500 },
          );
        }
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json(
        { error: 'No client_reference_id' },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      { error: `Unhandled event type: ${event.type}` },
      { status: 400 },
    );
  }

  return NextResponse.json({ received: true });
}
