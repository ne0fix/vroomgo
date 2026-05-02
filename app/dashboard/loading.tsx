export default function DashboardLoading() {
  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen animate-pulse">
      {/* Título */}
      <div className="mb-6 space-y-2">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-100 rounded w-64" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-7 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-28" />
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-8">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-40" />
        </div>
        <div className="divide-y divide-gray-50">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-36" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
