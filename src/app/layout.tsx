import { authClient } from '@/lib/auth/client';
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react/ui';
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
  style: "italic",
});

export const metadata: Metadata = {
  title: {
    default: 'Identity Shifter - Anti-Bullshit Progress Tracker',
    template: '%s | Identity Shifter',
  },
  description: 'Track daily evidence. Measure your real impact. Shift your identity from planning to doing.',
  keywords: ['habit tracking', 'progress tracker', 'accountability', 'goals', 'identity shift', 'productivity'],
  authors: [{ name: 'Identity Shifter' }],
  creator: 'Identity Shifter',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Identity Shifter - Track Promises, Not Streaks',
    description: 'Stop guessing. See what you actually do. Track daily evidence and shift your identity from planning to doing.',
    siteName: 'Identity Shifter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Identity Shifter - Track Promises, Not Streaks',
    description: 'Stop guessing. See what you actually do.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

// Force dynamic rendering: this layout reads request headers (nonce) which
// are per-request and therefore incompatible with static pre-rendering.
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the nonce that our CSP Middleware injected into this request's headers.
  // Next.js uses the `nonce` prop on <html> to stamp its own inline scripts,
  // making them compliant with the `script-src 'nonce-...'` CSP directive.
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning nonce={nonce}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased`}>
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/account/settings"
          emailOTP
        >
          <div className="min-h-screen">
            <main>
              {children}
            </main>
          </div>
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
          />
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
