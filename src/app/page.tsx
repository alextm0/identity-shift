import type { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';

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

export default function HomePage() {
  return <LandingPageClient />;
}
