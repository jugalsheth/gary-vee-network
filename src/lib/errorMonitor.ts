// Error monitoring and logging system for production

interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
}

interface ErrorStats {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: ErrorLog[];
  errorRate: number; // errors per minute
}

class ErrorMonitor {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 1000; // Keep last 1000 errors
  private errorCounts: Record<string, number> = {};
  private startTime = Date.now();

  // Log an error
  logError(
    error: Error | string,
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
      additionalData?: Record<string, any>;
    }
  ) {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context: context?.additionalData,
      userId: context?.userId,
      ip: context?.ip,
      userAgent: context?.userAgent,
      endpoint: context?.endpoint,
      method: context?.method
    };

    this.errorLogs.push(errorLog);
    
    // Keep only the last maxLogs
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }

    // Update error counts
    const endpoint = context?.endpoint || 'unknown';
    this.errorCounts[endpoint] = (this.errorCounts[endpoint] || 0) + 1;

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', {
        message: errorLog.message,
        endpoint: errorLog.endpoint,
        timestamp: errorLog.timestamp.toISOString(),
        stack: errorLog.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
      });
    }

    // In production, you might want to send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorLog);
    }
  }

  // Log a warning
  logWarning(
    message: string,
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
      additionalData?: Record<string, any>;
    }
  ) {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'warn',
      message,
      context: context?.additionalData,
      userId: context?.userId,
      ip: context?.ip,
      userAgent: context?.userAgent,
      endpoint: context?.endpoint,
      method: context?.method
    };

    this.errorLogs.push(warningLog);
    
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Warning logged:', {
        message: warningLog.message,
        endpoint: warningLog.endpoint,
        timestamp: warningLog.timestamp.toISOString()
      });
    }
  }

  // Log info
  logInfo(
    message: string,
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
      additionalData?: Record<string, any>;
    }
  ) {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'info',
      message,
      context: context?.additionalData,
      userId: context?.userId,
      ip: context?.ip,
      userAgent: context?.userAgent,
      endpoint: context?.endpoint,
      method: context?.method
    };

    this.errorLogs.push(infoLog);
    
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }
  }

  // Get error statistics
  getErrorStats(): ErrorStats {
    const now = Date.now();
    const oneMinuteAgo = new Date(now - 60 * 1000);
    const recentErrors = this.errorLogs.filter(log => log.timestamp > oneMinuteAgo);
    
    const errorsByLevel: Record<string, number> = {};
    const errorsByEndpoint: Record<string, number> = {};
    
    this.errorLogs.forEach(log => {
      errorsByLevel[log.level] = (errorsByLevel[log.level] || 0) + 1;
      if (log.endpoint) {
        errorsByEndpoint[log.endpoint] = (errorsByEndpoint[log.endpoint] || 0) + 1;
      }
    });

    const runtimeMinutes = (now - this.startTime) / (1000 * 60);
    const errorRate = runtimeMinutes > 0 ? this.errorLogs.length / runtimeMinutes : 0;

    return {
      totalErrors: this.errorLogs.length,
      errorsByLevel,
      errorsByEndpoint,
      recentErrors: recentErrors.slice(-10), // Last 10 errors
      errorRate: Math.round(errorRate * 100) / 100
    };
  }

  // Get recent errors
  getRecentErrors(limit: number = 50): ErrorLog[] {
    return this.errorLogs.slice(-limit).reverse();
  }

  // Clear old logs (older than 24 hours)
  clearOldLogs() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.errorLogs = this.errorLogs.filter(log => log.timestamp > oneDayAgo);
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Send to external service (placeholder for production)
  private sendToExternalService(errorLog: ErrorLog) {
    // In production, you might send to:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging service
    
    // For now, just log to console
    console.error('🚨 Production Error:', {
      id: errorLog.id,
      message: errorLog.message,
      endpoint: errorLog.endpoint,
      timestamp: errorLog.timestamp.toISOString(),
      userId: errorLog.userId,
      ip: errorLog.ip
    });
  }

  // Health check
  isHealthy(): boolean {
    const stats = this.getErrorStats();
    const errorRate = stats.errorRate;
    
    // Consider unhealthy if error rate is too high (>10 errors per minute)
    return errorRate < 10;
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor();

// Auto-cleanup old logs every hour
setInterval(() => {
  errorMonitor.clearOldLogs();
}, 60 * 60 * 1000);

// Global error handler
export function setupGlobalErrorHandling() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    errorMonitor.logError(error, {
      endpoint: 'uncaught-exception',
      method: 'SYSTEM'
    });
    
    // In production, you might want to exit gracefully
    if (process.env.NODE_ENV === 'production') {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    errorMonitor.logError(error, {
      endpoint: 'unhandled-rejection',
      method: 'SYSTEM',
      additionalData: { promise: promise.toString() }
    });
  });
}

// Helper function to extract context from NextRequest
export function extractRequestContext(request: any) {
  return {
    ip: request.ip || request.headers?.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers?.get('user-agent') || 'unknown',
    endpoint: request.url ? new URL(request.url).pathname : 'unknown',
    method: request.method || 'unknown'
  };
}
