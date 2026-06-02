'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

type ValidationState = 'idle' | 'loading' | 'valid' | 'invalid';

interface UsernameInputProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#10b981"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Enhanced username input with:
 * - Real-time GitHub avatar validation (debounced)
 * - Visual states: idle → loading → valid / invalid
 * - Avatar preview when valid
 * - Accessible status announcements
 */
export function UsernameInput({ value, onChange, onClear }: UsernameInputProps) {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const trimmed = value.trim();
  const debouncedUsername = useDebounce(trimmed, 600);

  // GitHub username regex — 1-39 alphanumeric / hyphens, no leading/trailing hyphen
  const isValidFormat =
    debouncedUsername.length > 0 &&
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(debouncedUsername);

  useEffect(() => {
    // Reset when input cleared
    if (debouncedUsername.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValidationState('idle');
      setAvatarUrl(null);
      return;
    }

    if (!isValidFormat) {
      setValidationState('invalid');
      setAvatarUrl(null);
      return;
    }

    // Abort previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setValidationState('loading');
    setAvatarUrl(null);

    // Use GitHub's avatar URL as a lightweight existence check
    const url = `https://avatars.githubusercontent.com/${debouncedUsername}?size=80`;
    const img = new Image();
    img.src = url;

    img.onload = () => {
      if (controller.signal.aborted) return;
      setValidationState('valid');
      setAvatarUrl(url);
    };

    img.onerror = () => {
      if (controller.signal.aborted) return;
      setValidationState('invalid');
      setAvatarUrl(null);
    };

    return () => {
      controller.abort();
    };
  }, [debouncedUsername, isValidFormat]);

  // Show loading spinner while user is typing (before debounce settles)
  const isTyping = trimmed !== debouncedUsername && trimmed.length > 0;
  const displayState: ValidationState = isTyping ? 'loading' : validationState;

  const ringClass =
    displayState === 'valid'
      ? 'ring-2 ring-emerald-400 border-transparent'
      : displayState === 'invalid'
        ? 'ring-2 ring-red-400 border-transparent'
        : displayState === 'loading'
          ? 'ring-2 ring-cyan-400/60 border-transparent'
          : 'border-black/10 dark:border-white/10 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-transparent';

  const statusMessage =
    displayState === 'valid'
      ? `GitHub user ${debouncedUsername} found`
      : displayState === 'invalid' && debouncedUsername.length > 0
        ? `GitHub user ${debouncedUsername} not found`
        : '';

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Screen-reader live region */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </span>

      <div
        className={`relative flex items-center w-full rounded-2xl border bg-white transition-all duration-250 shadow-inner dark:bg-black/60 ${ringClass}`}
      >
        {/* Avatar preview (left side) */}
        <AnimatePresence>
          {avatarUrl && displayState === 'valid' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: -4 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7, x: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-3 flex items-center gap-2 pointer-events-none z-10"
              aria-hidden="true"
            >
              <img
                src={avatarUrl}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-emerald-400/40"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="text"
          id="github-username-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          suppressHydrationWarning
          placeholder="Enter GitHub Username"
          aria-label="GitHub username"
          aria-describedby="username-hint"
          aria-invalid={displayState === 'invalid'}
          className={`flex-1 rounded-2xl bg-transparent py-4 text-sm text-black outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500 transition-all duration-250 ${
            avatarUrl && displayState === 'valid' ? 'pl-14 pr-10' : 'px-5 pr-10'
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={39}
        />

        {/* Right-side indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <AnimatePresence mode="wait">
            {displayState === 'loading' && (
              <motion.span
                key="spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-cyan-500"
              >
                <Spinner />
              </motion.span>
            )}
            {displayState === 'valid' && (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15"
              >
                <CheckIcon />
              </motion.span>
            )}
          </AnimatePresence>

          {value.length > 0 && (
            <button
              onClick={onClear}
              className="text-gray-400 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
              aria-label="Clear username input"
              type="button"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Contextual hint messages */}
      <div id="username-hint" aria-live="polite">
        <AnimatePresence mode="wait">
          {displayState === 'valid' && debouncedUsername && (
            <motion.p
              key="valid"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 flex items-center gap-1.5 self-start pl-1 text-xs text-emerald-600 dark:text-emerald-400"
            >
              <CheckIcon />
              {debouncedUsername} found
            </motion.p>
          )}
          {displayState === 'invalid' && debouncedUsername.length > 0 && (
            <motion.p
              key="invalid"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 self-start pl-1 text-xs text-red-500"
            >
              GitHub user not found
            </motion.p>
          )}
          {value.length === 39 && (
            <motion.p
              key="limit"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1.5 self-start pl-1 text-xs text-red-500"
            >
              GitHub username limit reached (39 characters maximum)
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
