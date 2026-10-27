import { toggleLearned, useLearned } from '../lib/learned';
export default function LearnedButton({
  id,
  title,
}: {
  id: string;
  title?: string;
}) {
  const learned = useLearned().ids.includes(id);
  return (
    <button
      type="button"
      className="learned-button"
      aria-pressed={learned}
      aria-label={`${learned ? '撤销已学会' : '标记已学会'}${title ? `：${title}` : ''}`}
      title={learned ? '再次点击可撤销' : '标记这个知识点已学会'}
      onClick={() => toggleLearned(id)}
    >
      <span aria-hidden="true">{learned ? '✓' : '+'}</span>{' '}
      {learned ? 'Get · 已学会' : 'Get · 标记学会'}
    </button>
  );
}
export function LearnedNotice() {
  const { storage } = useLearned();
  return (
    <p
      className="learned-notice"
      role={storage === 'saved' ? undefined : 'status'}
    >
      {storage === 'session'
        ? '学习记录暂时无法保存，仅在当前页面有效，刷新或离开后可能丢失。'
        : storage === 'invalid'
          ? '已保存的学习记录格式异常，暂未载入。重新标记会建立新记录；收藏不受影响。'
          : 'Get 表示这个知识点已学会，可再次点击撤销。仅保存在当前浏览器，与收藏分开，不跨设备同步。'}
    </p>
  );
}
