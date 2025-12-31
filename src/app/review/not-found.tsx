import Link from 'next/link';

export default function ReviewNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4 text-white">Review Not Found</h2>
        <p className="text-white/60 mb-6">
          The review you're looking for doesn't exist or hasn't been created yet.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/review"
            className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Back to Reviews
          </Link>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
