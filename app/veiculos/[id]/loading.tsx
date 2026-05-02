export default function VeiculoDetalheLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 max-w-7xl animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-48" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 animate-pulse">
            {/* Título */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="h-9 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-48" />
            </div>

            {/* Imagem principal */}
            <div className="h-52 sm:h-64 md:h-80 lg:h-96 bg-gray-200 rounded-2xl" />

            {/* Specs */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Opcionais */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-36 mb-3" />
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-7 w-28 bg-gray-100 rounded-full" />
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-4/6" />
            </div>
          </div>

          {/* Sidebar desktop */}
          <div className="hidden lg:block lg:col-span-1 animate-pulse">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="pb-4 border-b space-y-1">
                <div className="h-9 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-11 bg-gray-100 rounded-xl" />
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-11 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
