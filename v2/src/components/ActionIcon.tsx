/** Small inline icons: no icon font, network request or extra runtime dependency. */
export default function ActionIcon({ name }: { name: 'bookmark' | 'check' | 'reset' | 'copy' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'bookmark' && <path d="M6 4h12v17l-6-4-6 4V4Z" />}
    {name === 'check' && <><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>}
    {name === 'reset' && <><path d="M4 4v6h6" /><path d="M4.9 9a8 8 0 1 1-.5 5" /></>}
    {name === 'copy' && <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></>}
  </svg>;
}
