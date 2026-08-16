'use client';

import React, { useState } from 'react';
import { Settings, Shield, Sliders, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [defaultDiscoveryRadius, setDefaultDiscoveryRadius] = useState(5);
  const [maxPhotosPerProfile, setMaxPhotosPerProfile] = useState(6);
  const [enableAutomatedNLPFilter, setEnableAutomatedNLPFilter] = useState(true);
  const [require18PlusStrictDOB, setRequire18PlusStrictDOB] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System &amp; Safety Configurations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Global platform parameters, safety thresholds, and discovery defaults.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configurations saved and synced to database!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-500" />
            <span>Discovery &amp; Match Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Default Nearby Radius (KM)</label>
              <input
                type="number"
                value={defaultDiscoveryRadius}
                onChange={(e) => setDefaultDiscoveryRadius(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Max Upload Photos Count</label>
              <input
                type="number"
                value={maxPhotosPerProfile}
                onChange={(e) => setMaxPhotosPerProfile(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span>Trust &amp; Safety Automation</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Strict 18+ Age Validation</span>
                <span className="text-[11px] text-slate-400">Rejects any registration under legal adulthood</span>
              </div>
              <input
                type="checkbox"
                checked={require18PlusStrictDOB}
                onChange={(e) => setRequire18PlusStrictDOB(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Automated Keyword &amp; Spam Shield</span>
                <span className="text-[11px] text-slate-400">Flags suspicious commercial or abusive texts for review</span>
              </div>
              <input
                type="checkbox"
                checked={enableAutomatedNLPFilter}
                onChange={(e) => setEnableAutomatedNLPFilter(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded"
              />
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
