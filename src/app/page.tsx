'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, Variants, MotionValue } from 'framer-motion';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Target,
  Zap,
  BarChart3,
  Layers,
  Fingerprint,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth/client';

// --- Background Components ---

function BackgroundShapes({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const y1 = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4], [0.03, 0.05, 0.04]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.2, 0.4], [0.02, 0.04, 0.06]);
  const color1 = useTransform(scrollYProgress, [0, 0.4], ["rgba(139, 92, 246, 0.2)", "rgba(167, 139, 250, 0.15)"]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary Glow */}
      <motion.div
        style={{ y: y1, opacity: opacity1, backgroundColor: color1 }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px]"
      />

      {/* Secondary Glow */}
      <motion.div
        style={{ y: y2, opacity: opacity2 }}
        animate={{
          scale: [1.05, 1, 1.05],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[140px]"
      />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />
    </div>
  );
}

// --- Navigation ---

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthenticated = session?.session && session?.user;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'
      }`}>
      <div className="container mx-auto px-6">
        <div className={`glass-panel border-white/5 rounded-xl px-5 py-2.5 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'bg-black/60 backdrop-blur-2xl shadow-2xl scale-[0.98]' : 'bg-transparent'
          }`}>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-focus-violet)] flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Identity Shift</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-[var(--color-secondary)] hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[var(--color-secondary)] hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              How it works
            </a>
            <Link
              href="/docs"
              className="text-sm font-medium text-[var(--color-secondary)] hover:text-white transition-colors"
            >
              Manifesto
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isPending ? (
              <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Link href="/account/settings">
                  <div className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors cursor-pointer">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/sign-in">Log in</Link>
                </Button>
                <Button variant="violet" size="sm" className="rounded-xl shadow-violet-500/20 shadow-lg" asChild>
                  <Link href="/auth/sign-up">Get started free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-6 right-6 mt-2 glass-panel border-white/10 rounded-2xl p-6 bg-black/90 backdrop-blur-2xl z-40"
        >
          <div className="flex flex-col gap-4">
            <a
              href="#features"
              className="text-lg font-medium text-[var(--color-secondary)] hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-lg font-medium text-[var(--color-secondary)] hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              How it works
            </a>
            <Link
              href="/docs"
              className="text-lg font-medium text-[var(--color-secondary)] hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Manifesto
            </Link>
            <hr className="border-white/10 my-2" />
            {isPending ? (
              <div className="h-10 w-full rounded-lg bg-white/5 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Button variant="glass" className="w-full" asChild>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/account/settings" onClick={() => setIsMobileMenuOpen(false)}>Account Settings</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/auth/sign-in" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                </Button>
                <Button variant="violet" className="w-full" asChild>
                  <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>Get started free</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// --- Visual Components ---

const heroData = [
  { name: 'Mon', intention: 8, evidence: 2, gap: [2, 8] },
  { name: 'Tue', intention: 9, evidence: 4, gap: [4, 9] },
  { name: 'Wed', intention: 7, evidence: 8, gap: [7, 8] },
  { name: 'Thu', intention: 8, evidence: 3, gap: [3, 8] },
  { name: 'Fri', intention: 9, evidence: 5, gap: [5, 9] },
  { name: 'Sat', intention: 6, evidence: 7, gap: [6, 7] },
  { name: 'Sun', intention: 8, evidence: 4, gap: [4, 8] },
];

function HeroVisual() {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center p-0 md:p-4">
      {/* Background Glow for Visual */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-transparent to-emerald-500/10 rounded-[3rem] blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full h-full glass-panel border-white/10 rounded-[2.5rem] p-6 md:p-8 flex flex-col relative bg-black/40 shadow-2xl overflow-hidden"
      >
        {/* Top Header for the Visual */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div>
            <h3 className="text-white font-bold text-lg md:text-xl tracking-tight">The Evidence Gap</h3>
            <p className="text-white/40 text-[11px] md:text-xs font-medium mb-4 leading-relaxed tracking-wide">A week of plans vs a week of proof.</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-3 md:gap-4">
              <div className="flex items-center gap-1.5 opacity-50">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500/40" />
                <span className="text-[9px] md:text-[11px] font-mono text-white/50 uppercase font-bold tracking-wider">PLAN</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-50">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                <span className="text-[9px] md:text-[11px] font-mono text-white/50 uppercase font-bold tracking-wider">PROOF</span>
              </div>
            </div>

            {/* Insight Card - Refined */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="glass-panel border-white/5 p-2.5 md:p-3 rounded-xl bg-violet-500/[0.03] backdrop-blur-xl z-20 max-w-[140px] md:max-w-[170px] border-l-violet-500/20 shadow-none relative overflow-visible"
            >
              {/* Tiny Badge - Muted Red/Rose for Mismatch */}
              <div className="absolute -top-2 -right-2 bg-zinc-900 text-rose-400/80 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                Mismatch: 42%
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-bold text-violet-400/50 uppercase tracking-[0.2em]">INSIGHT</span>
              </div>
              <p className="text-[10px] md:text-[11px] text-white/60 font-medium leading-snug">
                This week: 42% of plans had no proof.
              </p>
            </motion.div>
          </div>
        </div>

        {/* The Chart - Maximized space with gap visualization */}
        <div className="flex-1 w-full relative z-10 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={heroData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIntention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.05} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEvidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.05} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGapFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
                dy={10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length >= 2) {
                    const plan = payload.find(p => p.name === 'PLAN')?.value as number;
                    const proof = payload.find(p => p.name === 'PROOF')?.value as number;
                    const gap = Math.abs(plan - proof);
                    return (
                      <div className="glass-panel bg-black/95 border border-white/10 p-3 rounded-xl backdrop-blur-xl shadow-2xl min-w-[120px]">
                        <p className="text-[10px] text-white/40 font-bold mb-2 uppercase tracking-widest">{label}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-bold text-violet-400/40 uppercase">PLAN</span>
                            <span className="text-[11px] font-mono font-bold text-violet-300/60">{plan}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-[10px] font-bold text-emerald-400/40 uppercase">PROOF</span>
                            <span className="text-[11px] font-mono font-bold text-emerald-300/60">{proof}</span>
                          </div>
                          <div className="pt-1.5 border-t border-white/5 flex justify-between items-center gap-4">
                            <span className="text-[10px] font-bold text-violet-400 uppercase">GAP</span>
                            <span className="text-[11px] font-mono font-bold text-violet-400">{gap}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Shaded GAP region */}
              <Area
                type="monotone"
                dataKey="gap"
                stroke="rgba(139, 92, 246, 0.15)"
                strokeWidth={1}
                fill="url(#colorGapFill)"
                fillOpacity={1}
                animationDuration={2000}
                name="GAP"
              />

              {/* Proof line - Glowing Green (Muted) */}
              <Area
                type="monotone"
                dataKey="evidence"
                name="PROOF"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEvidence)"
                animationDuration={2500}
              />

              {/* Plan line - Muted Purple */}
              <Area
                type="monotone"
                dataKey="intention"
                name="PLAN"
                stroke="rgba(139, 92, 246, 0.25)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIntention)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Comparison - Hierarchy shift (Refined with subtle color) */}
        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-8 relative z-10">
          {/* Neutralized Left Side */}
          <div className="space-y-2.5 opacity-30">
            <div>
              <span className="text-[9px] font-medium text-white uppercase tracking-[0.1em] block mb-1.5 leading-tight">MOST HABIT TRACKERS REWARD CHECK‑INS</span>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[11px] text-white/50">Check‑ins logged</span>
                <span className="text-[12px] font-mono text-white/40">90%</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[90%] bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Refined Right Side - Glowing Green */}
          <div className="space-y-2.5">
            <div>
              <span className="text-[9px] font-medium text-emerald-400/60 uppercase tracking-[0.1em] block mb-1.5 leading-tight">IDENTITY‑SHIFT MEASURES SELF‑TRUST</span>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[11px] text-white/70">Promises kept</span>
                <span className="text-[12px] font-mono text-emerald-400/60">45%</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "45%" }}
                transition={{ duration: 1.5, delay: 1.2 }}
                className="h-full bg-emerald-500/40 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Bottom line - Clean action point (Neutralized but readable) */}
        <div className="mt-5 pt-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-white/10 font-medium tracking-[0.05em] uppercase leading-relaxed">
            MOST APPS REWARD CONSISTENCY. THIS REWARDS HONESTY.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const shouldReduceMotion = useReducedMotion();

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[var(--color-background)] selection:bg-[var(--color-focus-violet)]/30">
      <BackgroundShapes scrollYProgress={scrollYProgress} />
      <Navbar />

      <main className="container px-6 z-10 w-full max-w-7xl pt-20">
        {/* Hero Section */}
        <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 md:py-20 min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-start text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-white">
                Stop guessing. <br />
                <span className="text-white/90">See what you <span className="text-white font-bold">actually</span> do.</span>
              </h1>

              <p className="text-base md:text-lg text-white/40 max-w-lg leading-relaxed font-medium">
                Plan your first sprint to expose the gap between intention and action. <br className="hidden md:block" />
                Track promises kept—not streaks.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-start gap-6 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="space-y-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Button size="lg" variant="violet" className="h-14 px-10 text-base md:text-lg rounded-2xl shadow-2xl shadow-violet-500/40 font-bold scale-105 hover:scale-110 transition-transform" asChild>
                    <Link href="/auth/sign-in">
                      Plan your first sprint
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-sm md:text-base rounded-2xl border-white/10 bg-transparent text-white/30 hover:text-white hover:bg-white/5 font-medium" asChild>
                    <Link href="/docs">
                      Read the principles
                    </Link>
                  </Button>
                </div>

                <p className="text-xs text-white/30 font-medium tracking-tight pl-1">
                  You’ll leave with 3 priorities + your next sprint.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="relative w-full max-w-xl mx-auto lg:ml-auto lg:mr-0">
            <HeroVisual />
          </div>

          {/* Scroll Cue */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, 5, 5, 10] }}
            transition={{
              duration: 3,
              times: [0, 0.2, 0.8, 1],
              repeat: 0,
              delay: 2
            }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Scroll</span>
            <ChevronDown className="h-4 w-4 text-white/20" />
          </motion.div>
        </section>

        {/* Feature Bento Grid */}
        <motion.section
          id="features"
          className="py-24 space-y-16 scroll-mt-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="text-center space-y-4" variants={titleVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Built for Radical Accountability</h2>
            <p className="text-white/40 text-lg font-medium">
              Most apps track check-ins. This tracks proof.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
            {/* Card 1: Proof Log */}
            <motion.div
              variants={itemVariants}
              whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.005, transition: { duration: 0.2 } }}
              className="md:col-span-8 glass-panel border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative group min-h-[280px] transition-colors duration-300"
            >
              <div className="absolute top-0 right-0 p-6 text-violet-500/5 group-hover:text-violet-500/10 transition-colors duration-500">
                <ShieldCheck className="h-40 w-40 rotate-12" />
              </div>
              <div className="z-10 max-w-md space-y-3">
                <motion.div
                  className="p-1.5 w-fit rounded-lg bg-violet-500/5 text-violet-500/30 group-hover:text-violet-500/50 group-hover:bg-violet-500/10 transition-all duration-300"
                >
                  <ShieldCheck className="h-4 w-4" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Proof Log</h3>
                <p className="text-white/60 text-base leading-relaxed">
                  Log what happened—not what you hoped. Missed days don’t break you. They reveal the pattern.
                </p>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest pt-1">
                  Truth beats perfect streaks.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Reality Score (FEATURED) */}
            <motion.div
              variants={itemVariants}
              whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.005, transition: { duration: 0.2 } }}
              className="md:col-span-4 glass-panel border-white/20 ring-1 ring-violet-500/20 bg-violet-500/[0.03] shadow-[inset_0_0_20px_rgba(139,92,246,0.02)] rounded-2xl p-6 space-y-4 overflow-hidden relative min-h-[280px] group transition-all duration-300 hover:border-white/30 hover:shadow-[inset_0_0_30px_rgba(139,92,246,0.05)]"
            >
              <div className="p-1.5 w-fit rounded-lg bg-violet-500/10 text-violet-500/60 group-hover:text-violet-500/80 transition-colors duration-300">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Reality Score</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  A single number that rises when actions match the plan. Falls when it’s all talk.
                </p>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest pt-0.5">
                  Consistency ≠ progress.
                </p>
              </div>

              <div className="pt-4 relative">
                <div className="h-20 w-full flex items-end gap-1.5 px-1">
                  {[40, 70, 45, 90, 65, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`w-full rounded-t-sm bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors duration-300`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-mono text-white/10 uppercase tracking-widest">
                  <span>Intention</span>
                  <span className="text-violet-400/40 font-bold">Reality: 85</span>
                  <span>Action</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Identity Check */}
            <motion.div
              variants={itemVariants}
              whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.005, transition: { duration: 0.2 } }}
              className="md:col-span-4 glass-panel border-white/5 hover:border-white/10 rounded-2xl p-6 space-y-4 min-h-[280px] flex flex-col transition-colors duration-300 group"
            >
              <div className="p-1.5 w-fit rounded-lg bg-violet-500/5 text-violet-500/30 group-hover:text-violet-500/50 group-hover:bg-violet-500/10 transition-all duration-300">
                <Target className="h-4 w-4" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-bold text-white">Identity Check</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Who are you becoming based on evidence? Adjust one thing for the next sprint.
                </p>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest pt-0.5">
                  One change. Then move.
                </p>
              </div>
            </motion.div>

            {/* Card 4: Private by default */}
            <motion.div
              variants={itemVariants}
              whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.005, transition: { duration: 0.2 } }}
              className="md:col-span-8 glass-panel border-white/5 hover:border-white/10 rounded-2xl p-6 flex items-center gap-6 group min-h-[280px] transition-colors duration-300"
            >
              <div className="hidden lg:flex flex-shrink-0 w-24 h-24 rounded-2xl bg-white/5 items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors duration-300">
                <Fingerprint className="h-10 w-10 text-violet-500/10 group-hover:text-violet-500/30 transition-colors duration-300" />
              </div>
              <div className="space-y-3">
                <div className="lg:hidden p-1.5 w-fit rounded-lg bg-violet-500/5 text-violet-500/30 group-hover:text-violet-500/50 group-hover:bg-violet-500/10 transition-all duration-300">
                  <Fingerprint className="h-4 w-4" />
                </div>
                <h3 className="text-2xl font-bold text-white">Private by default</h3>
                <p className="text-white/60 text-base leading-relaxed">
                  Your reflections stay yours. The system only needs minimal signals to show the gap.
                </p>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest pt-0.5">
                  Control stays with you.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Steps Section */}
        <section id="how-it-works" className="py-16 border-t border-white/5 scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Three Simple Steps <br />
                <span className="text-white/30">to Organized Bliss.</span>
              </h2>

              <div className="space-y-8">
                {[
                  { step: "01", title: "Review Your Year", desc: "Start with a brutal audit of your last 12 months. Where did the time actually go?" },
                  { step: "02", title: "Define Your Identity", desc: "Choose 3 key traits you will embody. Not goals, but ways of being." },
                  { step: "03", title: "Log Daily Evidence", desc: "Spend 120 seconds every night proving you are who you say you are." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-5"
                  >
                    <span className="text-3xl font-black text-white/5 mt-1 font-mono">{item.step}</span>
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-white">{item.title}</h4>
                      <p className="text-[var(--color-secondary)] text-sm font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-focus-violet)]/5 blur-[80px] -z-10" />
              <div className="glass-panel border-white/5 rounded-3xl p-3 shadow-2xl overflow-hidden rotate-1 hover:rotate-0 transition-transform duration-700">
                <div className="bg-black/40 rounded-2xl p-6 aspect-square flex flex-col justify-center gap-5">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-emerald-500/20 rounded-full" />
                    <div className="h-6 w-48 bg-white/5 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-violet-500/20 rounded-full" />
                    <div className="h-6 w-36 bg-white/5 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-amber-500/20 rounded-full" />
                    <div className="h-6 w-44 bg-white/5 rounded-md" />
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-white/20 text-[10px] font-mono tracking-widest uppercase">Identity Alignment</span>
                    <span className="text-emerald-500 text-lg font-bold">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Friction Section */}
        <motion.section
          id="friction"
          className="py-24 px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-5xl mx-auto glass-panel border-white/5 p-12 md:p-16 bg-white/[0.01] rounded-[3rem] relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 text-left">
                <motion.div className="space-y-4" variants={titleVariants}>
                  <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Integrity beats streaks.</h2>
                  <p className="text-white/40 text-lg font-medium">Track promises kept—not performative check-ins.</p>
                  <div className="w-12 h-0.5 bg-violet-500/30" />
                </motion.div>

                <motion.div
                  className="space-y-8"
                  variants={containerVariants}
                >
                  {[
                    { id: "01", title: "No streaks.", desc: "We care about honesty, not consistency for consistency's sake." },
                    { id: "02", title: "No dopamine hacks.", desc: "No fire emojis or fake celebrations. Just your raw output." },
                    { id: "03", title: "Just the truth.", desc: "If you aren't ready to see your own failures, don't sign up." }
                  ].map((item) => (
                    <motion.div key={item.id} className="group" variants={itemVariants}>
                      <div className="flex gap-4 items-start">
                        <span className="text-white/20 font-mono text-sm pt-1">{item.id}</span>
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">{item.title}</h4>
                          <p className="text-white/40 text-sm font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                  <p className="text-white/60 text-base leading-relaxed font-medium pt-4 border-t border-white/5">
                    We don't optimize for retention; we optimize for <span className="text-white underline decoration-violet-500/30 underline-offset-4">integrity</span>.
                  </p>
                  <Link
                    href="/auth/sign-in"
                    className="group flex items-center gap-2 text-sm font-bold text-violet-400/80 hover:text-violet-400 transition-colors"
                  >
                    Start your first sprint
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>

              <motion.div
                className="relative"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-violet-500/5 blur-[100px] -z-10" />
                <motion.div
                  whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                  className="glass-panel border-white/10 hover:border-white/20 bg-black/40 rounded-[2rem] p-6 md:p-8 shadow-2xl transition-all duration-300"
                >
                  {/* Title - Eye-catching */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">The Proof is in the Data.</h3>
                    <div className="w-16 h-0.5 bg-violet-500/40" />
                  </div>

                  {/* 7-Day Timeline - Compact Design */}
                  <div className="space-y-6">
                    {/* Day Labels - Compact */}
                    <div className="grid grid-cols-7 gap-1.5 px-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div key={day} className="text-center">
                          <span className="text-[9px] font-mono text-white/25 font-semibold">{day}</span>
                        </div>
                      ))}
                    </div>

                    {/* Streak Apps - Muted */}
                    <div className="space-y-3 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Most Habit Trackers</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <div className="space-y-2.5 px-2">
                        <div className="flex items-center gap-3 group/row relative">
                          <span className="text-[10px] font-mono text-white/30 w-16 text-left">Logged</span>
                          <div className="flex-1 flex items-center justify-between gap-1.5">
                            {[true, true, true, true, true, true, true].map((done, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                                className="w-6 h-6 rounded-full flex-shrink-0 bg-white/5 border border-white/5 group-hover/row:border-white/10 transition-colors"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group/row relative">
                          <span className="text-[10px] font-mono text-white/30 w-16 text-left">Meaningful</span>
                          <div className="flex-1 flex items-center justify-between gap-1.5">
                            {[true, false, false, true, false, false, false].map((done, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + i * 0.05 }}
                                className={`w-6 h-6 rounded-full flex-shrink-0 border transition-all ${done ? 'bg-violet-500/20 border-violet-500/30' : 'bg-white/5 border-white/5'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Identity-Shift - Highlighted */}
                    <div className="space-y-3 relative">
                      <div className="absolute inset-0 bg-violet-500/[0.02] rounded-xl -mx-2 -my-1 border border-violet-500/10" />

                      <div className="flex items-center gap-2 mb-3 relative z-10">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          Identity-Shift
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-mono">CORE</span>
                        </span>
                        <div className="h-px flex-1 bg-violet-500/10" />
                      </div>
                      <div className="space-y-2.5 px-2 relative z-10">
                        <div className="flex items-center gap-3 group/col relative">
                          <span className="text-[10px] font-mono text-white/50 w-16 text-left">Promises</span>
                          <div className="flex-1 flex items-center justify-between gap-1.5">
                            {[true, true, false, true, true, false, true].map((done, i) => {
                              const isMiss = !done;
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.7 + i * 0.05 }}
                                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${isMiss
                                    ? 'bg-zinc-800/50 border border-white/5'
                                    : 'bg-violet-500/40 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.1)]'
                                    }`}
                                >
                                  {isMiss && (
                                    <span className="text-[8px] text-white/20 font-bold">×</span>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group/col relative">
                          <span className="text-[10px] font-mono text-white/50 w-16 text-left">Meaningful</span>
                          <div className="flex-1 flex items-center justify-between gap-1.5">
                            {[true, true, false, true, true, false, true].map((done, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 + i * 0.05 }}
                                className={`w-7 h-7 rounded-full flex-shrink-0 transition-all border ${done
                                  ? 'bg-violet-500/60 border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                  : 'bg-white/5 border-white/5'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="mt-6 pt-5 border-t border-white/5">
                    <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">
                      Streaks measure volume. Integrity measures trust.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          className="py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="glass-panel border-white/5 rounded-[2.5rem] p-12 md:p-20 text-center space-y-8 bg-gradient-to-br from-violet-600/[0.03] via-transparent to-violet-600/[0.03] relative overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-violet-500/[0.02] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-500/[0.02] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                  Ready to see <br />
                  <span className="text-white/20 italic font-medium">the truth?</span>
                </h2>
                <p className="text-lg text-white/40 font-medium leading-relaxed">
                  Plan your first sprint and see the gap between intention and action.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  variant="violet"
                  className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-violet-500/20 font-bold transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-violet-500/30"
                  asChild
                >
                  <Link href="/auth/sign-up">Start your first sprint</Link>
                </Button>
                <p className="text-xs text-white/10 font-bold tracking-[0.2em] uppercase">
                  No streaks. Just proof you can trust.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-16 mt-12 bg-black/20">
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5 opacity-80">
                <Activity className="h-5 w-5 text-violet-500" />
                <span className="text-lg font-bold text-white tracking-tight">Identity Shift</span>
              </div>
              <p className="text-xs text-white/20 font-medium max-w-[200px] leading-relaxed">
                A quiet system for those who value honesty over performance.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">Product</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/docs" className="text-sm text-white/30 hover:text-white transition-colors">Manifesto</Link>
                </li>
              </ul>
            </div>

            {/* Legal + Social */}
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">Legal</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link href="#" className="text-sm text-white/30 hover:text-white transition-colors">Privacy</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-white/30 hover:text-white transition-colors">Terms</Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">Social</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link href="#" className="text-sm text-white/30 hover:text-white transition-colors">GitHub</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-white/10 font-medium tracking-wide">
              © 2026 Identity Shift. Proof over streaks.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Remove the old FeatureCard since it's now part of the bento grid or replaced

