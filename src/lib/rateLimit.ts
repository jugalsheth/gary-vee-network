import rateLimit from 'express-rate-limit';

// Store for tracking rate limit violations
const rateLimitViolations = new Map<string, { count: number; lastViolation: Date }>();

// Helper function to get client IP from NextRequest
function getClientIP(request: any): string {
  // Try multiple ways to get the IP
  const forwarded = request.headers?.get('x-forwarded-for');
  const realIP = request.headers?.get('x-real-ip');
  const cfConnectingIP = request.headers?.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIP(req),
  handler: (req, res) => {
    const clientIP = getClientIP(req);
    
    // Track violations
    const violations = rateLimitViolations.get(clientIP) || { count: 0, lastViolation: new Date() };
    violations.count++;
    violations.lastViolation = new Date();
    rateLimitViolations.set(clientIP, violations);
    
    console.warn(`🚨 Rate limit exceeded for IP: ${clientIP} (${violations.count} violations)`);
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      violationCount: violations.count
    });
  }
});

// Search API rate limiter (more strict)
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: {
    error: 'Too many search requests, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIP(req),
  handler: (req, res) => {
    const clientIP = getClientIP(req);
    console.warn(`🔍 Search rate limit exceeded for IP: ${clientIP}`);
    
    res.status(429).json({
      error: 'Too many search requests, please slow down.',
      retryAfter: '1 minute'
    });
  }
});

// Authentication rate limiter (very strict)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIP(req),
  handler: (req, res) => {
    const clientIP = getClientIP(req);
    console.warn(`🔐 Auth rate limit exceeded for IP: ${clientIP} - potential brute force attack`);
    
    res.status(429).json({
      error: 'Too many login attempts, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Contact creation/update rate limiter
export const contactLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 contact operations per 5 minutes
  message: {
    error: 'Too many contact operations, please slow down.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIP(req),
  handler: (req, res) => {
    const clientIP = getClientIP(req);
    console.warn(`👤 Contact operation rate limit exceeded for IP: ${clientIP}`);
    
    res.status(429).json({
      error: 'Too many contact operations, please slow down.',
      retryAfter: '5 minutes'
    });
  }
});

// Get rate limit statistics
export function getRateLimitStats() {
  const stats = {
    totalViolations: 0,
    uniqueIPs: rateLimitViolations.size,
    topViolators: [] as Array<{ ip: string; count: number; lastViolation: Date }>
  };
  
  for (const [ip, data] of rateLimitViolations.entries()) {
    stats.totalViolations += data.count;
    stats.topViolators.push({
      ip,
      count: data.count,
      lastViolation: data.lastViolation
    });
  }
  
  // Sort by violation count
  stats.topViolators.sort((a, b) => b.count - a.count);
  
  return stats;
}

// Clear old violations (older than 24 hours)
export function cleanupOldViolations() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  for (const [ip, data] of rateLimitViolations.entries()) {
    if (data.lastViolation < oneDayAgo) {
      rateLimitViolations.delete(ip);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupOldViolations, 60 * 60 * 1000);
