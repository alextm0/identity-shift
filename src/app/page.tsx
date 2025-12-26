'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Activity, Target, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background - Deep obsidian with subtle radial gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--color-background)]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="container px-4 md:px-6 z-10 w-full max-w-7xl">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-2 rounded-full glass-panel border-white/10 text-[var(--color-primary)] text-sm font-medium">
              <Sparkles className="inline h-4 w-4 mr-2" />
              v1.0 Public Beta
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-5xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Stop Lying <br />
            <span className="text-[var(--color-focus-violet)]">To Yourself.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-[var(--color-secondary)] max-w-[42rem] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            The Anti-Bullshit Progress Tracker. Track daily evidence.
            Measure your real impact. Shift your identity from <span className="text-[var(--color-motion-amber)]">planning</span> to <span className="text-[var(--color-action-emerald)]">doing</span>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button size="lg" variant="default" className="text-base" asChild>
              <Link href="/auth/sign-in">
                Start Tracking <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" className="text-base" asChild>
              <Link href="/docs">
                Read the Manifesto
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          <FeatureCard
            delay={0.6}
            icon={<ShieldCheck className="h-8 w-8 text-[var(--color-action-emerald)]" />}
            title="Radical Honesty"
            description="No participation trophies. Log daily evidence of progress, or admit you did nothing."
          />
          <FeatureCard
            delay={0.7}
            icon={<Activity className="h-8 w-8 text-[var(--color-focus-violet)]" />}
            title="Anti-Bullshit Score"
            description="An algorithmic score (0-100) that detects performative productivity and alerts you."
          />
          <FeatureCard
            delay={0.8}
            icon={<Target className="h-8 w-8 text-[var(--color-motion-amber)]" />}
            title="Identity Shifting"
            description="Stop setting goals. Start embodying the person who achieves them naturally."
          />
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full border-white/10 hover:border-white/20 transition-all duration-300">
        <CardHeader>
          <div className="mb-4 p-3 w-fit rounded-lg glass-panel border-white/10">
            {icon}
          </div>
          <CardTitle className="text-xl mb-2 text-white">{title}</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
