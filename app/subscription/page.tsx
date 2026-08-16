'use client';

import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS, SubscriptionPlanInfo } from '@/lib/razorpay';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrencyINR } from '@/utils/formatters';
import { Sparkles, Check, Crown, Zap, Star, Shield, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function SubscriptionPage() {
  const { subscriptionTier, setSubscriptionTier } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('gold_monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const plans = SUBSCRIPTION_PLANS.filter((p) => p.durationMonths > 0);
  const addOns = SUBSCRIPTION_PLANS.filter((p) => p.durationMonths === 0);

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId);

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    try {
      // 1. Call create order API
      const orderRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_order',
          planId: selectedPlan.id,
        }),
      });
      const orderData = await orderRes.json();

      // 2. Simulate Razorpay Checkout flow
      setTimeout(async () => {
        const verifyRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify_payment',
            planId: selectedPlan.id,
            orderId: orderData.order?.id || `ord_${Date.now()}`,
            paymentId: `pay_${Date.now()}`,
            signature: 'test_verified_success',
          }),
        });
        const verifyData = await verifyRes.json();

        setIsProcessing(false);
        if (verifyData.success) {
          const tier = selectedPlan.tier === 'platinum' ? 'platinum' : 'gold';
          setSubscriptionTier(tier);
          setSuccessMessage(`🎉 ${verifyData.message}`);
          setTimeout(() => setSuccessMessage(''), 6000);
        }
      }, 1500);
    } catch (e) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Premium Match Experience
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Supercharge Your Dating Life
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
          See who already liked you, message before matching, get free monthly boosts, and unlock unlimited likes.
        </p>

        {subscriptionTier !== 'free' && (
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            Active Tier: {subscriptionTier.toUpperCase()} VIP Plan
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm text-center font-medium shadow-lg animate-in fade-in">
          {successMessage}
        </div>
      )}

      {/* Subscription Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isPlatinum = plan.tier === 'platinum';

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                isSelected
                  ? isPlatinum
                    ? 'bg-zinc-900 border-zinc-400 ring-2 ring-zinc-400 shadow-2xl scale-[1.02]'
                    : 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400 shadow-2xl scale-[1.02]'
                  : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-6 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md ${
                    isPlatinum ? 'bg-zinc-200 text-zinc-950' : 'bg-amber-400 text-zinc-950'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isPlatinum
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isPlatinum ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                      <span className="text-xs text-zinc-400">
                        {plan.durationMonths === 1 ? 'Billed Monthly' : 'Billed Annually'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {formatCurrencyINR(plan.price)}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-sm text-zinc-500 line-through">
                      {formatCurrencyINR(plan.originalPrice)}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">
                    /{plan.durationMonths === 1 ? 'mo' : 'yr'}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          isPlatinum ? 'text-zinc-300' : 'text-amber-400'
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={isPlatinum ? 'primary' : 'gold'}
                size="lg"
                className="w-full font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlanId(plan.id);
                  handleCheckout();
                }}
                isLoading={isProcessing && selectedPlanId === plan.id}
              >
                {subscriptionTier === plan.tier ? 'Current Plan' : `Upgrade to ${plan.name.split(' ')[1]}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Ala-Carte Boost & SuperLike Packs */}
      <div className="pt-4 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Power-Up Addon Packs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addOns.map((pack) => (
            <div
              key={pack.id}
              className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl flex items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{pack.name}</h4>
                <p className="text-xs text-zinc-400">{pack.features[0]}</p>
                <div className="text-base font-extrabold text-white mt-1">
                  {formatCurrencyINR(pack.price)}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedPlanId(pack.id);
                  handleCheckout();
                }}
                isLoading={isProcessing && selectedPlanId === pack.id}
              >
                Get Pack
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Razorpay Safe Checkout Assurance */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-center gap-3 text-xs text-zinc-400 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Secured by 256-bit encrypted Razorpay Checkout. Cancel anytime in settings.</span>
      </div>
    </div>
  );
}
