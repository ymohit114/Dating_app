'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import { Camera, CheckCircle2, ShieldCheck, Upload, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerifyPage() {
  const { updateProfile } = useAuth();
  const { cameraStream, cameraStatus, errorMessage, requestCamera, stopAllStreams } = useMediaPermissions();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const handleStartCamera = async () => {
    setIsCapturing(true);
    const stream = await requestCamera();
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        stopAllStreams();
        processVerification();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhoto(reader.result as string);
        processVerification();
      };
      reader.readAsDataURL(file);
    }
  };

  const processVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsDone(true);
      updateProfile({ isVerified: true });
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-ivory-100">
      <div className="w-full max-w-md bg-surface-card border border-clay rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-plum-50 text-plum-700 mx-auto flex items-center justify-center border border-plum-100 shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-plum-700">Identity Verification</span>
          <h1 className="text-2xl font-serif font-bold text-charcoal-900 mt-1">Get Verified Badge</h1>
          <p className="text-xs text-charcoal-600 mt-1 max-w-xs mx-auto">
            Take a quick selfie to earn the blue verification checkmark.
          </p>
        </div>

        {isDone ? (
          <div className="p-6 bg-plum-50 border border-plum-200 rounded-3xl space-y-3">
            <CheckCircle2 className="w-12 h-12 text-plum-700 mx-auto" />
            <h3 className="text-base font-serif font-bold text-charcoal-900">Verification Approved!</h3>
            <p className="text-xs text-charcoal-600">
              The verified checkmark is now active on your Elance profile card.
            </p>
            <Link href="/discover" className="block pt-2">
              <Button variant="primary" size="md" className="w-full font-semibold">
                Back to Discover
              </Button>
            </Link>
          </div>
        ) : isVerifying ? (
          <div className="py-12 space-y-3">
            <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
              <span className="absolute left-0 w-8 h-8 rounded-full bg-plum-700 opacity-80 animate-ping" />
              <span className="absolute right-0 w-8 h-8 rounded-full bg-gold opacity-80 mix-blend-multiply animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-charcoal-700">Comparing selfie with profile photos...</p>
          </div>
        ) : isCapturing && cameraStatus === 'granted' ? (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] max-h-72 rounded-2xl overflow-hidden bg-charcoal-900 border border-clay">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none m-4" />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              onClick={handleTakePhoto}
            >
              Snap Verification Selfie 📸
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cameraStatus === 'denied' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Camera access is required to take a photo.</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    You can upload a photo from your device instead.
                  </p>
                </div>
              </div>
            )}

            <div className="p-6 bg-ivory-50 border border-clay rounded-2xl flex flex-col items-center gap-3">
              <Camera className="w-8 h-8 text-charcoal-500" />
              <span className="text-xs text-charcoal-600">
                Camera is only accessed when you start verification.
              </span>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-semibold"
                onClick={handleStartCamera}
              >
                <Camera className="w-4 h-4 mr-1.5" /> Take Photo with Camera
              </Button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-full bg-ivory-200 hover:bg-clay text-charcoal-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload Selfie from Device
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
