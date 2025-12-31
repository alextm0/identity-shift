export default function ReviewLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-12 px-4 animate-pulse">
      <div className="h-12 w-64 bg-white/5 rounded-lg mb-8"></div>

      <div className="h-96 w-full bg-white/5 rounded-2xl"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-white/5 rounded-xl"></div>
        <div className="h-48 bg-white/5 rounded-xl"></div>
        <div className="h-48 bg-white/5 rounded-xl"></div>
        <div className="h-48 bg-white/5 rounded-xl"></div>
      </div>
    </div>
  );
}
