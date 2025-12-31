export default function SprintLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-4 md:px-0 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="h-8 w-48 bg-white/5 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-white/5 rounded-lg"></div>
        </div>
      </div>

      <div className="h-96 w-full bg-white/5 rounded-2xl"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-white/5 rounded-2xl"></div>
        <div className="h-64 bg-white/5 rounded-2xl"></div>
      </div>
    </div>
  );
}
