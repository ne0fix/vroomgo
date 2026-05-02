export default function MeusAlugueisLoading() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-6xl animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-16 mb-4" />
          <div className="h-9 bg-gray-700 rounded w-56 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-48" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="flex flex-col md:grid md:grid-cols-4">
              <div className="h-40 md:h-auto bg-gray-200" />
              <div className="md:col-span-2 p-4 md:p-5 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-48" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 bg-gray-100 rounded-lg" />
                  <div className="h-10 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-36" />
              </div>
              <div className="p-4 md:p-5 border-t md:border-t-0 md:border-l border-gray-100 space-y-3">
                <div className="h-8 bg-gray-200 rounded w-28" />
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
