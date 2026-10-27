import { text, type Locale } from '../lib/ui-i18n';
import { useId, useRef, useState } from 'react';
/** Code stays in static HTML, not duplicated in island props. */
export default function CopyCode({ targetId, locale = 'zh' }: { targetId: string; locale?: Locale }) {
  const statusId = useId();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function copy() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setMessage('');
    try {
      const code = document.getElementById(targetId)?.textContent;
      if (code === null || code === undefined || code.length === 0) {
        setMessage(text(locale, '未找到可复制的代码，请手动选取代码后复制。', 'No code found. Select and copy the code manually.'));
        return;
      }
      if (typeof navigator.clipboard?.writeText !== 'function') {
        setMessage(text(locale, '浏览器无法自动复制，请手动选取代码后复制。', 'Automatic copying is unavailable. Select and copy the code manually.'));
        return;
      }
      await navigator.clipboard.writeText(code);
      setMessage(text(locale, '代码已复制。', 'Code copied.'));
    } catch {
      setMessage(text(locale, '复制失败，请手动选取代码后复制。', 'Copy failed. Select and copy the code manually.'));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="copy-code">
      <button
        type="button"
        onClick={copy}
        disabled={busy}
        aria-describedby={statusId}
      >
        {busy ? text(locale, '复制中…', 'Copying…') : text(locale, '复制代码', 'Copy code')}
      </button>
      <span id={statusId} role="status" aria-live="polite" aria-atomic="true">
        {message}
      </span>
    </div>
  );
}
