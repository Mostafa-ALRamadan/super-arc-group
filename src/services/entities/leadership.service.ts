import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';

export interface Leadership {
  id: number;
  name_en: string;
  name_ar: string;
  position_en: string;
  position_ar: string;
  description_en: string;
  description_ar: string;
  image_id: number | null;
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  initials: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadershipFormData {
  name_en: string;
  name_ar: string;
  position_en: string;
  position_ar: string;
  description_en: string;
  description_ar: string;
  image_id?: number | null;
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  } | null;
}

class LeadershipService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/members`;

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
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all leadership members - PUBLIC method for frontend
   */
  async getAllPublic(): Promise<Leadership[]> {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/members/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiResponse = await response.json();
      
      // Extract the actual members array from the paginated response
      const members = apiResponse.results || apiResponse;
      
      // Transform each member to frontend format
      const transformedMembers = members.map((member: any) => ({
        id: member.id,
        name_en: member.name_en,
        name_ar: member.name_ar,
        position_en: member.position_en,
        position_ar: member.position_ar,
        description_en: member.description_en,
        description_ar: member.description_ar,
        image_id: member.image?.id || null,
        image: member.image,
        initials: member.initials || (member.name_en || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      }));
      
      return transformedMembers;
    } catch (error) {
      console.error('Error fetching leadership members:', error);
      return [];
    }
  }

  /**
   * Get all leadership members - ADMIN method with auth (fetches all pages from Django backend)
   */
  async getAll(): Promise<Leadership[]> {
    try {
      const allMembers: any[] = [];
      let nextUrl: string | null = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/members/`;
      
      // Fetch all pages until there's no next page
      while (nextUrl) {
        const response = await fetchWithTokenRefresh(nextUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        
        // Extract the actual members array from the paginated response
        const members = apiResponse.results || []; // Handle paginated response
        allMembers.push(...members);
        
        // Check if there's a next page
        nextUrl = apiResponse.next || null;
      }
      
      // Transform each member to frontend format
      const transformedMembers = allMembers.map((member: any) => ({
        id: member.id,
        name_en: member.name_en,
        name_ar: member.name_ar,
        position_en: member.position_en,
        position_ar: member.position_ar,
        description_en: member.description_en,
        description_ar: member.description_ar,
        image_id: member.image?.id || null,
        image: member.image,
        initials: member.initials || (member.name_en || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      }));
      
      return transformedMembers;
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
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const member = await response.json();
      // Transform member to frontend format
      return {
        id: member.id,
        name_en: member.name_en,
        name_ar: member.name_ar,
        position_en: member.position_en,
        position_ar: member.position_ar,
        description_en: member.description_en,
        description_ar: member.description_ar,
        image_id: member.image_id,
        image: member.image,
        initials: member.initials || (member.name_en || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      };
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
      const response = await fetchWithTokenRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/members/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to create leadership member (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.position_en) errorMessage = `English position: ${errorData.position_en}`;
        if (errorData.position_ar) errorMessage = `Arabic position: ${errorData.position_ar}`;
        throw new Error(errorMessage);
      }
      
      const apiResponse = await response.json();
      
      // Handle both paginated responses and direct member responses
      let member;
      if (apiResponse.results && Array.isArray(apiResponse.results)) {
        // Paginated response - get the first (and only) result
        member = apiResponse.results[0];
      } else {
        // Direct member response
        member = apiResponse;
      }
      
      if (!member || !member.id) {
        throw new Error('No valid member data returned from API');
      }
      
      // Transform member to frontend format
      const transformedMember = {
        id: member.id,
        name_en: member.name_en,
        name_ar: member.name_ar,
        position_en: member.position_en,
        position_ar: member.position_ar,
        description_en: member.description_en,
        description_ar: member.description_ar,
        image_id: member.image?.id || null,
        image: member.image,
        initials: member.initials || (member.name_en || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      };
      
      return transformedMember;
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
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update leadership member (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.position_en) errorMessage = `English position: ${errorData.position_en}`;
        if (errorData.position_ar) errorMessage = `Arabic position: ${errorData.position_ar}`;
        throw new Error(errorMessage);
      }
      
      const member = await response.json();
      
      // Transform member to frontend format
      const transformedMember = {
        id: member.id,
        name_en: member.name_en,
        name_ar: member.name_ar,
        position_en: member.position_en,
        position_ar: member.position_ar,
        description_en: member.description_en,
        description_ar: member.description_ar,
        image_id: member.image?.id || null,
        image: member.image,
        initials: member.initials || (member.name_en || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      };
      
      return transformedMember;
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
        if (response.status === 404) {
          throw new Error('Leadership member not found');
        }
        const errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to delete leadership member (${response.status})`;
        throw new Error(errorMessage);
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
      formData.append('url', file);
      
      // Use the same /images/ endpoint that ImageUpload component expects
      const response = await fetchWithTokenRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      // Return the expected format
      return {
        url: result.url,
        id: result.id
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      handleAuthError(error);
      throw error;
    }
  }
}

export const leadershipService = new LeadershipService();
