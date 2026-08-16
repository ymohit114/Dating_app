'use client';

import { useState, useCallback } from 'react';

export function useMediaPermissions() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'granted' | 'denied' | 'error'>('idle');
  const [micStatus, setMicStatus] = useState<'idle' | 'granted' | 'denied' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Request Camera ONLY when user clicks "Take Photo" or "Selfie Verification"
  const requestCamera = useCallback(async (): Promise<MediaStream | null> => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error');
      setErrorMessage('Camera access is not supported on this browser.');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      setCameraStatus('granted');
      setErrorMessage(null);
      return stream;
    } catch (err: any) {
      setCameraStatus('denied');
      setErrorMessage('Camera access is required to take a photo. You can upload a photo from your device instead.');
      return null;
    }
  }, []);

  // Request Camera + Microphone ONLY when user initiates a Video Call
  const requestVideoCallMedia = useCallback(async (): Promise<MediaStream | null> => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Media devices not supported.');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setCameraStream(stream);
      setCameraStatus('granted');
      setMicStatus('granted');
      return stream;
    } catch (err) {
      setCameraStatus('denied');
      setMicStatus('denied');
      setErrorMessage('Camera and microphone permissions are required to start a video call.');
      return null;
    }
  }, []);

  // Stop active streams to conserve battery and privacy
  const stopAllStreams = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }
    setCameraStatus('idle');
    setMicStatus('idle');
  }, [cameraStream, micStream]);

  return {
    cameraStream,
    micStream,
    cameraStatus,
    micStatus,
    errorMessage,
    requestCamera,
    requestVideoCallMedia,
    stopAllStreams,
  };
}
