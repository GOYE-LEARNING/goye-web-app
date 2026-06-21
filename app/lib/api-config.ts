// lib/api-config.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://goye-platform-backend.onrender.com/api',
  
  // Rate limit configuration per endpoint category
  rateLimits: {
    // High traffic endpoints - limit to 5 per minute
    high: {
      maxRequests: 5,
      timeWindow: 60000, // 1 minute
      endpoints: [
        '/socials/get-groups',
        '/socials/get-groups-created-by-tutor',
        '/user/profile',
        '/course/get-all-courses',
        '/course/get-courses-by-tutor',
        '/api/user/profile',
        '/api/organizations/profile'
      ]
    },
    
    // Medium traffic - 10 per minute
    medium: {
      maxRequests: 10,
      timeWindow: 60000,
      endpoints: [
        '/socials/get-group',
        '/socials/check-joined',
        '/enroll/check-if-enrolled',
        '/course/get-course'
      ]
    },
    
    // Low traffic - 20 per minute
    low: {
      maxRequests: 20,
      timeWindow: 60000,
      endpoints: [
        '/notifications/fetch-all-notification',
        '/gamification/dashboard',
        '/growth/fetch-growth-user'
      ]
    },
    
    // Mutations - 3 per minute
    mutation: {
      maxRequests: 3,
      timeWindow: 60000,
      endpoints: [
        '/socials/join-group',
        '/socials/exit-group',
        '/enroll/student-enroll',
        '/course/save-course'
      ]
    }
  },
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    statusCodesToRetry: [429, 503, 504]
  }
};