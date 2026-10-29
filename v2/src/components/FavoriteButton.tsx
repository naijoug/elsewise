import ActionIcon from './ActionIcon';
import { hasTopic, toggledTopic } from '../lib/knowledge-identity';
import { usePreferences, updatePreferences } from '../lib/preferences';
import { text, type Locale } from '../lib/ui-i18n';

export default function FavoriteButton({ id, title, locale = 'zh' }: { id: string; title: string; locale?: Locale }) {
  const preferences = usePreferences();
  const saved = hasTopic(preferences.favoriteIdioms, id);
  const label = saved ? text(locale, '取消收藏', 'Unsave') : text(locale, '收藏', 'Save');
  return (
    <button className="icon-action favorite-action" aria-label={`${label}: ${title}`} aria-pressed={saved}
      onClick={() => updatePreferences({ favoriteIdioms: toggledTopic(preferences.favoriteIdioms, id) })}>
      <ActionIcon name="bookmark" />
      <span className="action-tip" aria-hidden="true">{label}</span>
    </button>
  );
}
