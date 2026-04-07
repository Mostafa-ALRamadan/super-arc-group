const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

interface TokenResponse {
  access: string;
  refresh: string;
}

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    // Try to load tokens from localStorage on client side
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${baseUrl}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Invalid username or password';
        
        try {
          const errorData = JSON.parse(errorText);
          // Use the backend's error message if provided
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If JSON parsing fails, use the raw error text if available
          if (errorText && errorText.trim()) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data: TokenResponse = await response.json();
      this.setTokens(data.access, data.refresh);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Use Next.js API route for token refresh
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: TokenResponse = await response.json();
      this.setTokens(data.access, data.refresh || this.refreshToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  private setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    
    // Store in localStorage on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    // Remove from localStorage on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (!this.accessToken) {
      return false;
    }

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      this.logout();
      return false;
    }
  }

  // Get current user info (optional - can be extended)
  getCurrentUser(): { username: string } | null {
    if (!this.accessToken) return null;
    
    try {
      // Decode JWT token to get user info (basic implementation)
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      return {
        username: payload.username || 'Unknown'
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Get auth headers for API requests
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Make authenticated API requests
  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401, try to refresh the token
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        
        // Retry the request with the new token
        const updatedHeaders: Record<string, string> = {
          ...headers,
          'Authorization': `Bearer ${this.accessToken}`,
        };
        response = await fetch(url, {
          ...options,
          headers: updatedHeaders,
        });
      } catch (error) {
        // Refresh failed, logout and propagate the error
        this.logout();
        throw error;
      }
    }

    return response;
  }
}

export const authService = AuthService.getInstance();
export default authService;
