import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts';
import { Card, Badge } from '../components/common';

export function LanguagesPage() {
  const { languages, idioms } = useAppContext();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          编程语言
        </h1>
        <p className="text-gray-600">
          选择一种语言，了解其特性并浏览相关习语。
        </p>
      </header>
      <ul
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        aria-label="编程语言目录"
      >
        {languages.map((language) => (
          <li key={language.id}>
            <Card className="h-full">
              <h2 className="text-xl font-semibold mb-3">
                <Link
                  className="text-blue-600 hover:underline"
                  to={`/language/${language.id}`}
                >
                  {language.name}
                </Link>
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {language.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {language.paradigms.map((paradigm) => (
                  <Badge key={paradigm}>{paradigm}</Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {
                  idioms.filter((idiom) =>
                    idiom.implementations.some(
                      (impl) => impl.languageId === language.id
                    )
                  ).length
                }{' '}
                个习语
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
