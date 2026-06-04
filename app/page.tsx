'use client';
import { trackUser } from '@/utils/tracking';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { CommitPulseLogo } from '@/components/commitpulse-logo';
import { CustomizeCTA } from './components/CustomizeCTA';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useDebounce } from '@/hooks/useDebounce';
import { Footer } from '@/app/components/Footer';
import { UsernameInput } from '@/components/UsernameInput';
import { HowItWorks } from '@/components/HowItWorks';
import { AnimatedStatsBanner } from '@/components/AnimatedStatsBanner';

import { FeatureCard, FeatureCardsSection } from '@/components/FeatureCards';
import { DiscordButton } from '@/components/DiscordButton';

import { WallOfLove } from '@/components/WallOfLove';
import { validateGitHubUsername } from '@/lib/validations';

/** Well-known GitHub accounts used as sample demo chips */
const DEMO_USERNAMES = ['torvalds', 'gaearon', 'vercel', 'sindresorhus'];

/** The fallback sample account shown before first search */
const SAMPLE_USERNAME = 'torvalds';

const Icons = {
  Github: () => (
    <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  Copy: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
  Zap: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z" />
    </svg>
  ),
  Box: () => <CommitPulseLogo className="h-6 w-6" />,
  Check: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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
  ),
  BadgeIcon: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <line x1="9" x2="15" y1="12" y2="12" />
      <line x1="12" x2="12" y1="9" y2="15" />
    </svg>
  ),
};

function CountUp({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    if (start === end) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(end);
      return;
    }

    const totalMilliseconds = duration;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalMilliseconds, 1);
      const easedProgress = progress * (2 - progress);
      const current = Math.floor(easedProgress * end);

      setCount(current);

      if (progress >= 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function SampleBadgePreview() {
  const cols = 14;
  const rows = 7;
  const towers: { col: number; row: number; height: number; isActive: boolean }[] = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const hash = (c * 7 + r * 13) % 19;
      const isActive = hash % 3 === 0 && (c + r) % 2 === 0;
      const height = isActive ? Math.round(15 + hash * 3.5) : 4;
      towers.push({ col: c, row: r, height, isActive });
    }
  }

  const originX = 300;
  const originY = 110;
  const tileHalfWidth = 16;
  const tileHalfHeight = 10;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 py-6 relative">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-30 blur-xl" />

      <svg
        viewBox="0 0 600 320"
        className="w-full max-w-[700px] h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] cp-svg-container relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sample-tower-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0d1117" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="sample-tower-grad-alt" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0d1117" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          <filter id="sample-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect
          width="600"
          height="320"
          rx="16"
          fill="#0d1117"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        <text
          x="300"
          y="45"
          textAnchor="middle"
          fill="#c9d1d9"
          style={{
            fontFamily: '"Syncopate", sans-serif',
            fontSize: '12px',
            letterSpacing: '6px',
            fontWeight: 400,
            opacity: 0.6,
          }}
        >
          PREVIEW MONOLITH
        </text>

        <line
          x1="100"
          y1="65"
          x2="500"
          y2="65"
          stroke="rgba(16,185,129,0.2)"
          strokeWidth="2"
          filter="url(#sample-glow)"
        >
          <animate attributeName="y1" values="65;240;65" dur="6s" repeatCount="indefinite" />
          <animate attributeName="y2" values="65;240;65" dur="6s" repeatCount="indefinite" />
        </line>
        <line x1="100" y1="65" x2="500" y2="65" stroke="rgba(16,185,129,0.4)" strokeWidth="1">
          <animate attributeName="y1" values="65;240;65" dur="6s" repeatCount="indefinite" />
          <animate attributeName="y2" values="65;240;65" dur="6s" repeatCount="indefinite" />
        </line>

        <g transform="translate(0, 20)">
          {towers.map((t, idx) => {
            const x = originX + (t.col - t.row) * tileHalfWidth;
            const y = originY + (t.col + t.row) * tileHalfHeight;
            const h = t.height;

            const leftPath = `M 0 ${10 - h} L 0 10 L -16 0 L -16 ${-h} Z`;
            const rightPath = `M 0 ${10 - h} L 0 10 L 16 0 L 16 ${-h} Z`;
            const topPath = `M 0 ${-h} L 16 ${10 - h} L 0 ${20 - h} L -16 ${10 - h} Z`;

            const grad =
              (t.col + t.row) % 3 === 0 ? 'url(#sample-tower-grad-alt)' : 'url(#sample-tower-grad)';
            const topColor = (t.col + t.row) % 3 === 0 ? '#06b6d4' : '#10b981';

            if (!t.isActive) {
              return (
                <g key={idx} transform={`translate(${x}, ${y})`}>
                  <path
                    d={leftPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.5"
                  />
                  <path
                    d={rightPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="0.5"
                  />
                  <path d={topPath} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                </g>
              );
            }

            return (
              <g key={idx} transform={`translate(${x}, ${y})`}>
                <path d={leftPath} fill={grad} fillOpacity="0.6" />
                <path d={rightPath} fill={grad} fillOpacity="0.75" />
                <path d={topPath} fill={topColor} fillOpacity="0.85" />
              </g>
            );
          })}
        </g>

        <path
          d={`M ${originX - 14 * 16} ${originY + 14 * 10 + 20} L ${originX} ${originY + 20} L ${originX + 14 * 16} ${originY + 14 * 10 + 20}`}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      </svg>

      <div className="text-center max-w-md relative z-10 px-4">
        <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider mb-2">
          Interactive Monolith Preview
        </h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          CommitPulse compiles your public GitHub contribution history into a customizable 3D city.
          The taller the towers, the more you committed that day. Enter a GitHub username above to
          instantly generate your streak badge.
        </p>
      </div>
    </div>
  );
}

