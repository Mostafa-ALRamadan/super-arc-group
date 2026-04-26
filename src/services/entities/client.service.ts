import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Client {
  id: number;
  name_en: string;
  name_ar: string;
  category_id: number;
  image_id: number | null;
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
    created_at: string;
    updated_at: string;
  };
  category: {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    type: string;
    type_display: string;
    created_at: string;
    updated_at: string;
  };
  initials: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name_en: string;
  name_ar: string;
  category_id: number;
  image_id?: number | null;
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  } | null;
}

class ClientService {
  private baseUrl = `${API_BASE_URL}/clients/`;

  /**
   * Get all clients (fetches all pages from Django backend)
   */
  async getAll(): Promise<Client[]> {
    try {
      const allClients: Client[] = [];
      let nextUrl: string | null = this.baseUrl;
      
      // Fetch all pages until there's no next page
      while (nextUrl) {
        const response = await fetchWithTokenRefresh(nextUrl);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Django backend returns paginated response with results array
        const clientsArray = result.results || result.data || result;
        allClients.push(...clientsArray);
        
        // Check if there's a next page
        nextUrl = result.next || null;
      }
      
      return allClients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Get client by ID
   */
  async getById(id: number): Promise<Client> {
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}${id}/`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to fetch client (${response.status})`;
        throw new Error(errorMessage);
      }
      
      const client = await response.json();
      return client;
    } catch (error) {
      console.error('Error fetching client:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Create new client
   */
  async create(data: ClientFormData): Promise<Client> {
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Extract specific field errors if available
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to create client (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.category_id) errorMessage = `Category: ${errorData.category_id}`;
        throw new Error(errorMessage);
      }
      
      const client = await response.json();
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Update client
   */
  async update(id: number, data: ClientFormData): Promise<Client> {
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update client (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.category_id) errorMessage = `Category: ${errorData.category_id}`;
        throw new Error(errorMessage);
      }
      
      const client = await response.json();
      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Delete client
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Client not found');
        }
        const errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to delete client (${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      handleAuthError(error);
      throw error;
    }
  }

  /**
   * Get client categories (fetches all pages from Django backend)
   */
  async getCategories(): Promise<any[]> {
    try {
      const allCategories: any[] = [];
      let nextUrl: string | null = `${API_BASE_URL}/categories/`;
      
      // Fetch all pages until there's no next page
      while (nextUrl) {
        const response = await fetchWithTokenRefresh(nextUrl);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Django backend returns paginated response with results array
        const categoriesArray = result.results || result.data || [];
        allCategories.push(...categoriesArray);
        
        // Check if there's a next page
        nextUrl = result.next || null;
      }
      
      return allCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      handleAuthError(error);
      throw error;
    }
  }
}

export const clientService = new ClientService();
