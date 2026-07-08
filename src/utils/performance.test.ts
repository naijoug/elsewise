import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  markPerformance,
  measurePerformance,
  measureRender,
  reportWebVitals,
} from './performance';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reportWebVitals', () => {
  it('logs navigation timing metrics after the load event', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      {
        domainLookupStart: 1,
        domainLookupEnd: 3,
        connectStart: 3,
        connectEnd: 8,
        requestStart: 10,
        responseStart: 25,
        responseEnd: 45,
        domInteractive: 50,
        domComplete: 90,
        loadEventEnd: 120,
        fetchStart: 0,
      } as PerformanceNavigationTiming,
    ]);

    reportWebVitals();
    window.dispatchEvent(new Event('load'));

    expect(consoleLog).toHaveBeenCalledWith('[Performance] Page Load Metrics:', {
      'DNS Lookup': '2ms',
      'TCP Connection': '5ms',
      'Request Time': '15ms',
      'Response Time': '20ms',
      'DOM Processing': '40ms',
      'Total Load Time': '120ms',
    });
  });

  it('does not log when navigation timing is unavailable', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([]);

    reportWebVitals();
    window.dispatchEvent(new Event('load'));

    expect(consoleLog).not.toHaveBeenCalled();
  });
});

describe('measureRender', () => {
  it('runs the callback and logs elapsed render time in development', () => {
    const callback = vi.fn();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(performance, 'now').mockReturnValueOnce(10).mockReturnValueOnce(13.456);

    measureRender('IdiomCard', callback);

    expect(callback).toHaveBeenCalledOnce();
    expect(consoleLog).toHaveBeenCalledWith(
      '[Performance] IdiomCard rendered in 3.46ms',
    );
  });

  it('rethrows callback errors instead of swallowing render failures', () => {
    const error = new Error('render failed');

    expect(() =>
      measureRender('BrokenComponent', () => {
        throw error;
      }),
    ).toThrow(error);
  });
});

describe('markPerformance', () => {
  it('creates a named performance mark in development', () => {
    const mark = vi
      .spyOn(performance, 'mark')
      .mockImplementation(() => undefined as unknown as PerformanceMark);

    markPerformance('idioms-loaded');

    expect(mark).toHaveBeenCalledWith('idioms-loaded');
  });
});

describe('measurePerformance', () => {
  it('measures between two marks and logs the duration', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const measure = vi
      .spyOn(performance, 'measure')
      .mockImplementation(() => undefined as unknown as PerformanceMeasure);
    vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
      { duration: 42.424 } as PerformanceMeasure,
    ]);

    measurePerformance('search-index', 'search-start', 'search-end');

    expect(measure).toHaveBeenCalledWith(
      'search-index',
      'search-start',
      'search-end',
    );
    expect(consoleLog).toHaveBeenCalledWith('[Performance] search-index: 42.42ms');
  });

  it('skips missing marks without logging or rethrowing', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(performance, 'measure').mockImplementation(() => {
      throw new DOMException('mark not found', 'SyntaxError');
    });

    expect(() =>
      measurePerformance('missing', 'missing-start', 'missing-end'),
    ).not.toThrow();
    expect(consoleLog).not.toHaveBeenCalled();
  });
});
