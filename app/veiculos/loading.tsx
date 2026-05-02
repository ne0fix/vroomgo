import { SkeletonCard } from "@/components/SkeletonCard";

export default function VeiculosLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-7xl animate-pulse">
          <div className="h-3 bg-gray-100 rounded w-32 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros skeleton */}
          <aside className="lg:w-72 flex-shrink-0 animate-pulse">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-5">
              <div className="h-5 bg-gray-200 rounded w-24" />
              <div className="space-y-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-9 bg-gray-100 rounded-xl" />
                ))}
              </div>
              <div className="h-px bg-gray-100" />
              <div className="h-5 bg-gray-200 rounded w-20" />
              <div className="h-9 bg-gray-100 rounded-xl" />
              <div className="h-9 bg-gray-200 rounded-xl" />
            </div>
          </aside>

          {/* Grid skeleton */}
          <main className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
