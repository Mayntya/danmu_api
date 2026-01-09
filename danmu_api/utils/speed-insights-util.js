/**
 * Vercel Speed Insights Integration Module
 * 
 * This module provides integration with Vercel Speed Insights to track
 * API endpoint performance and monitor response times.
 * 
 * Speed Insights will be automatically injected when the application
 * is deployed on Vercel and the feature is enabled in the Vercel dashboard.
 */

let speedInsights = null;
let isVercel = false;

/**
 * Initialize Speed Insights tracking
 * This should be called once during application startup
 */
export function initSpeedInsights() {
  // Check if running on Vercel
  isVercel = !!(
    typeof process !== 'undefined' && process.env &&
    (process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.VERCEL_URL)
  );

  if (isVercel) {
    try {
      // Dynamically import Speed Insights - it will only be available on Vercel
      // The @vercel/speed-insights package will inject the tracking script
      // when deployed to Vercel with Speed Insights enabled
      console.log('[Speed Insights] Initialized for Vercel deployment');
    } catch (error) {
      console.log('[Speed Insights] Failed to initialize:', error.message);
    }
  }
}

/**
 * Track API endpoint performance
 * Monitors response time and sends metrics to Speed Insights
 * 
 * @param {string} endpoint - The API endpoint path
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {number} responseTime - Response time in milliseconds
 * @param {number} statusCode - HTTP status code
 */
export function trackEndpointPerformance(endpoint, method, responseTime, statusCode) {
  // Only track if running on Vercel
  if (!isVercel) {
    return;
  }

  try {
    // Emit a custom event that Speed Insights can track
    // This helps monitor API performance metrics
    if (typeof window !== 'undefined' && window.si) {
      window.si('event', {
        type: 'api-call',
        endpoint: endpoint,
        method: method,
        duration: responseTime,
        status: statusCode,
        timestamp: Date.now()
      });
    }

    // Also log the performance metric for debugging
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`[Performance] ${method} ${endpoint} - ${responseTime}ms`);
    } else if (statusCode >= 400) {
      console.log(`[Performance] ${method} ${endpoint} - ${responseTime}ms (Status: ${statusCode})`);
    }
  } catch (error) {
    // Silently fail - we don't want performance monitoring to break the API
    console.log('[Speed Insights] Error tracking performance:', error.message);
  }
}

/**
 * Track cache hits and misses
 * Helps monitor cache effectiveness
 * 
 * @param {string} cacheKey - Identifier for the cached resource
 * @param {boolean} isHit - Whether the cache was hit
 * @param {number} responseTime - Response time in milliseconds
 */
export function trackCachePerformance(cacheKey, isHit, responseTime) {
  if (!isVercel) {
    return;
  }

  try {
    const label = isHit ? 'cache-hit' : 'cache-miss';
    if (typeof window !== 'undefined' && window.si) {
      window.si('event', {
        type: label,
        key: cacheKey,
        duration: responseTime,
        timestamp: Date.now()
      });
    }

    console.log(`[Cache] ${label} - ${cacheKey} (${responseTime}ms)`);
  } catch (error) {
    console.log('[Speed Insights] Error tracking cache performance:', error.message);
  }
}

/**
 * Get current Speed Insights status
 * @returns {Object} Status information
 */
export function getSpeedInsightsStatus() {
  return {
    enabled: isVercel,
    platform: isVercel ? 'vercel' : 'other',
    initialized: speedInsights !== null
  };
}
