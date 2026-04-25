import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';

export interface Link {
  id: number;
  company: number;
  title: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkFormData {
  id?: number; // Optional ID for existing links
  company: number;
  title: string;
  url: string;
}

export interface LinksResponse {
  success: boolean;
  data: Link[];
  count: number;
  error?: string;
}

export interface LinkResponse {
  success: boolean;
  data: Link;
  error?: string;
}

class LinksService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/links/`;

  /**
   * Get all links
   */
  async getLinks(): Promise<Link[]> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        try {
          response = await fetchWithTokenRefresh(this.baseUrl);
        } catch (error) {
          console.error('fetchWithTokenRefresh failed:', error);
          throw new Error('Failed to fetch links');
        }
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetch(`${this.baseUrl}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }
      
      const result = await response.json();
      
      // Handle different response formats
      const linksArray = result.results || result.data || result;
      
      return Array.isArray(linksArray) ? linksArray : [];
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  }

  /**
   * Get links by company ID
   */
  async getLinksByCompany(companyId: number): Promise<Link[]> {
    try {
      const links = await this.getLinks();
      return links.filter(link => link.company === companyId);
    } catch (error) {
      console.error('Error fetching links by company:', error);
      throw error;
    }
  }

  /**
   * Get link by ID
   */
  async getLinkById(id: number): Promise<Link | null> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}/`);
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetch(`${this.baseUrl}/${id}/`);
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch link');
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching link:', error);
      throw error;
    }
  }

  /**
   * Create new link
   */
  async createLink(data: LinkFormData): Promise<Link> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh with relative URL
        response = await fetchWithTokenRefresh('/api/links/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetch(`${this.baseUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to create link (${response.status})`;
        if (errorData.title) errorMessage = `Title: ${errorData.title}`;
        if (errorData.url) errorMessage = `URL: ${errorData.url}`;
        if (errorData.category) errorMessage = `Category: ${errorData.category}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  }

  /**
   * Update link
   */
  async updateLink(id: number, data: LinkFormData): Promise<Link> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh with full URL
        response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetch(`${this.baseUrl}/${id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update link (${response.status})`;
        if (errorData.title) errorMessage = `Title: ${errorData.title}`;
        if (errorData.url) errorMessage = `URL: ${errorData.url}`;
        if (errorData.category) errorMessage = `Category: ${errorData.category}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  }

  /**
   * Delete link
   */
  async deleteLink(id: number): Promise<void> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh with full URL
        response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}/`, {
          method: 'DELETE',
        });
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetch(`${this.baseUrl}/${id}/`, {
          method: 'DELETE',
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Link not found');
        }
        const errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to delete link (${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  }
}

export const linksService = new LinksService();
export default linksService;
