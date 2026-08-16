'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { 
  Sliders, Shield, Bell, Eye, EyeOff, Globe, 
  Trash2, LogOut, Check, ChevronRight, Lock 
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, profile, subscriptionTier, logout } = useAuth();
  const [distance, setDistance] = useState(50);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [globalMode, setGlobalMode] = useState(false);
  const [incognito, setIncognito] = useState(false);
  const [showMe, setShowMe] = useState(true);
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">App Settings</h1>
          <p className="text-xs text-zinc-400">Control your discovery radius, privacy, and account security</p>
        </div>
        <Button variant="gradient" size="sm" onClick={handleSave}>
          {savedToast ? <Check className="w-4 h-4 mr-1" /> : null}
          {savedToast ? 'Saved!' : 'Save'}
        </Button>
      </div>

      {/* Discovery Preferences */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <Sliders className="w-4 h-4" /> Discovery Settings
        </h3>

        {/* Distance Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-300 font-medium">Maximum Distance</span>
            <span className="text-rose-400 font-bold">{distance} km</span>
          </div>
          <input
            type="range"
            min="2"
            max="160"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full accent-rose-500 bg-zinc-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Age Range Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-300 font-medium">Age Preference</span>
            <span className="text-rose-400 font-bold">
              {minAge} - {maxAge} years
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500">Min Age</label>
              <input
                type="number"
                min="18"
                max={maxAge}
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500">Max Age</label>
              <input
                type="number"
                min={minAge}
                max="80"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Global Passport Mode */}
        <label className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs font-semibold text-white">Global Passport Mode</div>
              <div className="text-[11px] text-zinc-400">See people nearby and around the world</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={globalMode}
            onChange={(e) => setGlobalMode(e.target.checked)}
            className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Safety & Privacy */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-sky-400 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Safety & Visibility
        </h3>

        {/* Show Me on Tinder Toggle */}
        <label className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-2xl cursor-pointer">
          <div>
            <div className="text-xs font-semibold text-white">Show Me in Discovery Stack</div>
            <div className="text-[11px] text-zinc-400">Turn off to pause swiping while keeping active chats</div>
          </div>
          <input
            type="checkbox"
            checked={showMe}
            onChange={(e) => setShowMe(e.target.checked)}
            className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
          />
        </label>

        {/* Incognito Mode */}
        <label className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                Incognito Mode <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.2 rounded-full font-bold">GOLD</span>
              </div>
              <div className="text-[11px] text-zinc-400">Only people you have liked will be able to see your profile</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={incognito}
            onChange={(e) => setIncognito(e.target.checked)}
            className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Notifications */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Push & In-App Alerts
        </h3>

        <label className="flex items-center justify-between p-3 bg-zinc-950 rounded-2xl cursor-pointer">
          <span className="text-xs font-medium text-white">New Match Alerts</span>
          <input
            type="checkbox"
            checked={notifMatches}
            onChange={(e) => setNotifMatches(e.target.checked)}
            className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-zinc-950 rounded-2xl cursor-pointer">
          <span className="text-xs font-medium text-white">New Message Notifications</span>
          <input
            type="checkbox"
            checked={notifMessages}
            onChange={(e) => setNotifMessages(e.target.checked)}
            className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Account Management & Sign Out */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
          Account Actions
        </h3>

        <button
          onClick={logout}
          className="w-full flex items-center justify-between p-3.5 bg-zinc-950 hover:bg-zinc-800 rounded-2xl text-xs font-medium text-zinc-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-zinc-400" /> Log Out of AuraMatch
          </span>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          onClick={() => alert('Account deletion simulated for demo.')}
          className="w-full flex items-center justify-between p-3.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-2xl text-xs font-medium text-red-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete Account & Clear Data
          </span>
          <ChevronRight className="w-4 h-4 text-red-700" />
        </button>
      </div>
    </div>
  );
}
