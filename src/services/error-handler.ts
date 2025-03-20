import { analyticsService } from './analytics';
import { securityService } from './security';

interface ErrorLogEntry {
  timestamp: number;
  type: string;
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
}

interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  recentErrorRate: number;
}

class ErrorHandlerService {
  private static instance: ErrorHandlerService;
  private errorLog: ErrorLogEntry[] = [];
  private readonly maxLogSize = 1000;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService();
    }
    return ErrorHandlerService.instance;
  }

  // Error handling methods
  async handleError(
    error: Error,
    type: string = 'UNKNOWN',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Log error
      this.logError(error, type, metadata);

      // Track error in analytics
      await analyticsService.trackError(
        type,
        error.message,
        error.stack
      );

      // Log security event if applicable
      if (type.startsWith('SECURITY_')) {
        await securityService.trackSecurityEvent(
          type,
          'ERROR',
          {
            message: error.message,
            ...metadata
          }
        );
      }

      // Handle specific error types
      switch (type) {
        case 'AUTHENTICATION_ERROR':
          await this.handleAuthenticationError(error, metadata);
          break;
        case 'VALIDATION_ERROR':
          await this.handleValidationError(error, metadata);
          break;
        case 'DATABASE_ERROR':
          await this.handleDatabaseError(error, metadata);
          break;
        case 'NETWORK_ERROR':
          await this.handleNetworkError(error, metadata);
          break;
        case 'SECURITY_ERROR':
          await this.handleSecurityError(error, metadata);
          break;
        default:
          await this.handleGenericError(error, metadata);
      }
    } catch (loggingError) {
      console.error('Error handling failed:', loggingError);
      // Fallback to console logging
      console.error('Original error:', error);
    }
  }

  // Error logging methods
  private logError(
    error: Error,
    type: string,
    metadata?: Record<string, any>
  ): void {
    const errorEntry: ErrorLogEntry = {
      timestamp: Date.now(),
      type,
      message: error.message,
      stack: error.stack,
      metadata
    };

    this.errorLog.push(errorEntry);

    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorEntry);
    }
  }

  // Error type handlers
  private async handleAuthenticationError(
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Handle authentication errors
    // Example: Clear auth tokens, redirect to login, etc.
    console.error('Authentication error:', error.message);
  }

  private async handleValidationError(
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Handle validation errors
    // Example: Show validation messages to user
    console.error('Validation error:', error.message);
  }

  private async handleDatabaseError(
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Handle database errors
    // Example: Retry connection, show maintenance message
    console.error('Database error:', error.message);
  }

  private async handleNetworkError(
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Handle network errors
    // Example: Show offline message, retry request
    console.error('Network error:', error.message);
  }

  private async handleSecurityError(
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Handle security errors
    // Example: Log security event, notify admin
    console.error('Security error:', error.message);
  }

  private async handleGenericError(
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Handle generic errors
    // Example: Show generic error message
    console.error('Generic error:', error.message);
  }

  // Error retrieval methods
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  getErrorsByType(type: string): Array<{
    timestamp: number;
    message: string;
    stack?: string;
    metadata?: Record<string, any>;
  }> {
    return this.errorLog
      .filter(error => error.type === type)
      .map(({ timestamp, message, stack, metadata }) => ({
        timestamp,
        message,
        stack,
        metadata
      }));
  }

  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errorLog.slice(-count);
  }

  // Error statistics
  getErrorStatistics(): ErrorStatistics {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour in milliseconds

    const errorsByType = this.errorLog.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.errorLog.filter(
      error => error.timestamp > oneHourAgo
    ).length;

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      recentErrorRate: recentErrors / 3600 // errors per second
    };
  }

  // Error cleanup
  clearErrorLog(): void {
    this.errorLog = [];
  }

  clearErrorsByType(type: string): void {
    this.errorLog = this.errorLog.filter(error => error.type !== type);
  }

  clearOldErrors(maxAge: number = 86400000): void { // 24 hours in milliseconds
    const cutoff = Date.now() - maxAge;
    this.errorLog = this.errorLog.filter(error => error.timestamp > cutoff);
  }
}

export const errorHandlerService = ErrorHandlerService.getInstance(); 