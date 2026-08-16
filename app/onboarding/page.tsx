'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, MapPin, Briefcase, GraduationCap, 
  ArrowRight, ArrowLeft, Check 
} from 'lucide-react';

const RELATIONSHIP_GOALS = [
  'Long-term',
  'Short-term',
  'Friendship',
  'Marriage',
  'Not Sure'
];

const INTERESTS_LIST = [
  'Travel', 'Music', 'Architecture', 'Literature', 'Film Photography', 
  'Fine Dining', 'Podcasts', 'Hiking', 'Art & Galleries', 'Specialty Coffee',
  'Yoga', 'Classical Piano', 'Technology', 'Fitness', 'Cinema'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [city, setCity] = useState(profile?.location?.city || 'New Delhi');
  const [bio, setBio] = useState(profile?.bio || '');
  const [occupation, setOccupation] = useState(profile?.job || '');
  const [education, setEducation] = useState(profile?.school || '');
  const [relationshipGoal, setRelationshipGoal] = useState<string>('Long-term');
  const [interests, setInterests] = useState<string[]>(['Specialty Coffee', 'Travel', 'Architecture']);

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) setInterests(interests.filter((i) => i !== item));
    else if (interests.length < 8) setInterests([...interests, item]);
  };

  const handleFinish = () => {
    setIsLoading(true);
    updateProfile({
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
        city,
      },
      bio,
      job: occupation,
      school: education,
      relationshipGoal: relationshipGoal as any,
      passions: interests,
    });
    setTimeout(() => {
      setIsLoading(false);
      router.push('/discover');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-ivory-100">
      <div className="w-full max-w-xl bg-surface-card border border-clay rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-plum-700">Elance Profile Setup</span>
            <h1 className="text-2xl font-serif font-bold text-charcoal-900 mt-0.5">
              {step === 1 && 'Where are you based & what do you do?'}
              {step === 2 && 'What are your relationship goals?'}
              {step === 3 && 'Curate your passions & interests'}
            </h1>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-7 bg-plum-700' : s < step ? 'w-3 bg-plum-400' : 'w-3 bg-clay'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: City, Occupation, Bio */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-charcoal-700 font-semibold">City</label>
              <div className="relative mt-1">
                <MapPin className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                  className="w-full bg-ivory-50 border border-clay text-charcoal-900 text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-charcoal-700 font-semibold">Occupation</label>
                <div className="relative mt-1">
                  <Briefcase className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Architect, Software Engineer"
                    className="w-full bg-ivory-50 border border-clay text-charcoal-900 text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-charcoal-700 font-semibold">Education</label>
                <div className="relative mt-1">
                  <GraduationCap className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. Delhi University, IIT"
                    className="w-full bg-ivory-50 border border-clay text-charcoal-900 text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-plum-700 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-charcoal-700 font-semibold">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your authentic passions, quirks, and Sunday morning rituals..."
                className="w-full mt-1 bg-ivory-50 border border-clay text-charcoal-900 text-sm p-3 rounded-2xl focus:outline-none focus:border-plum-700 shadow-2xs"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!city}
            >
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Relationship Goals */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-charcoal-600">
              Clear relationship intent ensures you match with people seeking the same commitment level.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RELATIONSHIP_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setRelationshipGoal(goal)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    relationshipGoal === goal
                      ? 'bg-plum-50 border-plum-700 text-plum-900 font-bold shadow-xs'
                      : 'bg-ivory-50 border-clay text-charcoal-700 hover:border-plum-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{goal}</span>
                    {relationshipGoal === goal && <Check className="w-4 h-4 text-plum-700" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(3)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="space-y-5 pt-2">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-charcoal-900">Interests ({interests.length}/8)</label>
                <span className="text-[11px] text-charcoal-500">Pick up to 8</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_LIST.map((item) => {
                  const sel = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`text-xs px-3.5 py-1.5 rounded-full transition-all ${
                        sel
                          ? 'bg-plum-700 text-white font-medium shadow-xs'
                          : 'bg-ivory-50 text-charcoal-700 border border-clay hover:border-plum-300'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleFinish}
                isLoading={isLoading}
              >
                Complete Onboarding ✨
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
