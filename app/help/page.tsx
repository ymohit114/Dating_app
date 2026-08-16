'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { HelpCircle, MessageCircle, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: 'How does matching work on AuraMatch?',
    a: 'When two users both swipe right or like each other’s profiles, a mutual match is created instantly. Both members can then start messaging and chatting for free.'
  },
  {
    q: 'Is AuraMatch completely free?',
    a: 'Yes! AuraMatch is 100% free of cost. All core features including unlimited swiping, seeing who liked you, chat messaging, and rewinds are open and free for all members.'
  },
  {
    q: 'How do I get my profile verified?',
    a: 'Go to your Profile or visit /verify to complete a 10-second selfie pose verification. Once approved, the verified blue checkmark will be displayed on your profile card.'
  },
  {
    q: 'How do I block or report someone?',
    a: 'Tap on the user’s profile to open their full details, then scroll to the bottom to click "Report" or "Block". Blocked users cannot see you or message you.'
  },
  {
    q: 'How do I delete my account?',
    a: 'Navigate to Settings > Account Actions > Delete Account. This will permanently remove your profile, photos, and messages from the platform.'
  }
];

export default function HelpSupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" /> Help & Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">How Can We Help You?</h1>
        <p className="text-xs sm:text-sm text-zinc-400">Frequently asked questions and direct support inquiries</p>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:bg-zinc-800/40 transition-colors"
              >
                <span>{faq.q}</span>
                {openIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-rose-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === idx && (
                <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-rose-400" /> Send a Message to Support
        </h2>

        {submitted ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Thank you! Your ticket has been received. Our support team will reply within 24 hours.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400">Describe your issue or question</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you today?"
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-white text-xs p-3.5 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>
            <Button type="submit" variant="gradient" size="md" className="gap-2">
              <Send className="w-4 h-4" /> Submit Inquiry
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
