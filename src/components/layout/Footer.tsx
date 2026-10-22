import { Link } from 'react-router-dom';
import { brand } from '../../config/brand';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t border-gray-200 mt-auto"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
              {brand.displayName}
            </h3>
            <p className="text-sm text-gray-600">
              {brand.tagline} 通过对照不同实现，理解编程概念与语言设计。
            </p>
          </div>

          <nav aria-label="快速链接">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
              快速链接
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="inline-block py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors min-h-[44px] flex items-center focus:outline-none focus:underline"
                >
                  习语列表
                </Link>
              </li>
              <li>
                <Link
                  to="/languages"
                  className="inline-block py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors min-h-[44px] flex items-center focus:outline-none focus:underline"
                >
                  编程语言
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="inline-block py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors min-h-[44px] flex items-center focus:outline-none focus:underline"
                >
                  我的收藏
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="关于链接">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
              关于
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={brand.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors min-h-[44px] flex items-center focus:outline-none focus:underline"
                  aria-label="在新窗口中打开 GitHub"
                >
                  GitHub
                  <span className="sr-only">(在新窗口中打开)</span>
                </a>
              </li>
              <li>
                <a
                  href={`${brand.repositoryUrl}#readme`}
                  className="inline-block py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors min-h-[44px] flex items-center focus:outline-none focus:underline"
                >
                  关于项目
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            © {currentYear} {brand.name}. 采用 MIT 许可证。
          </p>
        </div>
      </div>
    </footer>
  );
};
