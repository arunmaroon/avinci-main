// Performance optimization utilities for the admin panel
// Includes debouncing, lazy loading, and bundle optimization

import { useCallback, useMemo, useRef, useEffect } from 'react';

// Debounce utility for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Custom hook for debounced values
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for debounced callbacks
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
};

// Lazy loading utility for components
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(importFunc);
};

// Lazy loading hook for images
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
    };
    
    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, isError };
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = scrollTop;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Memoization utilities
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

// Custom hook for memoized calculations
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

// Bundle optimization utilities
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return () => {
    const componentPromise = importFunc();
    componentPromise.then(() => {
      console.log('Component preloaded successfully');
    });
    return componentPromise;
  };
};

// Image optimization utilities
export const optimizeImage = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // This would typically integrate with an image optimization service
  // For now, return the original src
  return src;
};

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Custom hook for performance monitoring
export const usePerformanceMonitor = (name: string) => {
  const startTime = useRef<number>(0);
  
  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);
  
  const end = useCallback(() => {
    const duration = performance.now() - startTime.current;
    console.log(`${name} took ${duration} milliseconds`);
    return duration;
  }, [name]);
  
  return { start, end };
};

// Memory management utilities
export const createWeakMap = <K extends object, V>() => {
  return new WeakMap<K, V>();
};

export const createWeakSet = <T extends object>() => {
  return new WeakSet<T>();
};

// Cleanup utilities
export const cleanup = (cleanupFn: () => void) => {
  return () => {
    try {
      cleanupFn();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };
};

// Batch operations utility
export const batch = <T>(items: T[], batchSize: number) => {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
};

// Custom hook for batch processing
export const useBatchProcessing = <T>(
  items: T[],
  batchSize: number = 10,
  delay: number = 100
) => {
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const batches = useMemo(() => batch(items, batchSize), [items, batchSize]);
  
  const processNextBatch = useCallback(() => {
    if (currentBatch >= batches.length) {
      setIsProcessing(false);
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setCurrentBatch(prev => prev + 1);
    }, delay);
  }, [currentBatch, batches.length, delay]);
  
  const startProcessing = useCallback(() => {
    setCurrentBatch(0);
    setIsProcessing(true);
  }, []);
  
  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
  }, []);
  
  useEffect(() => {
    if (isProcessing) {
      processNextBatch();
    }
  }, [isProcessing, processNextBatch]);
  
  return {
    currentBatch: batches[currentBatch] || [],
    isProcessing,
    progress: (currentBatch / batches.length) * 100,
    startProcessing,
    stopProcessing
  };
};

// Error boundary for performance monitoring
export class PerformanceErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Performance Error Boundary caught an error:', error, errorInfo);
    
    // Log performance metrics
    const metrics = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    };
    
    console.log('Performance metrics:', metrics);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Performance optimization configuration
export const performanceConfig = {
  debounceDelay: 300,
  throttleDelay: 100,
  imageLazyLoadOffset: 100,
  virtualScrollItemHeight: 50,
  batchSize: 10,
  batchDelay: 100
};

export default {
  debounce,
  throttle,
  useDebounce,
  useDebouncedCallback,
  lazyLoad,
  useLazyImage,
  useVirtualScroll,
  memoize,
  useMemoizedValue,
  preloadComponent,
  optimizeImage,
  measurePerformance,
  usePerformanceMonitor,
  createWeakMap,
  createWeakSet,
  cleanup,
  batch,
  useBatchProcessing,
  PerformanceErrorBoundary,
  performanceConfig
};

