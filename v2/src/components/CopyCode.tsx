import { useId, useRef, useState } from 'react';
/** Code stays in static HTML, not duplicated in island props. */
export default function CopyCode({ targetId }: { targetId: string }) {
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
        setMessage('未找到可复制的代码，请手动选取代码后复制。');
        return;
      }
      if (typeof navigator.clipboard?.writeText !== 'function') {
        setMessage('浏览器无法自动复制，请手动选取代码后复制。');
        return;
      }
      await navigator.clipboard.writeText(code);
      setMessage('代码已复制。');
    } catch {
      setMessage('复制失败，请手动选取代码后复制。');
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
        {busy ? '复制中…' : '复制代码'}
      </button>
      <span id={statusId} role="status" aria-live="polite" aria-atomic="true">
        {message}
      </span>
    </div>
  );
}
