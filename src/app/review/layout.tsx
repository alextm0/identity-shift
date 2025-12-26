/**
 * Review Layout
 * 
 * Full-screen immersive layout with no sidebar or navigation.
 * Provides a focused experience for completing the yearly review.
 * Shared by both /review (wizard) and /review/[year] (view) routes.
 */

interface ReviewLayoutProps {
  children: React.ReactNode;
}

export default function ReviewLayout({
  children,
}: ReviewLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Background Blooms */}
      <div className="bg-blooms pointer-events-none fixed inset-0 z-[-1]">
        <div className="bloom-violet" />
        <div className="bloom-emerald" />
      </div>

      {/* Full-screen content - no sidebar */}
      <main className="min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}

