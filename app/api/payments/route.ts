import { NextResponse } from 'next/server';
import { extractAuthUser } from '@/lib/auth';
import { createRazorpayOrder, verifyRazorpaySignature, SUBSCRIPTION_PLANS } from '@/lib/razorpay';
import connectToDatabase from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { INITIAL_CURRENT_USER } from '@/utils/seedData';

export async function POST(req: Request) {
  try {
    const authUser = extractAuthUser(req);
    const userId = authUser?.userId || INITIAL_CURRENT_USER._id;
    const body = await req.json();
    const { action, planId, orderId, paymentId, signature } = body;

    // Action: Create Order
    if (action === 'create_order') {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
      }

      const order = createRazorpayOrder({
        amount: plan.price * 100, // amount in paise
        currency: 'INR',
        receipt: `sub_${userId.substring(0, 8)}_${Date.now()}`,
      });

      return NextResponse.json({ order, plan });
    }

    // Action: Verify Payment & Activate Tier
    if (action === 'verify_payment') {
      const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }

      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      const tier = plan?.tier === 'platinum' ? 'platinum' : 'gold';
      const months = plan?.durationMonths || 1;
      const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);

      const conn = await connectToDatabase();
      if (conn) {
        await Subscription.findOneAndUpdate(
          { userId },
          {
            userId,
            plan: tier,
            status: 'active',
            startDate: new Date(),
            expiresAt,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            features: {
              unlimitedLikes: true,
              seeWhoLikesYou: true,
              superLikesPerDay: tier === 'platinum' ? 10 : 5,
              boostsPerMonth: tier === 'platinum' ? 2 : 1,
              rewinds: true,
              passport: true,
              noAds: true,
            },
          },
          { upsert: true, new: true }
        );
      }

      return NextResponse.json({
        success: true,
        plan: tier,
        expiresAt: expiresAt.toISOString(),
        message: `Successfully upgraded to ${tier.toUpperCase()}! Enjoy all premium benefits.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
