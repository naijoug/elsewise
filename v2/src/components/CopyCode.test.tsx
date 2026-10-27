import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CopyCode from './CopyCode';
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement,
  target: HTMLElement,
  root: Root,
  writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  host = document.createElement('div');
  target = document.createElement('code');
  target.id = 'example';
  target.innerHTML = '<span>const</span> answer = 42;\n';
  document.body.append(target, host);
  writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  root = createRoot(host);
  act(() => root.render(<CopyCode targetId="example" />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  target.remove();
  vi.unstubAllGlobals();
});
const button = () => host.querySelector('button')!;
const message = () => host.querySelector('[role="status"]')!;
const click = async () => {
  await act(async () => button().click());
};
describe('static code copy', () => {
  it('reads current DOM text rather than markup', async () => {
    target.append('console.log(answer);');
    await click();
    expect(writeText).toHaveBeenCalledWith(
      'const answer = 42;\nconsole.log(answer);'
    );
    expect(message().textContent).toBe('代码已复制。');
    expect(message().getAttribute('aria-live')).toBe('polite');
    expect(button().getAttribute('aria-describedby')).toBe(message().id);
  });
  it('reports rejected clipboard writes honestly', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    await click();
    expect(message().textContent).toBe('复制失败，请手动选取代码后复制。');
    expect(button().disabled).toBe(false);
  });
  it('does not copy missing or empty targets', async () => {
    target.remove();
    await click();
    expect(message().textContent).toContain('未找到');
    expect(writeText).not.toHaveBeenCalled();
    target.textContent = '';
    document.body.append(target);
    await click();
    expect(writeText).not.toHaveBeenCalled();
  });
  it('gives a manual fallback for missing API', async () => {
    vi.stubGlobal('navigator', {});
    await click();
    expect(message().textContent).toBe(
      '浏览器无法自动复制，请手动选取代码后复制。'
    );
  });
  it('blocks concurrent writes and reads fresh text on another attempt', async () => {
    let resolve!: () => void;
    writeText.mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        })
    );
    act(() => {
      button().click();
      button().click();
    });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(button().disabled).toBe(true);
    await act(async () => resolve());
    target.textContent = 'new code';
    await click();
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenLastCalledWith('new code');
  });
  it('can retry after failure', async () => {
    writeText.mockRejectedValueOnce(new Error('blocked'));
    await click();
    expect(message().textContent).toContain('失败');
    await click();
    expect(message().textContent).toBe('代码已复制。');
  });
});
