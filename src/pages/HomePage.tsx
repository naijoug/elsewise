import { useAppContext } from '../contexts';
import { IdiomList } from '../components/IdiomList';
import { brand } from '../config/brand';

export function HomePage() {
  const { idioms, loading, error } = useAppContext();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            aria-hidden="true"
          ></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-[400px]"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">加载失败</h2>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="重新加载页面"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 页面标题 */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          编程习语
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {brand.tagline} 通过对照不同编程语言的实现，学习和理解编程概念。
        </p>
      </header>

      {/* 习语列表 */}
      <IdiomList idioms={idioms} />
    </div>
  );
}
