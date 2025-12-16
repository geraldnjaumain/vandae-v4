/**
 * AI Response Cache Utility
 * Reduces Gemini API calls by caching responses
 */

import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase-server'

export interface CacheOptions {
    endpoint: 'ai-chat' | 'ai-analyze-course' | 'research' | 'syllabus-parse'
    ttlDays: number
}

export interface CachedResponse<T = any> {
    data: T
    fromCache: boolean
    cacheKey?: string
}

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(params: any): string {
    const normalized = JSON.stringify(params, Object.keys(params).sort())
    return createHash('sha256').update(normalized).digest('hex')
}

/**
 * Get cached response if available and not expired
 */
export async function getCachedResponse<T = any>(
    cacheKey: string
): Promise<T | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('ai_cache')
            .select('response_data, expires_at')
            .eq('cache_key', cacheKey)
            .single()

        if (error || !data) {
            return null
        }

        // Check if expired
        if (new Date(data.expires_at) <= new Date()) {
            return null
        }

        // Increment hit count asynchronously (don't await)
        Promise.resolve(supabase.rpc('increment_cache_hit', { p_cache_key: cacheKey })).catch(console.error)

        return data.response_data as T
    } catch (error) {
        console.error('Cache lookup error:', error)
        return null
    }
}

/**
 * Store response in cache
 */
export async function setCachedResponse(
    cacheKey: string,
    endpoint: string,
    modelUsed: string,
    requestParams: any,
    responseData: any,
    ttlDays: number
): Promise<void> {
    try {
        const supabase = await createClient()

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + ttlDays)

        await supabase.from('ai_cache').upsert({
            cache_key: cacheKey,
            endpoint,
            model_used: modelUsed,
            request_params: requestParams,
            response_data: responseData,
            expires_at: expiresAt.toISOString(),
            hit_count: 0,
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
        })
    } catch (error) {
        // Don't throw - caching failures should not break the app
        console.error('Cache storage error:', error)
    }
}

/**
 * Wrapper function for AI operations with automatic caching
 */
export async function withCache<T>(
    options: CacheOptions,
    requestParams: any,
    operation: () => Promise<T>
): Promise<CachedResponse<T>> {
    const cacheKey = generateCacheKey({ endpoint: options.endpoint, ...requestParams })

    // Try to get from cache first
    const cached = await getCachedResponse<T>(cacheKey)
    if (cached) {
        return {
            data: cached,
            fromCache: true,
            cacheKey
        }
    }

    // Execute operation
    const result = await operation()

    // Store in cache (async, don't await)
    setCachedResponse(
        cacheKey,
        options.endpoint,
        'models/gemini-2.5-flash', // Default model
        requestParams,
        result,
        options.ttlDays
    ).catch(console.error)

    return {
        data: result,
        fromCache: false,
        cacheKey
    }
}

/**
 * Invalidate specific cache entry
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
    try {
        const supabase = await createClient()
        await supabase.from('ai_cache').delete().eq('cache_key', cacheKey)
    } catch (error) {
        console.error('Cache invalidation error:', error)
    }
}

/**
 * Clear all cache for a specific endpoint
 */
export async function clearEndpointCache(endpoint: string): Promise<void> {
    try {
        const supabase = await createClient()
        await supabase.from('ai_cache').delete().eq('endpoint', endpoint)
    } catch (error) {
        console.error('Cache clear error:', error)
    }
}
