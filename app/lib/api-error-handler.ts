// lib/api-error-handler.ts
export class APIErrorHandler {
  static handle(error: any, notFoundHandler?: () => void) {
    // Handle 404 errors
    if (error.status === 404 || error.message?.includes('404')) {
      console.error(`API 404: ${error.config?.url || 'Unknown URL'}`);
      
      if (notFoundHandler) {
        notFoundHandler();
      } else {
        // Trigger global 404
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('api-404', { 
            detail: { url: error.config?.url, message: error.message }
          }));
        }
      }
      return true;
    }
    
    // Handle rate limiting (429)
    if (error.status === 429) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rate-limit', { 
          detail: { message: error.message, retryAfter: error.retryAfter }
        }));
      }
      return true;
    }
    
    return false;
  }
}