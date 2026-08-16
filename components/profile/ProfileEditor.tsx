'use client';

import React, { useState, useRef } from 'react';
import { IProfile, IProfilePrompt } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Camera, Sparkles, Check, ArrowUp, ArrowDown, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface ProfileEditorProps {
  initialProfile: IProfile;
  onSave: (updates: Partial<IProfile>) => void;
  onCancel: () => void;
}

const ALL_PASSIONS = [
  'Photography', 'Specialty Coffee', 'Hiking', 'Indie Rock', 'Tech', 'Culinary Arts',
  'Modern Art', 'Film Photography', 'Yoga', 'Matcha', 'Vintage Fashion', 'Travel',
  'Surfing', 'Running', 'Fine Dining', 'Podcasts', 'Dogs', 'Piano', 'Architecture',
  'Electronic Music', 'Ramen', 'Bouldering', 'Astrophotography', 'Wildlife', 'Baking',
  'Wine Tasting', 'Literature', 'Tennis', 'Anime', 'Gaming', 'Gym & Fitness'
];

const PROMPT_SUGGESTIONS = [
  'Two truths and a lie...',
  'The key to my heart is...',
  'My simple pleasures in life...',
  'We’ll get along if...',
  'Dating me is like...',
  'Best travel story...',
  'I guarantee you that...',
  'Together we could...',
  'First round is on me if...',
];

