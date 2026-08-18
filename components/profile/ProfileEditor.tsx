'use client';

import React, { useState, useRef } from 'react';
import { IProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Camera, Check, ArrowUp, ArrowDown, Upload, Trash2, Link as LinkIcon, Plus } from 'lucide-react';
import { compressImageFile } from '@/utils/imageCompressor';
import { api } from '@/lib/api-client';

interface ProfileEditorProps {
  initialProfile: IProfile;
  onSave: (updates: Partial<IProfile>) => void;
  onCancel: () => void;
}

export function ProfileEditor({ initialProfile, onSave, onCancel }: ProfileEditorProps) {
  const [name, setName] = useState(initialProfile.name || '');
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [city, setCity] = useState(initialProfile.location?.city || '');
  const [job, setJob] = useState(initialProfile.job || '');
  const [photos, setPhotos] = useState<string[]>(initialProfile.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus('Uploading to Cloudinary...');
    const availableSlots = 6 - photos.length;
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      try {
        const compressedBase64 = await compressImageFile(file, 1080, 1440, 0.85);
        const res = await api.post('/api/upload', { image: compressedBase64 });
        if (res && res.url) {
          uploadedUrls.push(res.url);
        } else {
          uploadedUrls.push(compressedBase64);
        }
      } catch (err) {
        console.error('Error uploading photo:', err);
      }
    }

    if (uploadedUrls.length > 0) {
      setPhotos((prev) => [...prev, ...uploadedUrls]);
    }

    setIsUploading(false);
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      alert('Please upload at least 1 profile photo.');
      return;
    }

    onSave({
      name: name.trim(),
      firstName: name.trim(),
      bio: bio.trim(),
      job: job.trim(),
      location: {
        ...initialProfile.location,
        city: city.trim(),
      },
      photos,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onCancel();
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto pb-12">
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
                  <span>{uploadStatus || 'Uploading...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload From Gallery</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 6 Photo Slots Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const photoUrl = photos[idx];
            return (
              <div
                key={idx}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all ${
                  photoUrl
                    ? 'border-zinc-700 bg-zinc-950 group'
                    : 'border-dashed border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 flex flex-col items-center justify-center cursor-pointer'
                }`}
                onClick={() => {
                  if (!photoUrl && !isUploading) handleGalleryClick();
                }}
              >
                {photoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge for Slot 1 */}
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md">
                        Main
                      </span>
                    )}

                    {/* Overlay Action Controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex justify-between items-center bg-zinc-900/90 rounded-lg p-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePhoto(idx, 'up');
                          }}
                          className="p-1 rounded text-zinc-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move left/up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-zinc-400 font-mono">#{idx + 1}</span>
                        <button
                          type="button"
                          disabled={idx === photos.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePhoto(idx, 'down');
                          }}
                          className="p-1 rounded text-zinc-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move right/down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-1">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium">Add #{idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Alternative URL Link input toggle */}
        <div className="pt-1">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Or add image link URL</span>
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-zinc-950 border border-zinc-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddPhotoUrl}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-2 py-2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Basic Identity Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white mb-2">Basic Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">City / Location</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New Delhi"
              className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">About Me (Bio)</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a brief introduction about yourself..."
            className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm p-4 rounded-2xl focus:outline-none focus:border-rose-500 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Profession / Work</label>
          <input
            type="text"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="e.g. Software Engineer / Designer"
            className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Sticky Bottom Action Buttons */}
      <div className="sticky bottom-6 z-20 flex gap-3 p-4 bg-zinc-950/90 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 text-xs"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="gradient"
          disabled={isUploading}
          className="flex-1 text-xs font-bold shadow-lg shadow-rose-600/30"
        >
          {isSaved ? (
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" /> Profile Updated!
            </span>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