interface UserDetails {
  exists: boolean;
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalContributions: number;
  };
}

export default function LandingPage() {
  const getDisplayUsername = (name: string) => {
    if (name.includes('github.com/')) {
      const parts = name.split('github.com/');
      if (parts[1]) {
        const pathParts = parts[1].split('?')[0].split('/');
        const userPart = pathParts.find((p) => p.trim().length > 0);
        if (userPart) return userPart;
      }
    }
    return name;
  };

  const [username, setUsername] = useState('');
  const [instantUsername, setInstantUsername] = useState('');
  const [copied, setCopied] = useState(false);

  const [badgeResult, setBadgeResult] = useState<{
    username: string;
    status: 'loaded' | 'error';
  } | null>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { searches, addSearch, clearSearches, removeSearch } = useRecentSearches();
  const [mounted, setMounted] = useState(false);

  // Recent search avatar cache
  const [recentAvatars, setRecentAvatars] = useState<Record<string, string>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Prefetch avatars for recent searches
  useEffect(() => {
    searches.forEach((s) => {
      if (!recentAvatars[s]) {
        const url = `https://avatars.githubusercontent.com/${s}?size=40`;
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setRecentAvatars((prev) => ({ ...prev, [s]: url }));
        };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searches]);

  useGSAP(
    () => {
      if (!heroRef.current) return;

      gsap.to('.hero-text', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out',
        delay: 0.15,
      });

      gsap.to('.contribution-text', {
        backgroundPosition: '300% 50%',
        duration: 8,
        ease: 'none',
        repeat: -1,
      });
    },
    { scope: heroRef }
  );

  const trimmedUsername = username.trim();
  const debouncedUsername = useDebounce(trimmedUsername, 500);

  // Whether to show sample (torvalds) or user's actual badge
  const showSample = !hasUsername;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://commitpulse.vercel.app';
  const activeBadgeUser = showSample ? SAMPLE_USERNAME : debouncedUsername;
  // Sample always loads from production so it works in local dev without GITHUB_TOKEN.
  // The user's own badge uses the local API endpoint as expected.
  const badgeUrl = showSample
    ? `https://commitpulse.vercel.app/api/streak?user=${SAMPLE_USERNAME}`
    : `/api/streak?user=${debouncedUsername}`;
  const markdown = `![CommitPulse](${siteUrl}/api/streak?user=${trimmedUsername})`;
  const DownloadSVG = () => {
    const link = document.createElement('a');
    link.href = badgeUrl;
    link.download = `${debouncedUsername}-commitpulse-badge.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const badgeLoaded = badgeResult?.username === previewUsername && badgeResult?.status === 'loaded';
  const badgeError = badgeResult?.username === previewUsername && badgeResult?.status === 'error';

  // Derived — automatically false when debouncedUsername changes
  const badgeLoaded = badgeResult?.username === activeBadgeUser && badgeResult?.status === 'loaded';
  const badgeError = badgeResult?.username === activeBadgeUser && badgeResult?.status === 'error';

  // When switching from sample to user, reset badge result
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBadgeResult(null);
  }, [activeBadgeUser]);

  const copyToClipboard = async () => {
    if (trimmedUsername.length === 0) return;

    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      setCopied(false);
      return;
    }

    trackUser(trimmedUsername);
    addSearch(trimmedUsername);
    setCopied(true);
    setTimeout(() => {
      guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    setTimeout(() => setCopied(false), 50000);
  };

  const selectDemoUser = (name: string) => {
    setUsername(name);
    setInstantUsername(name);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmedUsername.length > 0) {
      setInstantUsername(trimmedUsername);
      trackUser(trimmedUsername);
      addSearch(trimmedUsername);
    }
  };

  // 4 Premium statistics cards schema
  const statsData = [
    {
      label: 'Current Streak',
      value: userDetails?.stats?.currentStreak ?? (previewUsername ? 0 : 12),
      icon: Flame,
      color: 'from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/20',
      glow: 'shadow-orange-500/10',
      unit: 'days',
    },
    {
      label: 'Longest Streak',
      value: userDetails?.stats?.longestStreak ?? (previewUsername ? 0 : 34),
      icon: Trophy,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-yellow-500/20',
      glow: 'shadow-yellow-500/10',
      unit: 'days',
    },
    {
      label: 'Contributions',
      value: userDetails?.stats?.totalContributions ?? (previewUsername ? 0 : 420),
      icon: GitCommit,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20',
      glow: 'shadow-emerald-500/10',
      unit: 'commits',
    },
    {
      label: 'Repositories',
      value: userDetails?.public_repos ?? (previewUsername ? 0 : 24),
      icon: Folder,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/20',
      glow: 'shadow-cyan-500/10',
      unit: 'repos',
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent font-sans text-black dark:text-white selection:bg-black/20 dark:selection:bg-white/20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[30%] w-[30%] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-6 mt-32">
        {/* ── Hero ── */}
        <div className="mb-16 text-center">
          <DiscordButton />

          <div ref={heroRef}>
            <h1 className="hero-text opacity-0 translate-y-10 mb-8 bg-gradient-to-br from-gray-900 via-black to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-500 bg-clip-text text-transparent text-5xl font-black tracking-tighter md:text-8xl pb-2">
              Elevate Your <br />{' '}
              <span className="contribution-text inline-block bg-[length:300%_300%] bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
                Contribution
              </span>{' '}
              Story.
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mx-auto max-w-2xl text-sm sm:text-lg leading-relaxed text-gray-600 dark:text-white/65 md:text-xl "
          >
            CommitPulse converts your GitHub commit history into a live, 3D animated badge. The more
            you commit, the taller your city grows! Embed it in your profile README with one line.
          </motion.p>
        </div>

        {/* ── Input + Badge Section ── */}
        <section className="mx-auto mb-32 max-w-4xl relative z-20" aria-label="Badge generator">
          <div className="rounded-3xl border border-black/5 bg-white/60 p-4 shadow-xl shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0a]/80 dark:shadow-2xl dark:shadow-black/50 md:p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                copyToClipboard();
              }}
              noValidate
            >
              {/* ── Demo username chips — Phase 5 ── */}
              <div className="mb-4">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-white/40">
                  Try a quick example
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Quick-start example usernames"
                >
                  {DEMO_USERNAMES.map((demo) => (
                    <button
                      key={demo}
                      type="button"
                      onClick={() => setUsername(demo)}
                      aria-label={`Try username ${demo}`}
                      aria-pressed={trimmedUsername === demo}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 ${
                        trimmedUsername === demo
                          ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 scale-[1.05]'
                          : 'border-black/10 bg-white text-gray-600 hover:border-emerald-400/40 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-[1.04] dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300'
                      } active:scale-[0.97]`}
                    >
                      <span className="opacity-50" aria-hidden="true">
                        @
                      </span>
                      {demo}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Input row ── */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {/* Phase 4 — enhanced input with avatar validation */}
                <UsernameInput
                  value={username}
                  onChange={setUsername}
                  onClear={() => setUsername('')}
                />

                {/* ── Action buttons ── */}
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  {/* Phase 3 — Primary CTA "Generate My Badge" */}
                  <button
                    type="submit"
                    id="generate-badge-btn"
                    suppressHydrationWarning
                    disabled={!mounted || trimmedUsername.length === 0}
                    aria-label={
                      trimmedUsername.length === 0
                        ? 'Enter a GitHub username to generate your badge'
                        : `Generate badge for ${trimmedUsername}`
                    }
                    className={`relative flex min-w-[180px] items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-300 transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
                      mounted && trimmedUsername.length > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.97] hover:from-emerald-400 hover:to-cyan-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-white/35 shadow-none'
                    }`}
                  >
                    {/* Shimmer overlay on active state */}
                    {mounted && trimmedUsername.length > 0 && (
                      <span
                        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        aria-hidden="true"
                      />
                    )}

                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Icons.Check /> Copied!
                        </motion.div>
                      ) : (
                        <motion.div
                          key="generate"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 10, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Icons.BadgeIcon /> Generate My Badge
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Secondary: Watch Dashboard */}
                  <Link
                    href={
                      mounted && trimmedUsername.length > 0 ? `/dashboard/${trimmedUsername}` : '/'
                    }
                    suppressHydrationWarning
                    aria-disabled={!mounted || trimmedUsername.length === 0}
                    aria-label={
                      trimmedUsername.length > 0
                        ? `View dashboard for ${trimmedUsername}`
                        : 'Enter a username to view dashboard'
                    }
                    onClick={(e) => {
                      if (!mounted || trimmedUsername.length === 0) {
                        e.preventDefault();
                      } else {
                        trackUser(trimmedUsername);
                        addSearch(trimmedUsername);
                      }
                    }}
                    className={`relative flex min-w-[160px] items-center justify-center gap-2 overflow-hidden rounded-2xl border px-6 py-4 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                      mounted && trimmedUsername.length > 0
                        ? 'border-black/10 bg-white text-black hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 shadow-sm'
                        : 'border-black/5 bg-gray-50 text-gray-400 dark:border-white/5 dark:bg-transparent dark:text-white/35'
                    }`}
                  >
                    Watch Dashboard
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* ── Phase 7: Enhanced recent searches with avatars ── */}
          {searches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 mb-6 mt-4"
              role="region"
              aria-label="Recent searches"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-[#A1A1AA]">
                Recent:
              </span>
              {searches.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.08)] bg-white pl-1.5 pr-2 py-1 text-xs text-gray-700 shadow-sm transition-all hover:border-black/20 hover:shadow-md group/pill dark:border-[rgba(255,255,255,0.08)] dark:bg-[#111] dark:text-white/70 dark:hover:border-[rgba(255,255,255,0.2)] dark:hover:text-white"
                >
                  {/* Avatar thumbnail */}
                  {recentAvatars[s] ? (
                    <img
                      src={recentAvatars[s]}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-[8px] font-bold text-white"
                      aria-hidden="true"
                    >
                      {s[0]?.toUpperCase()}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setUsername(s)}
                    aria-label={`Search again for ${s}`}
                    className="transition-colors hover:text-black dark:hover:text-white font-medium"
                  >
                    {s}
                  </button>

                  {/* Quick regenerate */}
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(s);
                      // Slight delay to allow state update before form submission
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 50);
                    }}
                    aria-label={`Regenerate badge for ${s}`}
                    className="rounded-full p-0.5 text-gray-400 hover:bg-emerald-500/15 hover:text-emerald-600 transition-all flex items-center justify-center dark:text-white/40 dark:hover:text-emerald-400"
                    title="Regenerate"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z" />
                    </svg>
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeSearch(s)}
                    className="rounded-full p-0.5 text-gray-300 hover:bg-red-500/15 hover:text-red-500 transition-all flex items-center justify-center dark:text-white/30 dark:hover:text-red-400"
                    aria-label={`Remove ${s} from recent searches`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                onClick={clearSearches}
                className="text-xs text-gray-400 underline hover:text-black transition-colors dark:text-[#A1A1AA] dark:hover:text-white"
                aria-label="Clear all recent searches"
              >
                Clear all
              </button>
            </motion.div>
          )}

          {/* ── Phase 6: Animated stats banner ── */}
          <div className="mt-6">
            <AnimatedStatsBanner
              showDemo={showSample}
              username={hasUsername ? debouncedUsername : undefined}
            />
          </div>

          {/* ── Badge Preview Area (Phase 2 — sample + Phase 9 — skeleton) ── */}
          <div className="group relative">
            <div
              className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-50 blur-2xl transition duration-1000 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div
              className="relative flex min-h-[480px] md:min-h-[520px] items-center justify-center overflow-hidden rounded-3xl border border-black/5 bg-white/50 p-8 backdrop-blur-xl shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a]/80"
              role="region"
              aria-label={
                showSample
                  ? 'Sample badge preview for torvalds'
                  : `Badge preview for ${debouncedUsername}`
              }
              aria-live="polite"
              aria-busy={!badgeLoaded && !badgeError && (hasUsername || showSample)}
            >
              {/* Sample preview label */}
              <AnimatePresence>
                {showSample && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 backdrop-blur-sm dark:text-amber-400">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"
                        aria-hidden="true"
                      />
                      Sample Preview — @torvalds
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full flex flex-col items-center justify-center gap-4">
                {/* Phase 9: Skeleton loader */}
                {!badgeLoaded && !badgeError && (
                  <div
                    className="h-[240px] w-full max-w-[700px] rounded-2xl overflow-hidden"
                    aria-label="Loading badge..."
                    role="status"
                  >
                    <div className="h-full w-full bg-black/5 dark:bg-white/5 relative overflow-hidden">
                      <div
                        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/[0.04] to-transparent dark:via-white/[0.07]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}

                {/* Error state (only for actual user search, not sample) */}
                {badgeError && hasUsername && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center gap-4 py-12 text-center"
                    role="alert"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10 shadow-inner">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        GitHub user not found
                      </p>
                      <p className="text-sm text-gray-500 dark:text-white/65 mt-1">
                        Please check the username and try again.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* The actual badge image */}
                <motion.img
                  key={badgeUrl}
                  data-testid="badge-img"
                  src={badgeUrl}
                  alt={
                    showSample
                      ? 'Sample CommitPulse badge showing torvalds GitHub contribution history'
                      : `CommitPulse badge for ${debouncedUsername}`
                  }
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: badgeLoaded ? 1 : 0, scale: badgeLoaded ? 1 : 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="w-full max-w-[700px] h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                  onLoad={() => setBadgeResult({ username: activeBadgeUser, status: 'loaded' })}
                  onError={() => setBadgeResult({ username: activeBadgeUser, status: 'error' })}
                />

                {/* CTA below sample: invite to generate own */}
                <AnimatePresence>
                  {showSample && badgeLoaded && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs text-gray-500 dark:text-white/50 text-center max-w-xs"
                    >
                      ↑ Enter your GitHub username above to generate your own 3D badge
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* ── Success guide after copy ── */}
        <div ref={guideRef}>
          <AnimatePresence>
            {copied && (
              <SuccessGuide
                markdown={markdown}
                username={trimmedUsername}
                onDismiss={() => setCopied(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Phase 8: How It Works ── */}
        <HowItWorks />

        <CustomizeCTA />

        <FeatureCardsSection>
          <FeatureCard
            icon={<Icons.Zap />}
            accent="text-white"
            accentColor="#10b981"
            index={0}
            title="Real-time Sync"
            desc="Pulled directly from GitHub GraphQL API. Your streak updates as fast as your code pushes."
          />
          <FeatureCard
            icon={<Icons.Copy />}
            accent="text-white"
            accentColor="#8b5cf6"
            index={1}
            title="Theme Engine"
            desc="Switch between Neon, Dracula, or custom HEX modes via simple URL management."
          />
          <FeatureCard
            icon={<Icons.Box />}
            accent="text-white"
            accentColor="#06b6d4"
            index={2}
            title="Isometric Math"
            desc="Sophisticated 3D projection formulas turn 2D data into digital architecture."
          />
        </FeatureCardsSection>

        <WallOfLove />

        <Footer />
      </main>
    </div>
  );
}

const STEPS = [
  {
    n: '01',
    title: 'Open Your Profile Repo',
    body: 'Navigate to github.com/YOUR_USERNAME/YOUR_USERNAME - your special profile repository.',
  },
  {
    n: '02',
    title: 'Edit README.md',
    body: "Click the pencil icon to open the file in GitHub's built-in editor.",
  },
  {
    n: '03',
    title: 'Paste the Snippet',
    body: 'Place your cursor wherever you want the monolith to appear, then paste (Ctrl+V / Cmd+V).',
  },
  {
    n: '04',
    title: 'Save & Ship It',
    body: 'Click "Commit changes" and visit your profile. Your 3D streak is now live.',
  },
];

function SuccessGuide({
  markdown,
  username,
  onDismiss,
}: {
  markdown: string;
  username: string;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      key="success-guide"
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="mx-auto mb-12 max-w-4xl"
      role="status"
      aria-label="Badge copied — deployment guide"
    >
      <div className="relative overflow-hidden rounded-xl border border-black/10 bg-white dark:border-[rgba(255,255,255,0.1)] dark:bg-[#0a0a0a]">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-full bg-white/3 blur-[80px]"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between border-b border-black/10 px-8 pb-6 pt-8 dark:border-white/5">
          <div className="flex items-center gap-4">
            <span className="relative mt-1 flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/40 opacity-40 dark:bg-white/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-black dark:bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            </span>
            <div>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-[#A1A1AA]">
                Markdown Copied
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
                Your Monolith is Ready - Deploy It in 4 Steps
              </h2>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="ml-4 mt-1 shrink-0 rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-black dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Dismiss guide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
          </button>
        </div>

        <div className="grid gap-px border-b border-black/10 bg-black/5 dark:border-white/5 dark:bg-white/5 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
              className="flex gap-4 bg-white p-6 dark:bg-[#050505]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-gray-100 text-xs font-bold tracking-widest text-gray-600 dark:border-[rgba(255,255,255,0.08)] dark:bg-[#111] dark:text-[#A1A1AA]">
                {step.n}
              </span>
              <div>
                <p className="mb-1 text-sm font-bold text-black dark:text-white">{step.title}</p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-500">
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-8 py-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-white/55">
            Your copied snippet
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-gray-100 px-4 py-3 font-mono text-sm dark:border-white/8 dark:bg-black/60">
            <span className="shrink-0 select-none text-gray-500 dark:text-[#A1A1AA]">$</span>
            <code className="flex-1 overflow-x-auto break-all leading-relaxed text-black dark:text-white/80">
              {markdown}
            </code>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-white/55">
            Tip: Add <code className="text-gray-700 dark:text-white/55">?accent=808080</code> to the
            URL to change your monolith&apos;s colour palette.
          </p>
          <div className="mt-8 flex justify-center border-t border-black/10 pt-6 dark:border-white/5">
            <Link href={`/dashboard/${username}`} onClick={() => trackUser(username)}>
              <span className="border border-black/10 bg-gray-100 px-6 py-2.5 rounded-lg text-sm font-semibold text-black transition-all duration-200 hover:bg-gray-200 hover:scale-[1.01] active:scale-[0.99] dark:border-[rgba(255,255,255,0.15)] dark:bg-white dark:text-black dark:hover:bg-zinc-100">
                Watch Your Dashboard
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
