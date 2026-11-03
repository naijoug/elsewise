import ActionIcon from './ActionIcon';
import { hasTopic } from '../lib/knowledge-identity';
import { toggleLearned, useLearned } from '../lib/learned';
import { text, type Locale } from '../lib/ui-i18n';
export default function LearnedButton({
  id,
  title,
  locale = 'zh',
}: {
  id: string;
  title?: string;
  locale?: Locale;
}) {
  const learned = hasTopic(useLearned().ids, id);
  const label = learned
    ? text(locale, '已学会', 'Learned')
    : text(locale, '标记学会', 'Mark as learned');
  return (
    <button
      type="button"
      className="learned-button icon-action"
      aria-pressed={learned}
      aria-label={`${label}${title ? `: ${title}` : ''}`}
      title={learned ? text(locale, '再次点击可撤销', 'Click again to undo') : text(locale, '标记这个知识点已学会', 'Mark this topic as learned')}
      onClick={() => toggleLearned(id)}
    >
      <ActionIcon name="check" />
      <span className="action-tip" aria-hidden="true">{label}</span>
    </button>
  );
}
export function LearnedNotice({ locale = 'zh' }: { locale?: Locale }) {
  const { storage } = useLearned();
  return (
    <p
      className="learned-notice"
      role={storage === 'saved' ? undefined : 'status'}
    >
      {storage === 'session'
        ? text(locale, '学习记录暂时无法保存，仅在当前页面有效，刷新或离开后可能丢失。', 'Learning progress cannot be saved right now. It may be lost when you refresh or leave this page.')
        : storage === 'invalid'
          ? text(locale, '已保存的学习记录格式异常，暂未载入。重新标记会建立新记录；收藏不受影响。', 'Saved learning progress has an invalid format and was not loaded. Marking a topic creates a new record; favorites are unaffected.')
          : text(locale, '学习记录仅保存在当前浏览器，与收藏分开，可再次点击撤销。', 'Learning progress is saved only in this browser, separately from favorites. Click again to undo.')}
    </p>
  );
}
