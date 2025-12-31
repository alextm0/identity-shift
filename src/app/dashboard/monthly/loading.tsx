export default function MonthlyLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-12 px-4 animate-pulse">
      <div className="h-10 w-64 bg-white/5 rounded-lg mb-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white/5 rounded-2xl"></div>
          <div className="h-96 bg-white/5 rounded-2xl"></div>
        </div>

        <div className="space-y-6">
          <div className="h-32 bg-white/5 rounded-2xl"></div>
          <div className="h-32 bg-white/5 rounded-2xl"></div>
          <div className="h-32 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
