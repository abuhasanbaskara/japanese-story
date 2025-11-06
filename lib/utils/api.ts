/**
 * API URL Utility
 * 
 * Handles base URL determination for API calls in both development and production.
 * Works for both server-side and client-side code.
 */

/**
 * Get the base URL for API calls
 * 
 * Server-side: Uses environment variables or auto-detects from request
 * Client-side: Uses NEXT_PUBLIC_BASE_URL or auto-detects from window.location
 * 
 * @returns Base URL string (e.g., 'http://localhost:3000' or 'https://yourdomain.com')
 */
export function getBaseUrl(): string {
  // Server-side rendering
  if (typeof window === 'undefined') {
    // Check if NEXT_PUBLIC_BASE_URL is set (recommended for production)
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL
    }

    // Fallback: Try to detect from Vercel environment
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }

    // Fallback: Use localhost for development
    if (process.env.NODE_ENV === 'production') {
      // In production, NEXT_PUBLIC_BASE_URL should always be set
      // If not set, throw an error to prevent incorrect URLs
      throw new Error(
        'NEXT_PUBLIC_BASE_URL is not set in production. ' +
        'Please set it in your hosting platform environment variables.'
      )
    }
    
    return 'http://localhost:3000'
  }

  // Client-side: Use NEXT_PUBLIC_BASE_URL or auto-detect from browser
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Auto-detect from browser (client-side only)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Final fallback
  return 'http://localhost:3000'
}

/**
 * Get the full API URL for a given endpoint
 * 
 * @param endpoint - API endpoint path (e.g., '/api/stories' or 'api/stories')
 * @returns Full API URL
 * 
 * @example
 * getApiUrl('/api/stories') // 'http://localhost:3000/api/stories' (dev)
 * getApiUrl('/api/stories') // 'https://yourdomain.com/api/stories' (prod)
 */
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with '/'
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${getBaseUrl()}${normalizedEndpoint}`
}

/**
 * Check if we're in development mode
 * 
 * @returns true if in development, false otherwise
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if we're in production mode
 * 
 * @returns true if in production, false otherwise
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
