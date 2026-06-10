import { useRouter, useRoute } from '@microtsm/react';

export default function ReactLayout() {
  const router = useRouter();
  const route = useRoute();

  const path = route.path;

  const navigateTo = (newPath: string) => {
    router.push(newPath);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto my-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">React Micro-Frontend</h1>
          <p className="text-sm text-gray-500 mt-1">
            Menggunakan Router Web Component yang Terintegrasi
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
          React MFE Active
        </span>
      </div>

      {/* Navigasi menggunakan Button + router.push sesuai standarisasi project */}
      <div className="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => navigateTo('/react/transaction')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
            path === '/react/transaction'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Transaction View
        </button>
        <button
          type="button"
          onClick={() => navigateTo('/react/history')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
            path === '/react/history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History View
        </button>
      </div>

      {/* Sub-route router-view (Depth 1) */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 min-h-[200px] transition-all duration-300">
        <router-view></router-view>
      </div>
    </div>
  );
}
