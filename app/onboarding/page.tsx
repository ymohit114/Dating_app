'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, MapPin, Briefcase, GraduationCap, 
  ArrowRight, ArrowLeft, Check, Camera, ImagePlus, 
  Trash2, User, AlertCircle 
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
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Mandatory Name & Photo
  const [name, setName] = useState(profile?.name || user?.email?.split('@')[0] || '');
  const [photos, setPhotos] = useState<string[]>(profile?.photos || []);

  // Step 2 & 3
  const [city, setCity] = useState(profile?.location?.city || 'New Delhi');
  const [bio, setBio] = useState(profile?.bio || '');
  const [occupation, setOccupation] = useState(profile?.job || '');
  const [education, setEducation] = useState(profile?.school || '');
  const [relationshipGoal, setRelationshipGoal] = useState<string>('Long-term');
  const [interests, setInterests] = useState<string[]>(profile?.passions || ['Specialty Coffee', 'Travel', 'Architecture']);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setPhotos((prev) => (prev.length < 6 ? [...prev, base64Url] : prev));
          setErrorMessage('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) setInterests(interests.filter((i) => i !== item));
    else if (interests.length < 8) setInterests([...interests, item]);
  };

  const handleStep1Next = () => {
    if (!name.trim()) {
      setErrorMessage('Full Name is mandatory. Please enter your name.');
      return;
    }
    if (photos.length === 0) {
      setErrorMessage('Profile Photo is mandatory. Please upload at least 1 photo from your gallery.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    await updateProfile({
      name: name.trim(),
      photos,
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
        city: city.trim(),
      },
      bio: bio.trim(),
      job: occupation.trim(),
      school: education.trim(),
      relationshipGoal: relationshipGoal as any,
      passions: interests,
    });
    setIsLoading(false);
    router.push('/discover');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-zinc-950 text-white">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Profile Setup</span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {step === 1 && '1. Name & Mandatory Photo'}
              {step === 2 && '2. Location, Career & Bio'}
              {step === 3 && '3. Intentions & Passions'}
            </h1>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-7 bg-rose-500' : s < step ? 'w-3 bg-rose-700' : 'w-3 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Mandatory Name & Photo Upload */}
        {step === 1 && (
          <div className="space-y-5 pt-2">
            <div>
              <label className="text-xs text-zinc-300 font-bold flex items-center justify-between mb-1">
                <span>Your Display Name <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-rose-400 font-bold uppercase">Required</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Mohit, Sudhir, Rohit)"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-zinc-300 font-bold">
                  Profile Photos <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-rose-400 font-bold">
                  At least 1 photo MANDATORY ({photos.length}/6)
                </span>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-3 gap-3">
                {photos.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-rose-500/50 bg-zinc-950 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        MAIN
                      </span>
                    )}
                  </div>
                ))}

                {photos.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-zinc-700 hover:border-rose-500 bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 hover:text-rose-400 transition-all cursor-pointer p-2 text-center"
                  >
                    <ImagePlus className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-bold">Upload from Gallery</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-rose-400" /> Choose Photos from Device / Gallery
                </button>
              </div>
            </div>

            <Button
              variant="gradient"
              size="lg"
              className="w-full mt-4"
              onClick={handleStep1Next}
            >
              Continue to Step 2 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: City, Occupation, Bio */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-zinc-300 font-semibold">City</label>
              <div className="relative mt-1">
                <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-300 font-semibold">Occupation / Work</label>
                <div className="relative mt-1">
                  <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer, Designer"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold">Education / College</label>
                <div className="relative mt-1">
                  <GraduationCap className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. Delhi University, IIT"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm pl-10 pr-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold">About You (Bio)</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your authentic passions, hobbies, and weekend rituals..."
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-white text-sm p-3 rounded-2xl focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                variant="gradient"
                size="lg"
                className="flex-1"
                onClick={() => setStep(3)}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Relationship Goals & Interests */}
        {step === 3 && (
          <div className="space-y-5 pt-2">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-2">Relationship Goals</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RELATIONSHIP_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setRelationshipGoal(goal)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      relationshipGoal === goal
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{goal}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-300">Passions ({interests.length}/8)</label>
                <span className="text-[11px] text-zinc-500">Pick up to 8</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_LIST.map((item) => {
                  const sel = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        sel
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
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
                variant="gradient"
                size="lg"
                className="flex-1"
                onClick={handleFinish}
                isLoading={isLoading}
              >
                Complete Profile ✨
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
