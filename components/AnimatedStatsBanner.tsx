'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatItem {
  label: string;
  demoValue: number;
  suffix?: string;
  icon: React.ReactNode;
  accentClass: string;
  accentGlow: string;
}

const STATS: StatItem[] = [
  {
    label: 'Current Streak',
    demoValue: 42,
    suffix: 'd',
    icon: (
      <svg
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
        <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z" />
      </svg>
    ),
    accentClass: 'text-emerald-500',
    accentGlow: 'rgba(16,185,129,0.12)',
  },
  {
    label: 'Longest Streak',
    demoValue: 127,
    suffix: 'd',
    icon: (
      <svg
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
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    accentClass: 'text-cyan-500',
    accentGlow: 'rgba(6,182,212,0.12)',
  },
  {
    label: 'Total Contributions',
    demoValue: 3847,
    icon: (
      <svg
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
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    accentClass: 'text-purple-500',
    accentGlow: 'rgba(139,92,246,0.12)',
  },
  {
    label: 'Public Repos',
    demoValue: 58,
    icon: (
      <svg
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
        <path d="M3 3h18v18H3z" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    accentClass: 'text-orange-500',
    accentGlow: 'rgba(249,115,22,0.12)',
  },
];

function useCountUp(target: number, duration: number = 1200, active: boolean = false) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [target, duration, active]);

  return count;
}

function StatCard({ stat, active, delay }: { stat: StatItem; active: boolean; delay: number }) {
  const count = useCountUp(stat.demoValue, 1400, active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="group relative flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-black/5 bg-white/60 p-4 text-center backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.08] dark:bg-[#0a0a0a]/80"
      style={{
        boxShadow: `0 0 0 0 ${stat.accentGlow}`,
      }}
    >
      {/* Glow bg */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${stat.accentGlow}, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Icon */}
      <span className={`relative z-10 ${stat.accentClass}`}>{stat.icon}</span>

      {/* Animated number */}
      <AnimatePresence mode="wait">
        <motion.span
          key={active ? 'counted' : 'idle'}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 text-xl font-black tracking-tight text-gray-900 dark:text-white"
          aria-live="polite"
          aria-label={`${stat.label}: ${active ? count : '—'}${stat.suffix ?? ''}`}
        >
          {active ? `${count.toLocaleString()}${stat.suffix ?? ''}` : '—'}
        </motion.span>
      </AnimatePresence>

      {/* Label */}
      <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-white/40">
        {stat.label}
      </span>
    </motion.div>
  );
}

interface AnimatedStatsBannerProps {
  /** When true, show demo values with animated counters */
  showDemo: boolean;
  /** Username for the "View Dashboard" link */
  username?: string;
}

export function AnimatedStatsBanner({ showDemo, username }: AnimatedStatsBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isActive = showDemo && hasBeenVisible;

  return (
    <div ref={ref} className="mb-6">
      {/* Sample label */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 flex items-center justify-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              <span
                className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"
                aria-hidden="true"
              />
              Sample Stats — torvalds
            </span>
          </motion.div>
        )}
        {!showDemo && username && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 flex items-center justify-center"
          >
            <a
              href={`/dashboard/${username}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600 transition-all hover:border-emerald-400/60 hover:bg-emerald-400/20 dark:text-emerald-400"
            >
              View {username}&apos;s full dashboard
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat cards row */}
      <div
        className="flex flex-wrap gap-2 sm:flex-nowrap"
        role="region"
        aria-label={
          showDemo ? 'Sample GitHub statistics for torvalds' : `GitHub statistics for ${username}`
        }
      >
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} active={isActive} delay={i * 0.08} />
        ))}
      </div>
    </div>
  );
}
