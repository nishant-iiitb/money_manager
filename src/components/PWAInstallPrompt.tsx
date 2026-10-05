import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Chromium / Android / Desktop flow */}
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          title="Install app to your home screen"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* iOS Safari flow */}
      {isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-medium transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Install on iPhone</span>
        </button>
      )}

      {/* Guided instructions modal for iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ₹
                </div>
                <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm text-slate-300">
              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                  <Share className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">1. Tap the Share button</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Located in Safari's bottom toolbar (the square with an arrow pointing up).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <PlusSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">2. Select "Add to Home Screen"</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Scroll down the options list and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center pt-1">
                Works 100% offline like a native iPhone app with fast tap expense entry!
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
