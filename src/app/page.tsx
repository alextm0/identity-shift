import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Identity Shifter - Anti-Bullshit Progress Tracker',
  description: 'Track daily evidence. Measure your real impact. Shift your identity from planning to doing. Stop guessing, see what you actually do.',
  keywords: ['habit tracking', 'progress tracker', 'accountability', 'goals', 'identity shift', 'productivity', 'sprints'],
  openGraph: {
    title: 'Identity Shifter - Track Promises, Not Streaks',
    description: 'Stop guessing. See what you actually do. Track daily evidence and shift your identity from planning to doing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Identity Shifter - Track Promises, Not Streaks',
    description: 'Stop guessing. See what you actually do.',
  },
};

// Dynamically import the heavy client component with animations
// This reduces initial bundle size and improves performance
const LandingPageClient = dynamic(
  () => import('@/components/landing/LandingPageClient').then(mod => ({ default: mod.default })),
  {
    ssr: true, // Still render on server for SEO, but with reduced overhead
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return <LandingPageClient />;
}
