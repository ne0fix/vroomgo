import { SkeletonCard } from "@/components/SkeletonCard";

export default function HomeLoading() {
  return (
    <main className="bg-white">
      {/* Hero skeleton */}
      <section className="bg-white border-b border-gray-100 py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl animate-pulse">
          <div className="text-center mb-8 space-y-3">
            <div className="h-10 bg-gray-200 rounded-xl w-2/3 mx-auto" />
            <div className="h-5 bg-gray-100 rounded w-1/2 mx-auto" />
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 md:p-8 max-w-3xl mx-auto mb-8">
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 w-28 bg-gray-200 rounded-xl" />
            </div>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-20 bg-gray-100 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Cards skeleton */}
      <section className="bg-gray-50 py-10 md:py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="h-4 bg-gray-100 rounded w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
