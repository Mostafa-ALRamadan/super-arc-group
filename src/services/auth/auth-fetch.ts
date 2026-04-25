// Utility for making authenticated requests with automatic token refresh
export async function fetchWithTokenRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  // Get current token
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  if (!token) {
    throw new Error('No access token available');
  }

  // Make initial request
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  // If we get a 401, try to refresh the token
  if (response.status === 401) {
    try {
      // Attempt to refresh the token
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenData = await refreshResponse.json();
      
      // Update tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokenData.access);
        if (tokenData.refresh) {
          localStorage.setItem('refresh_token', tokenData.refresh);
        }
      }

      // Retry the original request with the new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${tokenData.access}`,
        },
      });

    } catch (refreshError) {
      // Refresh failed - clear tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Get current locale from pathname or default to English
        const currentPath = window.location.pathname;
        const locale = currentPath.startsWith('/ar') ? 'ar' : 'en';
        window.location.href = `/${locale}/admin/auth`;
      }
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  // Also check for other authentication-related errors
  if (!response.ok) {
    // Only check for auth errors on 401/403 status codes to avoid consuming response body
    if (response.status === 401 || response.status === 403) {
      const errorText = await response.text();
      
      // Check if error indicates token expiry
      if (errorText.includes('token') && 
          (errorText.includes('expired') || errorText.includes('invalid') || errorText.includes('not found'))) {
        
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          const currentPath = window.location.pathname;
          const locale = currentPath.startsWith('/ar') ? 'ar' : 'en';
          window.location.href = `/${locale}/admin/auth`;
        }
        throw new Error('Authentication failed. Please log in again.');
      }
    }
    // For other error status codes (400, 500, etc.), don't read the response body
    // Let the caller handle the error response
  }

  return response;
}

// Function to manually clear tokens and redirect to login
export function clearTokensAndRedirect() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Get current locale from pathname or default to English
    const currentPath = window.location.pathname;
    const locale = currentPath.startsWith('/ar') ? 'ar' : 'en';
    window.location.href = `/${locale}/admin/auth`;
  }
}

// Hook for handling API errors that need re-authentication
export function handleAuthError(error: any): boolean {
  if (error?.needsReauth || error?.message?.includes('Token expired')) {
    clearTokensAndRedirect();
    return true;
  }
  return false;
}
