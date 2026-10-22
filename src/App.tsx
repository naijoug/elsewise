/**
 * Elsewise 主应用组件
 *
 * 这是应用的根组件，负责：
 * - 设置全局状态管理（AppProvider）
 * - 配置路由系统（React Router）
 * - 实现代码分割和懒加载
 * - 提供错误边界保护
 *
 * 路由结构：
 * - / - 首页（习语列表）
 * - /idiom/:id - 习语详情页
 * - /favorites - 收藏页
 * - /language/:id - 语言详情页
 * - * - 404 页面
 */

import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AppProvider } from './contexts';
import { Layout, ErrorBoundary } from './components';
import { Spinner } from './components/common';

// Lazy load page components for code splitting
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const IdiomDetailPage = lazy(() =>
  import('./pages/IdiomDetailPage').then((m) => ({
    default: m.IdiomDetailPage,
  }))
);
const FavoritesPage = lazy(() =>
  import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage }))
);
const LanguagePage = lazy(() =>
  import('./pages/LanguagePage').then((m) => ({ default: m.LanguagePage }))
);
const LanguagesPage = lazy(() =>
  import('./pages/LanguagesPage').then((m) => ({ default: m.LanguagesPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/idioms" element={<Navigate to="/" replace />} />
                <Route path="/idiom/:id" element={<IdiomDetailPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/language/:id" element={<LanguagePage />} />
                <Route path="/languages" element={<LanguagesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
