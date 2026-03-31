import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';

export interface Leadership {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  position: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  image_id?: number | null;
  initials: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadershipFormData {
  name: {
    en: string;
    ar: string;
  };
  position: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  image_id?: number | null;
}

class LeadershipService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/leadership`;

  /**
   * Check if backend is available
   */
  private async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get all leadership members
   */
  async getAll(): Promise<Leadership[]> {
    // Check if backend is available
    const isAvailable = await this.isBackendAvailable();
    if (!isAvailable) {
      console.warn('Backend is not available yet. Returning empty leadership list.');
      return [];
    }

    try {
      const response = await fetchWithTokenRefresh(this.baseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching leadership members:', error);
      // Return empty array instead of throwing to prevent page crashes
      return [];
    }
  }

  /**
   * Get leadership member by ID
   */
  async getById(id: number): Promise<Leadership> {
    // Check if backend is available
    const isAvailable = await this.isBackendAvailable();
    if (!isAvailable) {
      console.warn('Backend is not available yet. Cannot fetch leadership member.');
      throw new Error('Backend is not available yet. Please contact the development team to set up the backend API.');
    }

    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching leadership member:', error);
      throw error;
    }
  }

  /**
   * Create new leadership member
   */
  async create(data: LeadershipFormData): Promise<Leadership> {
    try {
      const response = await fetchWithTokenRefresh(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating leadership member:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Update leadership member
   */
  async update(id: number, data: LeadershipFormData): Promise<Leadership> {
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating leadership member:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Delete leadership member
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting leadership member:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Upload image for leadership member
   */
  async uploadImage(file: File): Promise<{ id: number; url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      handleAuthError(error);
      throw error;
    }
  }
}

export const leadershipService = new LeadershipService();
