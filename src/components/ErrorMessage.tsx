interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

/**
 * ErrorMessage 组件用于显示错误信息
 */
export function ErrorMessage({
  title = '加载失败',
  message,
  onRetry,
  showHomeButton = true,
}: ErrorMessageProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
          )}
          {showHomeButton && (
            <button
              onClick={() => (window.location.href = import.meta.env.BASE_URL)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              返回首页
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
