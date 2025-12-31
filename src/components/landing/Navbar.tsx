'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth/client';
import { Activity, Menu, X, User } from 'lucide-react';

export function Navbar() {
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
      <div className="container mx-auto px-6">
        <div className={`glass-panel border-white/5 rounded-xl px-5 py-2.5 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'bg-black/60 backdrop-blur-2xl shadow-2xl scale-[0.98]' : 'bg-transparent'}`}>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-focus-violet)] flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Identity Shift</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {!isPending && (
              <>
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button size="sm" className="bg-[var(--color-focus-violet)] hover:bg-[var(--color-focus-violet)]/90">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/sign-in">
                      <Button variant="ghost" size="sm" className="text-white hover:text-white/80">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm" className="bg-[var(--color-focus-violet)] hover:bg-[var(--color-focus-violet)]/90">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 glass-panel bg-black/90 backdrop-blur-2xl border-white/5 rounded-xl p-4 space-y-3">
            {!isPending && (
              <>
                {isAuthenticated ? (
                  <Link href="/dashboard" className="block">
                    <Button size="sm" className="w-full bg-[var(--color-focus-violet)] hover:bg-[var(--color-focus-violet)]/90">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/sign-in" className="block">
                      <Button variant="ghost" size="sm" className="w-full text-white hover:text-white/80">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up" className="block">
                      <Button size="sm" className="w-full bg-[var(--color-focus-violet)] hover:bg-[var(--color-focus-violet)]/90">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
