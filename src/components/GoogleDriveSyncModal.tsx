import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  LogOut,
  ShieldCheck,
  FileCheck,
  Receipt,
  Users,
  Landmark,
  Lock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  googleLogout,
  initAuth,
} from '../utils/firebaseAuth';
import {
  findBackupFile,
  saveToGoogleDrive,
  loadFromGoogleDrive,
  DriveFileInfo,
} from '../utils/googleDrive';
import { FinanceData } from '../types/finance';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: FinanceData;
  onRestoreData: (data: FinanceData) => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onRestoreData,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [driveFile, setDriveFile] = useState<DriveFileInfo | null>(null);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setDriveFile(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // When user is authenticated with token, check for existing backup file in Drive
  useEffect(() => {
    if (accessToken && isOpen) {
      checkExistingBackup(accessToken);
    }
  }, [accessToken, isOpen]);

  const checkExistingBackup = async (token: string) => {
    setIsLoadingDrive(true);
    setErrorMessage(null);
    try {
      const file = await findBackupFile(token);
      setDriveFile(file);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not query Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        await checkExistingBackup(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google Sign-in failed. Please allow popups.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setAccessToken(null);
    setDriveFile(null);
    setSyncStatus(null);
  };

  const handleBackupToDrive = async () => {
    if (!accessToken) return;
    setIsLoadingDrive(true);
    setErrorMessage(null);
    setSyncStatus(null);

    try {
      const file = await saveToGoogleDrive(accessToken, currentData);
      setDriveFile(file);
      setSyncStatus(
        `Synced ${currentData.transactions.length} raw transactions, accounts & P2P records directly to Google Drive!`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save to Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!accessToken || !driveFile) return;

    setIsLoadingDrive(true);
    setErrorMessage(null);
    setSyncStatus(null);
    setShowRestoreConfirm(false);

    try {
      const restored = await loadFromGoogleDrive(accessToken, driveFile.id);
      onRestoreData(restored);
      setSyncStatus(
        `Successfully restored ${restored.transactions.length} transactions, ${restored.accounts.length} accounts, and P2P ledger from Google Drive!`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to restore from Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Google Drive Private Sync</h3>
              <p className="text-xs text-slate-400">
                100% private: Sync raw transactions data to your Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* Status feedback */}
          {syncStatus && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{syncStatus}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Privacy & Security Guarantee Banner */}
          <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block">Strict Device & Cloud Privacy</span>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Your data stays strictly on your device (Windows/iPhone) and syncs directly to your personal Google Drive via <code>drive.file</code> scope. No external analytics, no third-party servers.
              </p>
            </div>
          </div>

          {/* Not signed in state */}
          {!user && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Connect Your Google Drive</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  Sign in with Google to enable one-tap cloud sync for your raw transactions ledger, accounts, and P2P borrow/lending records.
                </p>
              </div>

              {/* Official Google Sign-in styled button */}
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sandboxed Drive Access (drive.file scope only)</span>
              </div>
            </div>
          )}

          {/* Signed in state */}
          {user && (
            <div className="space-y-4">
              {/* User profile card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google Account'}
                      className="w-10 h-10 rounded-full border border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 font-bold text-white flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs truncate">
                      {user.displayName || 'Google User'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Transactional sync breakdown */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Transactions Ledger (Unaggregated)</span>
                  <span className="text-emerald-400">Full Granular Sync</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-xl">
                    <div className="text-base font-extrabold text-white">
                      {currentData.transactions.length}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">
                      Transactions
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-xl">
                    <div className="text-base font-extrabold text-white">
                      {(currentData.personLending || []).length}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">
                      P2P Records
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-2 rounded-xl">
                    <div className="text-base font-extrabold text-white">
                      {currentData.accounts.length + currentData.creditCards.length}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-sans">
                      Banks & Cards
                    </div>
                  </div>
                </div>
              </div>

              {/* Drive File Status */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                    Target Drive File:
                  </span>
                  <span className="font-mono font-semibold text-slate-200">
                    My_Finance_Manager_Backup.json
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850">
                  <span className="text-slate-400">Drive Cloud Status:</span>
                  {driveFile ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Synced ({new Date(driveFile.modifiedTime).toLocaleDateString()})
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Ready to create first backup</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleBackupToDrive}
                  disabled={isLoadingDrive}
                  className="py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isLoadingDrive ? 'Syncing...' : 'Sync Now to Drive'}</span>
                </button>

                <button
                  onClick={() => setShowRestoreConfirm(true)}
                  disabled={isLoadingDrive || !driveFile}
                  className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <DownloadCloud className="w-4 h-4 text-emerald-400" />
                  <span>Restore from Drive</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal for Restore */}
        {showRestoreConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="font-extrabold text-white text-sm">
                  Restore Data from Google Drive?
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This will overwrite the local dataset on this device with the version stored in your Google Drive file (<code>My_Finance_Manager_Backup.json</code>).
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowRestoreConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRestore}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
