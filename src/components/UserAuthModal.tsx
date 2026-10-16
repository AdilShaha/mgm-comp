import React, { useState } from 'react';
import { User, X, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import { UserProfile } from '../types/index.ts';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  showToast,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
            },
          });
          if (error) throw error;

          const user = data.user;
          const profile: UserProfile = {
            id: user?.id || `user_${Date.now()}`,
            email: user?.email || email,
            fullName: fullName || email.split('@')[0],
          };

          try {
            await supabase.from('profiles').upsert([
              {
                id: profile.id,
                email: profile.email,
                full_name: profile.fullName,
                updated_at: new Date().toISOString(),
              },
            ]);
          } catch {
            // non-fatal
          }

          showToast('Account Created', 'Welcome to the DPDP Form Auditor platform.', 'success');
          onAuthSuccess(profile);
          onClose();
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          // Disable email confirmation restriction completely
          if (error) {
            if (error.message.toLowerCase().includes('confirm') || error.message.toLowerCase().includes('not confirmed')) {
              const profile: UserProfile = {
                id: `usr_${Date.now()}`,
                email: email.trim(),
                fullName: email.split('@')[0],
              };
              showToast('Signed In', `Signed in as ${profile.email}`, 'success');
              onAuthSuccess(profile);
              onClose();
              return;
            }
            throw error;
          }

          const user = data.user;
          const profile: UserProfile = {
            id: user?.id || `user_${Date.now()}`,
            email: user?.email || email,
            fullName: user?.user_metadata?.full_name || email.split('@')[0],
          };

          showToast('Signed In', `Signed in as ${profile.email}`, 'success');
          onAuthSuccess(profile);
          onClose();
        }
      } else {
        // Local user session
        const profile: UserProfile = {
          id: `usr_${Date.now()}`,
          email,
          fullName: fullName || email.split('@')[0],
        };
        showToast(
          isSignUp ? 'Account Created' : 'Signed In',
          `Active auditor session for ${profile.email}`,
          'success'
        );
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('not confirmed')) {
        const profile: UserProfile = {
          id: `usr_${Date.now()}`,
          email: email.trim(),
          fullName: fullName.trim() || email.split('@')[0],
        };
        showToast('Signed In', `Signed in as ${profile.email}`, 'success');
        onAuthSuccess(profile);
        onClose();
        return;
      }

      if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('jwt')) {
        setErrorMessage(
          'Supabase API key verification failed. Make sure your VITE_SUPABASE_ANON_KEY does not have trailing punctuation or whitespace.'
        );
      } else {
        setErrorMessage(msg || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email || !supabase) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      showToast('Confirmation Resent', `Verification link sent to ${email}`, 'success');
    } catch (err: any) {
      showToast('Notice', err.message || 'Unable to resend confirmation email.', 'info');
    }
  };

  const handleBypassEmailConfirmation = () => {
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      fullName: fullName.trim() || email.split('@')[0],
    };
    showToast('Auditor Session Active', `Welcome, ${profile.email}`, 'success');
    onAuthSuccess(profile);
    onClose();
  };

  const handleGuestSession = () => {
    const guestProfile: UserProfile = {
      id: `guest_${Date.now()}`,
      email: email.trim() || 'auditor@session.local',
      fullName: fullName.trim() || 'Compliance Auditor',
    };
    showToast('Auditor Session Active', 'Signed in for current session.', 'success');
    onAuthSuccess(guestProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {isSignUp ? 'Create Auditor Profile' : 'Auditor Sign In'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Preserve audit records & compliance score logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs space-y-2.5">
            <p className="leading-relaxed">{errorMessage}</p>

            {isEmailUnconfirmed && (
              <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleBypassEmailConfirmation}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:scale-[1.01] active:scale-95 text-center"
                >
                  Continue Directly (Start Auditing Now)
                </button>

                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="w-full py-1.5 px-3 text-[11px] font-medium rounded-lg border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors text-center"
                >
                  Resend Confirmation Email
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Compliance Officer Name"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                  required
                />
                <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="auditor@organization.com"
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                required
              />
              <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                required
              />
              <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
            }}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium"
          >
            {isSignUp
              ? 'Already possess an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>

          <button
            type="button"
            onClick={handleGuestSession}
            className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Continue in Local Session Without Cloud Auth
          </button>
        </div>
      </div>
    </div>
  );
};
