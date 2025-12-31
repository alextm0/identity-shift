import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4 text-white">Page Not Found</h2>
        <p className="text-white/60 mb-6">
          The dashboard page you're looking for doesn't exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
