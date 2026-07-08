import { act, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { useDebounce } from './useDebounce';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// Tiny harness component that exposes the debounced value via a callback.
function DebounceHarness({
  value,
  delay,
  onDebounced,
}: {
  value: string;
  delay: number;
  onDebounced: (v: string) => void;
}) {
  const debounced = useDebounce(value, delay);
  // Report on every render so the test can observe changes.
  onDebounced(debounced);
  return null as ReactNode;
}

// Helper to render the harness with createRoot + act, matching the project's
// existing test pattern (see src/test/renderComponent.tsx).
function renderHarness(initialProps: {
  value: string;
  delay: number;
  onDebounced: (v: string) => void;
}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const props = { ...initialProps };

  const rerender = (next: Partial<typeof props>) => {
    Object.assign(props, next);
    act(() => {
      root.render(
        <DebounceHarness
          value={props.value}
          delay={props.delay}
          onDebounced={props.onDebounced}
        />
      );
    });
  };

  const unmount = () => {
    act(() => root.unmount());
    container.remove();
  };

  rerender({});
  return { rerender, unmount };
}

describe('useDebounce', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('returns the initial value immediately on first render', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    renderHarness({ value: 'hello', delay: 300, onDebounced: spy });
    expect(spy).toHaveBeenLastCalledWith('hello');
  });

  it('does not update debounced value before delay elapses', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const { rerender } = renderHarness({
      value: 'hello',
      delay: 300,
      onDebounced: spy,
    });

    spy.mockClear();
    rerender({ value: 'world' });

    // Before the timer fires, the debounced value should still be the old one.
    expect(spy).toHaveBeenLastCalledWith('hello');
  });

  it('updates debounced value after delay', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const { rerender } = renderHarness({
      value: 'hello',
      delay: 300,
      onDebounced: spy,
    });

    rerender({ value: 'world' });
    spy.mockClear();
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(spy).toHaveBeenLastCalledWith('world');
  });

  it('resets timer when value changes rapidly within delay', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const { rerender } = renderHarness({
      value: 'a',
      delay: 300,
      onDebounced: spy,
    });

    // Rapid consecutive changes
    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(200));
    // After 200ms: 'b' timer hasn't fired yet (300ms), debounced still 'a'
    expect(spy).toHaveBeenLastCalledWith('a');

    rerender({ value: 'c' });

    // 100 ms left from the 'b' timer — not enough, but 'c' reset the clock
    act(() => vi.advanceTimersByTime(100));
    expect(spy).toHaveBeenLastCalledWith('a');

    // Full delay since the last change ('c')
    act(() => vi.advanceTimersByTime(200));
    expect(spy).toHaveBeenLastCalledWith('c');
  });

  it('uses default delay of 500ms when not specified', () => {
    vi.useFakeTimers();
    const spy = vi.fn();

    // Harness without explicit delay — use a wrapper.
    function DefaultDelayHarness({
      value,
      onDebounced,
    }: {
      value: string;
      onDebounced: (v: string) => void;
    }) {
      const debounced = useDebounce(value);
      onDebounced(debounced);
      return null as ReactNode;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<DefaultDelayHarness value="first" onDebounced={spy} />);
    });
    expect(spy).toHaveBeenLastCalledWith('first');

    act(() => {
      root.render(<DefaultDelayHarness value="second" onDebounced={spy} />);
    });

    // 499ms — not yet, debounced still 'first'
    act(() => vi.advanceTimersByTime(499));
    expect(spy).toHaveBeenLastCalledWith('first');

    // 500ms — updates
    act(() => vi.advanceTimersByTime(1));
    expect(spy).toHaveBeenLastCalledWith('second');

    act(() => root.unmount());
    container.remove();
  });

  it('handles value changes to empty string', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const { rerender } = renderHarness({
      value: 'data',
      delay: 200,
      onDebounced: spy,
    });

    rerender({ value: '' });
    spy.mockClear();
    act(() => vi.advanceTimersByTime(200));
    expect(spy).toHaveBeenLastCalledWith('');
  });

  it('handles delay of 0 (updates immediately after microtask)', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const { rerender } = renderHarness({
      value: 'x',
      delay: 0,
      onDebounced: spy,
    });

    rerender({ value: 'y' });
    spy.mockClear();
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(spy).toHaveBeenLastCalledWith('y');
  });

  it('does not fire after unmount', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const { rerender, unmount } = renderHarness({
      value: 'x',
      delay: 300,
      onDebounced: spy,
    });

    rerender({ value: 'y' });
    unmount();
    spy.mockClear();

    act(() => vi.advanceTimersByTime(300));
    expect(spy).not.toHaveBeenCalled();
  });

  it('works with numeric values', () => {
    vi.useFakeTimers();
    const spy = vi.fn();

    function NumericHarness({
      value,
      onDebounced,
    }: {
      value: number;
      onDebounced: (v: number) => void;
    }) {
      const debounced = useDebounce(value, 100);
      onDebounced(debounced);
      return null as ReactNode;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => root.render(<NumericHarness value={1} onDebounced={spy} />));
    expect(spy).toHaveBeenLastCalledWith(1);

    act(() => root.render(<NumericHarness value={42} onDebounced={spy} />));
    spy.mockClear();
    act(() => vi.advanceTimersByTime(100));
    expect(spy).toHaveBeenLastCalledWith(42);

    act(() => root.unmount());
    container.remove();
  });
});
