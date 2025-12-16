// Simple in-memory rate limiter (upgrade to Redis for production scale)
interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

export const RATE_LIMITS = {
    AI_CHAT: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 requests per hour
    AI_ANALYZE: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 course analyses per hour
    RESEARCH: { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 searches per hour
    FILE_UPLOAD: { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 uploads per hour
}

/**
 * Check if request should be rate limited
 * Returns true if limit exceeded
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = identifier
    
    // Get or create entry
    let entry = rateLimitStore.get(key)
    
    // Reset if window expired
    if (!entry || now > entry.resetTime) {
        entry = {
            count: 0,
            resetTime: now + config.windowMs
        }
        rateLimitStore.set(key, entry)
    }
    
    // Increment count
    entry.count++
    
    // Check if limit exceeded
    const limited = entry.count > config.maxRequests
    const remaining = Math.max(0, config.maxRequests - entry.count)
    
    return {
        limited,
        remaining,
        resetTime: entry.resetTime
    }
}

/**
 * Get user identifier for rate limiting
 */
export function getRateLimitIdentifier(userId?: string, ip?: string): string {
    // Prefer user ID, fallback to IP
    return userId || ip || 'anonymous'
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupRateLimitStore() {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Cleanup every 10 minutes
if (typeof window === 'undefined') {
    setInterval(cleanupRateLimitStore, 10 * 60 * 1000)
}
