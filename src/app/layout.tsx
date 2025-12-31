import { authClient } from '@/lib/auth/client';
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react/ui';
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
  style: "italic",
});

export const metadata: Metadata = {
  title: 'Identity Shifter - Anti-Bullshit Progress Tracker',
  description: 'Track daily evidence. Measure your real impact. Shift your identity from planning to doing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
          <Toaster position="bottom-right" theme="dark" richColors closeButton />
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