export function ProfileEditor({ initialProfile, onSave, onCancel }: ProfileEditorProps) {
  const [name, setName] = useState(initialProfile.name || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [job, setJob] = useState(initialProfile.job || '');
  const [company, setCompany] = useState(initialProfile.company || '');
  const [school, setSchool] = useState(initialProfile.school || '');
  const [height, setHeight] = useState(initialProfile.height || 175);
  const [city, setCity] = useState(initialProfile.location?.city || '');
  const [photos, setPhotos] = useState<string[]>(initialProfile.photos || []);
  const [passions, setPassions] = useState<string[]>(initialProfile.passions || []);
  const [prompts, setPrompts] = useState<IProfilePrompt[]>(initialProfile.prompts || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePassion = (passion: string) => {
    if (passions.includes(passion)) {
      setPassions(passions.filter((p) => p !== passion));
    } else if (passions.length < 6) {
      setPassions([...passions, passion]);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const availableSlots = 6 - photos.length;
    const filesToRead = Array.from(files).slice(0, availableSlots);

    let processedCount = 0;
    const newBase64Photos: string[] = [];

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newBase64Photos.push(event.target.result as string);
        }
        processedCount++;
        if (processedCount === filesToRead.length) {
          setPhotos((prev) => [...prev, ...newBase64Photos]);
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        processedCount++;
        if (processedCount === filesToRead.length) {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoUrl = () => {
    if (newPhotoUrl.trim() && photos.length < 6) {
      setPhotos([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
      setShowUrlInput(false);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleMovePhoto = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const newPhotos = [...photos];
    const temp = newPhotos[idx];
    newPhotos[idx] = newPhotos[targetIdx];
    newPhotos[targetIdx] = temp;
    setPhotos(newPhotos);
  };

  const handleAddPrompt = () => {
    if (prompts.length < 3) {
      setPrompts([
        ...prompts,
        {
          id: `p_${Date.now()}`,
          question: PROMPT_SUGGESTIONS[prompts.length % PROMPT_SUGGESTIONS.length],
          answer: '',
        },
      ]);
    }
  };

  const handleUpdatePrompt = (id: string, field: 'question' | 'answer', val: string) => {
    setPrompts(prompts.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const handleRemovePrompt = (id: string) => {
    setPrompts(prompts.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      firstName: name,
      bio,
      job,
      company,
      school,
      height: Number(height),
      location: {
        ...initialProfile.location,
        city,
      },
      photos,
      passions,
      prompts,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onCancel();
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto pb-12">
      {/* Hidden File Input for Device Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Photos Grid & Gallery Upload */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white mb-0.5 flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-400" />
              Profile Photos ({photos.length}/6)
            </h3>
            <p className="text-xs text-zinc-400">
              Upload photos from your gallery. The first photo is your main cover card.
            </p>
          </div>

          {photos.length < 6 && (
            <button
              type="button"
              onClick={handleGalleryClick}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose from Gallery</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-700/80 group shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  Main Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(idx, 'up')}
                    className="p-1.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 cursor-pointer"
                    title="Move Forward"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                )}
                {idx < photos.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(idx, 'down')}
                    className="p-1.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 cursor-pointer"
                    title="Move Backward"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty Upload Slots */}
          {Array.from({ length: 6 - photos.length }).map((_, slotIdx) => (
            <button
              key={`empty_${slotIdx}`}
              type="button"
              onClick={handleGalleryClick}
              className="aspect-[3/4] rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-rose-500/80 flex flex-col items-center justify-center p-3 text-center bg-zinc-950/40 hover:bg-rose-950/10 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-rose-600/30 flex items-center justify-center text-zinc-400 group-hover:text-rose-400 mb-1.5 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-rose-300">
                + Upload Photo
              </span>
            </button>
          ))}
        </div>

        {/* Optional URL Toggle */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL input' : 'Or add via image web URL'}</span>
          </button>
        </div>

        {showUrlInput && photos.length < 6 && (
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image web URL (e.g. Unsplash or direct link)..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-rose-500"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddPhotoUrl}>
              Add URL
            </Button>
          </div>
        )}
      </div>

      {/* Basic Info & Bio */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white mb-2">About You</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-zinc-950 border border-zinc-700 text-white text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              City / Location
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New Delhi, Mumbai, Bengaluru..."
              className="w-full bg-zinc-950 border border-zinc-700 text-white text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Bio ({bio.length}/500)
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share a glimpse of your personality, humor, passions, or quirky interests..."
            className="w-full bg-zinc-950 border border-zinc-700 text-white text-sm p-3.5 rounded-xl focus:outline-none focus:border-rose-500 transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="e.g. Product Designer"
              className="w-full bg-zinc-950 border border-zinc-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Studio 9"
              className="w-full bg-zinc-950 border border-zinc-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              placeholder="175"
              className="w-full bg-zinc-950 border border-zinc-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Passions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white">
          Passions &amp; Interests ({passions.length}/6)
        </h3>
        <p className="text-xs text-zinc-400">
          Select up to 6 passions that describe your lifestyle.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {ALL_PASSIONS.map((p) => {
            const isSelected = passions.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePassion(p)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Icebreaker Prompts ({prompts.length}/3)
            </h3>
            <p className="text-xs text-zinc-400">
              Answer prompts to spark real conversations.
            </p>
          </div>
          {prompts.length < 3 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddPrompt}
              className="border-zinc-700 text-zinc-300 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add Prompt
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {prompts.map((p) => (
            <div
              key={p.id}
              className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2 relative group"
            >
              <button
                type="button"
                onClick={() => handleRemovePrompt(p.id)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <select
                value={p.question}
                onChange={(e) => handleUpdatePrompt(p.id, 'question', e.target.value)}
                className="bg-transparent text-xs font-bold text-rose-400 border-none outline-none cursor-pointer w-full pr-8"
              >
                {PROMPT_SUGGESTIONS.map((q) => (
                  <option key={q} value={q} className="bg-zinc-900 text-white">
                    {q}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={p.answer}
                onChange={(e) => handleUpdatePrompt(p.id, 'answer', e.target.value)}
                placeholder="Write your witty answer..."
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Save Toolbar */}
      <div className="sticky bottom-6 z-20 flex items-center justify-end gap-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-3 rounded-2xl shadow-2xl">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-700 text-zinc-300 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/30 px-6"
        >
          {isSaved ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Profile Saved!
            </span>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
