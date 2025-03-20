import React, { createContext, useContext, useState, useEffect } from 'react';

interface AnalyticsContextType {
  trackEvent: (eventName: string, eventData?: any) => void;
  trackPageView: (pagePath: string) => void;
  trackError: (error: Error, context?: string) => void;
  getAnalytics: () => {
    totalEvents: number;
    totalPageViews: number;
    totalErrors: number;
    recentEvents: Array<{ name: string; timestamp: Date; data?: any }>;
  };
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalPageViews: 0,
    totalErrors: 0,
    recentEvents: [] as Array<{ name: string; timestamp: Date; data?: any }>
  });

  const trackEvent = (eventName: string, eventData?: any) => {
    setAnalytics(prev => ({
      ...prev,
      totalEvents: prev.totalEvents + 1,
      recentEvents: [
        { name: eventName, timestamp: new Date(), data: eventData },
        ...prev.recentEvents.slice(0, 99) // Keep last 100 events
      ]
    }));

    // TODO: Send event to analytics service
    console.log('Analytics Event:', { eventName, eventData });
  };

  const trackPageView = (pagePath: string) => {
    setAnalytics(prev => ({
      ...prev,
      totalPageViews: prev.totalPageViews + 1,
      recentEvents: [
        { name: 'page_view', timestamp: new Date(), data: { path: pagePath } },
        ...prev.recentEvents.slice(0, 99)
      ]
    }));

    // TODO: Send page view to analytics service
    console.log('Page View:', pagePath);
  };

  const trackError = (error: Error, context?: string) => {
    setAnalytics(prev => ({
      ...prev,
      totalErrors: prev.totalErrors + 1,
      recentEvents: [
        { name: 'error', timestamp: new Date(), data: { error, context } },
        ...prev.recentEvents.slice(0, 99)
      ]
    }));

    // TODO: Send error to error tracking service
    console.error('Analytics Error:', { error, context });
  };

  const getAnalytics = () => analytics;

  // Clean up old events periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      setAnalytics(prev => ({
        ...prev,
        recentEvents: prev.recentEvents.filter(event => event.timestamp > oneHourAgo)
      }));
    }, 60 * 60 * 1000); // Run every hour

    return () => clearInterval(cleanup);
  }, []);

  const value = {
    trackEvent,
    trackPageView,
    trackError,
    getAnalytics
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
} 