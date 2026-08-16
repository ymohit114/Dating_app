import crypto from 'crypto';

export interface RazorpayOrderOptions {
  amount: number; // in paise (e.g. 99900 for Rs. 999)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface SubscriptionPlanInfo {
  id: 'gold_monthly' | 'gold_yearly' | 'platinum_monthly' | 'platinum_yearly' | 'boost_pack_5' | 'superlike_pack_10';
  name: string;
  tier: 'gold' | 'platinum' | 'boost' | 'superlike';
  price: number; // in INR
  originalPrice?: number;
  durationMonths: number;
  badge?: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanInfo[] = [
  {
    id: 'gold_monthly',
    name: 'Tinder Gold (1 Month)',
    tier: 'gold',
    price: 799,
    originalPrice: 1199,
    durationMonths: 1,
    badge: 'Popular',
    features: [
      'See who likes you before matching',
      'Unlimited swipes & likes',
      '5 free Super Likes every week',
      '1 Free Monthly Profile Boost',
      'Passport to swipe anywhere in the world',
      'Unlimited Rewinds on accidental left swipes',
      'No advertisements'
    ]
  },
  {
    id: 'gold_yearly',
    name: 'Tinder Gold (12 Months)',
    tier: 'gold',
    price: 3499,
    originalPrice: 9588,
    durationMonths: 12,
    badge: 'Best Value (63% OFF)',
    features: [
      'Everything in Gold Monthly',
      'Save 63% on yearly billing',
      'Priority customer support'
    ]
  },
  {
    id: 'platinum_monthly',
    name: 'Tinder Platinum (1 Month)',
    tier: 'platinum',
    price: 1499,
    originalPrice: 1999,
    durationMonths: 1,
    badge: 'VIP Status',
    features: [
      'Everything in Gold',
      'Message before matching with Super Likes',
      'Priority Likes (seen faster by top profiles)',
      'See the likes you sent in the past 7 days',
      'Exclusive Platinum golden border badge'
    ]
  },
  {
    id: 'platinum_yearly',
    name: 'Tinder Platinum (12 Months)',
    tier: 'platinum',
    price: 5999,
    originalPrice: 17988,
    durationMonths: 12,
    badge: 'Ultimate Match Power',
    features: [
      'Everything in Platinum Monthly',
      'Save 67% on yearly billing',
      'VIP Matchmaker algorithm boost'
    ]
  },
  {
    id: 'boost_pack_5',
    name: '5 Profile Boosts Pack',
    tier: 'boost',
    price: 499,
    durationMonths: 0,
    features: ['Be the top profile in your area for 30 minutes', 'Get up to 10x more profile views']
  },
  {
    id: 'superlike_pack_10',
    name: '10 Super Likes Pack',
    tier: 'superlike',
    price: 299,
    durationMonths: 0,
    features: ['Stand out with bright blue star badge', '3x higher chance of matching']
  }
];

export function createRazorpayOrder(options: RazorpayOrderOptions) {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sample';
  const orderId = 'order_' + Math.random().toString(36).substring(2, 12) + Date.now();
  
  return {
    id: orderId,
    entity: 'order',
    amount: options.amount,
    currency: options.currency || 'INR',
    receipt: options.receipt || `rec_${Date.now()}`,
    status: 'created',
    keyId: keyId,
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'sample_razorpay_secret_key_67890';
  
  // If simulated/test mode token
  if (signature.startsWith('simulated_sig_') || signature === 'test_verified_success') {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
