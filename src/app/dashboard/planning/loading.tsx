export default function PlanningLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4 animate-pulse">
      <div className="h-10 w-72 bg-white/5 rounded-lg mb-8"></div>

      <div className="space-y-6">
        <div className="h-64 w-full bg-white/5 rounded-2xl"></div>
        <div className="h-64 w-full bg-white/5 rounded-2xl"></div>
        <div className="h-64 w-full bg-white/5 rounded-2xl"></div>
      </div>

      <div className="flex justify-between pt-6">
        <div className="h-12 w-24 bg-white/5 rounded-lg"></div>
        <div className="h-12 w-32 bg-violet-500/20 rounded-lg"></div>
      </div>
    </div>
  );
}
