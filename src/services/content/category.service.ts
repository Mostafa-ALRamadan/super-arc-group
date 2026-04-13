// Category types and service
import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';
export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  type: 'project' | 'blog' | 'client';
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: {
    en: string;
    ar: string;
  };
  type: 'project' | 'blog' | 'client';
}

// Transform API response to frontend format
const transformCategory = (apiCategory: any): Category => ({
  id: apiCategory.id.toString(),
  name_en: apiCategory.name_en,
  name_ar: apiCategory.name_ar,
  type: apiCategory.type,
  slug: apiCategory.slug,
  created_at: apiCategory.created_at,
  updated_at: apiCategory.updated_at,
});

// Transform frontend form data to API format
const transformFormData = (formData: CategoryFormData) => ({
  name_en: formData.name.en,
  name_ar: formData.name.ar,
  type: formData.type,
});

class CategoryService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/categories`;

  /**
   * Get all categories (fetches all pages from Django backend)
   */
  async getCategories(): Promise<Category[]> {
    try {
      const allCategories: any[] = [];
      let nextUrl: string | null = this.baseUrl;
      
      // Fetch all pages until there's no next page
      while (nextUrl) {
        const response = await fetchWithTokenRefresh(nextUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Handle paginated response format
        let categoriesArray: any[] = [];
        
        if (Array.isArray(data)) {
          // Direct array response
          categoriesArray = data;
        } else if (data && data.results && Array.isArray(data.results)) {
          // Paginated response format: { count, next, previous, results }
          categoriesArray = data.results;
        } else {
          throw new Error(`Expected array or paginated response but received: ${JSON.stringify(data)}`);
        }
        
        allCategories.push(...categoriesArray);
        
        // Check if there's a next page
        nextUrl = data.next || null;
      }
      
      return allCategories.map(transformCategory);
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await fetch(`${this.baseUrl}/slug/${slug}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch category');
      }
      const data = await response.json();
      return transformCategory(data);
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}/`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        const errorText = await response.text();
        console.error(`Failed to fetch category ${id}:`, response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch category: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return transformCategory(data);
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(data: CategoryFormData): Promise<Category> {
    try {
      const apiData = transformFormData(data);
      const response = await fetchWithTokenRefresh('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to create category (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.slug) errorMessage = `Slug: ${errorData.slug}`;
        if (errorData.type) errorMessage = `Type: ${errorData.type}`;
        throw new Error(errorMessage);
      }

      const createdCategory = await response.json();
      return transformCategory(createdCategory);
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    try {
      const apiData = transformFormData(data as CategoryFormData);
      const response = await fetchWithTokenRefresh(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update category (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.slug) errorMessage = `Slug: ${errorData.slug}`;
        if (errorData.type) errorMessage = `Type: ${errorData.type}`;
        throw new Error(errorMessage);
      }

      const updatedCategory = await response.json();
      return transformCategory(updatedCategory);
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const response = await fetchWithTokenRefresh(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Category not found');
        }
        const errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to delete category (${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
