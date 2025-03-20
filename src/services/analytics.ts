import { analyticsConfig } from '../config/google-cloud';

interface AnalyticsEvent {
  type: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface EventStatistics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  recentEventRate: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private readonly maxEvents = 1000;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Event tracking methods
  async trackEvent(
    eventType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const event: AnalyticsEvent = {
      type: eventType,
      timestamp: Date.now(),
      metadata
    };

    this.events.push(event);

    // Maintain event log size limit
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log event in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', event);
    }

    // Here you would typically send the event to your analytics service
    // For example: Google Analytics, Firebase Analytics, etc.
  }

  async trackError(
    errorType: string,
    message: string,
    stack?: string
  ): Promise<void> {
    await this.trackEvent('ERROR', {
      errorType,
      message,
      stack
    });
  }

  // Event retrieval methods
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByType(type: string): Array<{
    timestamp: number;
    metadata?: Record<string, any>;
  }> {
    return this.events
      .filter(event => event.type === type)
      .map(({ timestamp, metadata }) => ({
        timestamp,
        metadata
      }));
  }

  getRecentEvents(count: number = 10): AnalyticsEvent[] {
    return this.events.slice(-count);
  }

  // Event statistics
  getEventStatistics(): EventStatistics {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour in milliseconds

    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentEvents = this.events.filter(
      event => event.timestamp > oneHourAgo
    ).length;

    return {
      totalEvents: this.events.length,
      eventsByType,
      recentEventRate: recentEvents / 3600 // events per second
    };
  }

  // Event cleanup
  clearEvents(): void {
    this.events = [];
  }

  clearEventsByType(type: string): void {
    this.events = this.events.filter(event => event.type !== type);
  }

  clearOldEvents(maxAge: number = 86400000): void { // 24 hours in milliseconds
    const cutoff = Date.now() - maxAge;
    this.events = this.events.filter(event => event.timestamp > cutoff);
  }
}

export const analyticsService = AnalyticsService.getInstance(); 