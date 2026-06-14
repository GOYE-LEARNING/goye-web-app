// services/apiService.ts
class ApiService {
  private requestQueue: Map<string, Promise<any>> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  private minDelay = 1000; // Minimum 1 second between requests
  private maxRetries = 3;
  private baseDelay = 1000;

  async fetchWithRateLimit(
    url: string,
    options: RequestInit = {},
    endpoint: string = "default"
  ): Promise<any> {
    // Check if there's a pending request for this endpoint
    if (this.requestQueue.has(endpoint)) {
      console.log(`Waiting for pending request to ${endpoint}...`);
      return this.requestQueue.get(endpoint);
    }

    // Check rate limiting
    const lastRequest = this.lastRequestTime.get(endpoint) || 0;
    const timeSinceLastRequest = Date.now() - lastRequest;
    
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request to ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Create the request promise
    const requestPromise = this.makeRequestWithRetry(url, options, endpoint);
    this.requestQueue.set(endpoint, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(endpoint);
      this.lastRequestTime.set(endpoint, Date.now());
    }
  }

  private async makeRequestWithRetry(
    url: string,
    options: RequestInit,
    endpoint: string,
    retryCount = 0
  ): Promise<any> {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.baseDelay * Math.pow(2, retryCount);
        
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        
        if (retryCount < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequestWithRetry(url, options, endpoint, retryCount + 1);
        } else {
          throw { status: 429, message: "Too many requests. Please try again later." };
        }
      }
      
      if (!response.ok) {
        throw { status: response.status, message: response.statusText };
      }
      
      return await response.json();
    } catch (error) {
      if (retryCount < this.maxRetries && error !== 429) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(url, options, endpoint, retryCount + 1);
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();