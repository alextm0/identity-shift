import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4 text-white">404</h2>
        <p className="text-xl text-white/80 mb-2">Page Not Found</p>
        <p className="text-white/60 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
