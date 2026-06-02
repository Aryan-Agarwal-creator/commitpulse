'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Enter GitHub Username',
    description: 'Type any GitHub username into the search field above.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    accent: 'from-emerald-500 to-cyan-500',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    number: '02',
    title: 'Generate Badge',
    description: 'Click "Generate My Badge" and watch your 3D city materialise instantly.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
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
    accent: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.15)',
  },
  {
    number: '03',
    title: 'Copy the Snippet',
    description: 'Hit copy and the Markdown snippet lands on your clipboard automatically.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
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
    accent: 'from-blue-500 to-purple-500',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    number: '04',
    title: 'Add to README',
    description: 'Paste into your GitHub profile README.md and commit. Your badge is live.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 18v-6" />
        <path d="M9 15l3 3 3-3" />
      </svg>
    ),
    accent: 'from-purple-500 to-pink-500',
    glow: 'rgba(236,72,153,0.15)',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} aria-labelledby="how-it-works-heading" className="mx-auto mb-24 max-w-4xl">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
          Getting Started
        </p>
        <h2
          id="how-it-works-heading"
          className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-3xl"
        >
          Live in under 60 seconds
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/60">
          Four steps from zero to a live 3D badge on your GitHub profile.
        </p>
      </motion.div>

      {/* Step cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
      >
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <motion.div
            key={step.number}
            variants={cardVariants}
            role="listitem"
            className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white/60 p-6 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-white/[0.08] dark:bg-[#0a0a0a]/80"
            style={{
              boxShadow: `0 0 0 0 ${step.glow}`,
            }}
            whileHover={{
              boxShadow: `0 8px 32px ${step.glow}`,
            }}
          >
            {/* Connector line (desktop only, not on last item) */}
            {index < HOW_IT_WORKS_STEPS.length - 1 && (
              <div
                className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-gray-300 dark:text-white/20"
                >
                  <path
                    d="M4 8h8M9 5l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Background glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${step.glow}, transparent 70%)`,
              }}
              aria-hidden="true"
            />

            {/* Step number pill */}
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${step.accent} text-xs font-black text-white shadow-sm`}
                aria-hidden="true"
              >
                {step.number}
              </span>
              {/* Icon */}
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${step.accent} bg-opacity-10 text-white shadow-sm`}
                style={{
                  background: `linear-gradient(135deg, ${step.glow.replace('0.15', '0.25')}, ${step.glow.replace('0.15', '0.1')})`,
                }}
              >
                <span className="text-gray-700 dark:text-white/80">{step.icon}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-1.5 text-sm font-bold tracking-tight text-gray-900 dark:text-white">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-xs leading-relaxed text-gray-500 dark:text-white/55">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
