import { analyticsService } from './analytics';

interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

interface Session {
  userId: string;
  expiresAt: number;
  token: string;
}

interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

class SecurityService {
  private static instance: SecurityService;
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  private activeSessions: Map<string, Session> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Encryption methods
  async encryptData(data: string): Promise<string> {
    // Implement encryption logic here
    // This is a placeholder - implement proper encryption
    return btoa(data);
  }

  async decryptData(encryptedData: string): Promise<string> {
    // Implement decryption logic here
    // This is a placeholder - implement proper decryption
    return atob(encryptedData);
  }

  // JWT methods
  async generateToken(userId: string): Promise<string> {
    // Implement JWT generation logic here
    // This is a placeholder - implement proper JWT generation
    return `token_${userId}_${Date.now()}`;
  }

  async verifyToken(token: string): Promise<boolean> {
    // Implement JWT verification logic here
    // This is a placeholder - implement proper JWT verification
    return token.startsWith('token_');
  }

  // Password methods
  async hashPassword(password: string): Promise<string> {
    // Implement password hashing logic here
    // This is a placeholder - implement proper password hashing
    return btoa(password);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // Implement password verification logic here
    // This is a placeholder - implement proper password verification
    return btoa(password) === hashedPassword;
  }

  // Rate limiting methods
  async checkLoginAttempts(userId: string): Promise<boolean> {
    const attempts = this.loginAttempts.get(userId);
    if (!attempts) return true;

    if (attempts.count >= this.maxLoginAttempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < this.lockoutDuration) {
        return false;
      }
      // Reset attempts if lockout duration has passed
      this.loginAttempts.delete(userId);
      return true;
    }

    return true;
  }

  async recordLoginAttempt(userId: string, success: boolean): Promise<void> {
    if (success) {
      this.loginAttempts.delete(userId);
      return;
    }

    const attempts: LoginAttempt = this.loginAttempts.get(userId) || {
      count: 0,
      lastAttempt: Date.now()
    };

    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(userId, attempts);

    // Track failed login attempt
    await analyticsService.trackEvent('LOGIN_ATTEMPT_FAILED', {
      userId,
      attemptCount: attempts.count
    });
  }

  // Input validation methods
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePasswordStrength(password: string): PasswordValidationResult {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number'
      };
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one special character'
      };
    }

    return { isValid: true };
  }

  // Session management methods
  async createSession(userId: string, token: string, expiresIn: number = 3600000): Promise<void> {
    const expiresAt = Date.now() + expiresIn;
    this.activeSessions.set(token, {
      userId,
      expiresAt,
      token
    });

    // Track session creation
    await analyticsService.trackEvent('SESSION_CREATED', {
      userId,
      expiresAt
    });
  }

  async validateSession(token: string): Promise<boolean> {
    const session = this.activeSessions.get(token);
    if (!session) return false;

    if (session.expiresAt < Date.now()) {
      this.activeSessions.delete(token);
      return false;
    }

    return true;
  }

  async invalidateSession(token: string): Promise<void> {
    const session = this.activeSessions.get(token);
    if (session) {
      this.activeSessions.delete(token);
      // Track session invalidation
      await analyticsService.trackEvent('SESSION_INVALIDATED', {
        userId: session.userId
      });
    }
  }

  // Security event tracking
  async trackSecurityEvent(
    eventType: string,
    severity: 'INFO' | 'WARNING' | 'ERROR',
    metadata?: Record<string, any>
  ): Promise<void> {
    // Track security event in analytics
    await analyticsService.trackEvent(`SECURITY_${eventType}`, {
      severity,
      ...metadata
    });

    // Log security event
    console.log(`Security event: ${eventType}`, {
      severity,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  // Security headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    };
  }
}

export const securityService = SecurityService.getInstance(); 