'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, MapPin, Briefcase, GraduationCap, 
  ArrowRight, ArrowLeft, Check, Camera, ImagePlus, 
  Trash2, User, AlertCircle, Upload 
} from 'lucide-react';
import { compressImageFile } from '@/utils/imageCompressor';
import { api } from '@/lib/api-client';

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
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const availableSlots = 6 - photos.length;
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressedBase64 = await compressImageFile(file, 1080, 1440, 0.85);
        const res = await api.post('/api/upload', { image: compressedBase64 });
        if (res && res.url) {
          uploadedUrls.push(res.url);
        } else {
          uploadedUrls.push(compressedBase64);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    if (uploadedUrls.length > 0) {
      setPhotos((prev) => [...prev, ...uploadedUrls]);
      setErrorMessage('');
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      firstName: name.trim(),
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
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? 'Identity & Photos' : step === 2 ? 'Bio & Intentions' : 'Interests & Passions'}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-600 to-pink-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Mandatory Full Name & Photo Upload */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-rose-500" />
                <span>Tell us your Name &amp; Photo</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Your full name and at least 1 real gallery photo are strictly required to start matching.
              </p>
            </div>

            {/* Mandatory Name Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your real full name"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-3 rounded-2xl focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Photo Uploader */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-rose-500" />
                  <span>Upload Photos (At least 1 required) <span className="text-rose-500">*</span></span>
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">{photos.length}/6 photos</span>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-3 gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/70 hover:bg-red-600 text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {photos.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-[3/4] rounded-2xl border-2 border-dashed border-zinc-700 hover:border-rose-500 hover:bg-zinc-800/50 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-semibold text-rose-400">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-rose-500">
                          <ImagePlus className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold">Choose Gallery</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Hidden native file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <Button
              type="button"
              variant="gradient"
              onClick={handleStep1Next}
              disabled={isUploading}
              className="w-full py-3 text-sm font-bold shadow-lg shadow-rose-600/30"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}

        {/* STEP 2: Intentions, City & Bio */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Your Intentions &amp; Bio</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Help matches understand what you are looking for.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Your City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Relationship Intentions</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RELATIONSHIP_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setRelationshipGoal(goal)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      relationshipGoal === goal
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">About You (Bio)</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a little about who you are, what you enjoy, or what makes you laugh..."
                className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs p-3 rounded-2xl focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Profession</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Designer"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Education / College</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Delhi University"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
              <Button type="button" variant="gradient" onClick={() => setStep(3)} className="flex-1 text-xs font-bold">
                Next: Passions <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Passions & Finish */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Select Your Passions</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Pick things you love to do so we can find people with similar chemistry.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {INTERESTS_LIST.map((item) => {
                const isSelected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white border border-rose-500 shadow-md shadow-rose-600/20'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
              <Button
                type="button"
                variant="gradient"
                disabled={isLoading}
                onClick={handleFinish}
                className="flex-1 text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Profile...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Start Discovering
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
