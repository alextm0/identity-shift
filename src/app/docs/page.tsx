import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Activity, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center overflow-hidden relative">
      {/* Background - Deep obsidian with subtle radial gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--color-background)]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="container px-4 md:px-6 z-10 w-full max-w-4xl py-20">
        {/* Back Button */}
        <div className="mb-12">
          <Button variant="ghost" asChild className="text-[var(--color-secondary)] hover:text-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Manifesto Header */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70">
            The Manifesto
          </h1>
          <p className="text-xl text-[var(--color-secondary)] max-w-2xl mx-auto">
            Stop Lying To Yourself. Start Tracking Real Progress.
          </p>
        </div>

        {/* Manifesto Content */}
        <div className="space-y-8 mb-16">
          <section className="max-w-none">
            <h2 className="text-3xl font-bold text-white mb-4">The Problem</h2>
            <p className="text-lg text-[var(--color-secondary)] leading-relaxed mb-6">
              Most productivity apps reward planning over doing. They let you feel productive by creating lists, 
              setting goals, and organizing your life—without ever requiring proof that you actually did anything.
            </p>
            <p className="text-lg text-[var(--color-secondary)] leading-relaxed">
              This creates a dangerous illusion: you think you're making progress because you're planning progress. 
              But planning isn't progress. Planning is procrastination in disguise.
            </p>
          </section>

          <section className="max-w-none">
            <h2 className="text-3xl font-bold text-white mb-4">The Solution</h2>
            <p className="text-lg text-[var(--color-secondary)] leading-relaxed mb-6">
              This app forces radical honesty. Every day, you must log evidence of progress—or admit you did nothing. 
              No participation trophies. No "I planned to do X" without proof you did X.
            </p>
            <p className="text-lg text-[var(--color-secondary)] leading-relaxed">
              We compute an <span className="text-[var(--color-action-emerald)] font-semibold">Anti-Bullshit Score</span> that 
              detects performative productivity. It measures the gap between what you think you did and what you actually did. 
              The score doesn't lie.
            </p>
          </section>

          <section className="max-w-none">
            <h2 className="text-3xl font-bold text-white mb-4">Identity Shifting</h2>
            <p className="text-lg text-[var(--color-secondary)] leading-relaxed mb-6">
              Stop setting goals. Start embodying the person who achieves them naturally.
            </p>
            <p className="text-lg text-[var(--color-secondary)] leading-relaxed">
              Goals are future promises. Identity is present action. When you track daily evidence of who you're becoming, 
              you shift from planning your ideal self to being your ideal self—one day at a time.
            </p>
          </section>

          {/* Core Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="border-white/10 hover:border-white/20 transition-all">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg glass-panel border-white/10">
                  <ShieldCheck className="h-6 w-6 text-[var(--color-action-emerald)]" />
                </div>
                <CardTitle className="text-lg mb-2 text-white">Radical Honesty</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Log daily evidence or admit you did nothing. No excuses, no participation trophies.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 hover:border-white/20 transition-all">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg glass-panel border-white/10">
                  <Activity className="h-6 w-6 text-[var(--color-focus-violet)]" />
                </div>
                <CardTitle className="text-lg mb-2 text-white">Anti-Bullshit Score</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  An algorithmic score (0-100) that detects performative productivity and alerts you.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 hover:border-white/20 transition-all">
              <CardHeader>
                <div className="mb-4 p-3 w-fit rounded-lg glass-panel border-white/10">
                  <Target className="h-6 w-6 text-[var(--color-motion-amber)]" />
                </div>
                <CardTitle className="text-lg mb-2 text-white">Identity Shifting</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Stop setting goals. Start embodying the person who achieves them naturally.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-12 border-t border-white/10">
          <p className="text-lg text-[var(--color-secondary)] mb-6">
            Ready to stop lying to yourself?
          </p>
          <Button size="lg" variant="default" className="text-base" asChild>
            <Link href="/auth/sign-in">
              Start Tracking <Zap className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

