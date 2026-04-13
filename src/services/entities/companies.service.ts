import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';
import { Employee } from './employee.service';

// Company link interface
interface CompanyLink {
  id: number;
  title: string;
  url: string;
  company: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  description: {
    en: string;
    ar: string;
  };
  link?: string;
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  image_id?: number | null;
  employees?: Employee[];
  links?: CompanyLink[];
  initials?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompaniesResponse {
  success: boolean;
  data: Company[];
  count: number;
  error?: string;
}

export interface CompanyResponse {
  success: boolean;
  data: Company;
  error?: string;
}

export interface CompanyFormData {
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  description: {
    en: string;
    ar: string;
  };
  link?: string;
  image?: {
    id: number;
    url: string;
    alt_en: string;
    alt_ar: string;
  };
  image_id?: number | null;
}

class CompaniesService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/companies`;

  /**
   * Fetch all companies (fetches all pages from Django backend)
   */
  async getCompanies(): Promise<Company[]> {
    try {
      const allCompanies: any[] = [];
      let nextUrl: string | null = this.baseUrl;
      
      // Fetch all pages until there's no next page
      while (nextUrl) {
        // Use fetchWithTokenRefresh for proper authentication handling
        const response = await fetchWithTokenRefresh(nextUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Handle authentication errors gracefully
          if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
          }
          if (response.status === 403) {
            throw new Error('You do not have permission to access this resource.');
          }
          if (response.status >= 500) {
            throw new Error('Server is temporarily unavailable. Please try again later.');
          }
          throw new Error('Unable to load companies. Please refresh the page.');
        }
        
        const result = await response.json();
        
        // Django backend returns paginated response with results array
        const companiesArray = result.results || result.data || [];
        allCompanies.push(...companiesArray);
        
        // Check if there's a next page
        nextUrl = result.next || null;
      }
      
      if (!Array.isArray(allCompanies)) {
        throw new Error('Invalid response from server');
      }
      
      // Transform Django backend format to frontend format
      const transformedCompanies = allCompanies.map((company: any) => ({
        id: company.id,
        name: {
          en: company.name_en,
          ar: company.name_ar
        },
        slug: company.slug,
        description: {
          en: company.description_en,
          ar: company.description_ar
        },
        link: company.link,
        image: company.image ? {
          id: company.image.id,
          url: company.image.url,
          alt_en: company.image.alt_en,
          alt_ar: company.image.alt_ar
        } : undefined,
        image_id: company.image?.id || null,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      }));
      
      return transformedCompanies;
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  /**
   * Fetch published companies (public access, no authentication required)
   */
  async getPublishedCompanies(): Promise<Company[]> {
    try {
      const response = await fetch(`${this.baseUrl}?status=published`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch published companies');
      }
      
      const result = await response.json();
      
      // Handle paginated response format
      const companiesArray = result.results || result.data || result;
      
      if (!Array.isArray(companiesArray)) {
        throw new Error('Invalid response from server');
      }
      
      // Transform Django backend format to frontend format (same as getCompanies)
      const transformedCompanies = companiesArray.map((company: any) => ({
        id: company.id,
        name: {
          en: company.name_en,
          ar: company.name_ar
        },
        slug: company.slug,
        description: {
          en: company.description_en,
          ar: company.description_ar
        },
        link: company.link,
        image: company.image ? {
          id: company.image.id,
          url: company.image.url,
          alt_en: company.image.alt_en,
          alt_ar: company.image.alt_ar
        } : undefined,
        image_id: company.image?.id || null,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      }));
      
      return transformedCompanies;
    } catch (error) {
      console.error('Error fetching published companies:', error);
      throw error;
    }
  }

  /**
   * Create a new company
   */
  async createCompany(companyData: CompanyFormData): Promise<Company> {
    try {
      const response = await fetchWithTokenRefresh('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to create company (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.slug) errorMessage = `Slug: ${errorData.slug}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Django backend returns the company data directly, not wrapped in a success object
      // If we have an id field, the creation was successful
      if (!result.id) {
        throw new Error('Invalid response from server');
      }
      
      return result;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  /**
   * Update a company
   */
  async updateCompany(slug: string, companyData: Partial<Company>): Promise<Company> {
    try {
      // Filter out image object and slug from company update payload
      // Backend expects only basic company fields, not image data or slug
      const { image, slug: slugFromData, ...companyDataWithoutImageAndSlug } = companyData;
      
      // Check if we're on client side and have a token
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        response = await fetchWithTokenRefresh(`/api/companies/${slug}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(companyDataWithoutImageAndSlug),
        });
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetchWithTokenRefresh(`/api/companies/${slug}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(companyDataWithoutImageAndSlug),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update company (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.slug) errorMessage = `Slug: ${errorData.slug}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Update image alt text separately if image exists and alt text is provided
      if (companyData.image && companyData.image.alt_en && companyData.image.alt_ar && companyData.image.id) {
        try {
          await this.updateImageAltText(companyData.image.id, companyData.image.alt_en, companyData.image.alt_ar);
        } catch (error) {
          console.error('Error updating image alt text:', error);
          // Don't throw here - company update was successful, just log the error
        }
      }
      
      // Django backend returns the company data directly, not wrapped in a success object
      // If we have an id field, the creation was successful
      if (!result.id) {
        throw new Error('Invalid response from server');
      }
      
      return result;
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error updating company:', error);
      throw error;
    }
  }

  /**
   * Get a single company by slug
   */
  async getCompanyBySlug(slug: string): Promise<Company | null> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        response = await fetchWithTokenRefresh(`${this.baseUrl}/${slug}/`);
      } else {
        // Server-side: use absolute URL with admin credentials for public access
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/companies/${slug}/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch company');
      }
      
      const company = await response.json();
      
      // Transform Django backend format to frontend format
      const transformedCompany = {
        id: company.id,
        name: {
          en: company.name_en,
          ar: company.name_ar
        },
        slug: company.slug,
        description: {
          en: company.description_en,
          ar: company.description_ar
        },
        link: company.link,
        image: company.image ? {
          id: company.image.id,
          url: company.image.url,
          alt_en: company.image.alt_en,
          alt_ar: company.image.alt_ar
        } : undefined,
        image_id: company.image?.id || null,
        employees: company.employees || [],
        links: company.links || [],
        initials: company.initials,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      };
      
      return transformedCompany;
    } catch (error) {
      console.error('Error fetching company by slug:', error);
      throw error;
    }
  }

  /**
   * Delete a company
   */
  async deleteCompany(slug: string): Promise<void> {
    try {
      // Check if we're on client side and have a token
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        response = await fetchWithTokenRefresh(`${this.baseUrl}/${slug}/`, {
          method: 'DELETE',
        });
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetch(`${this.baseUrl}/${slug}/`, {
          method: 'DELETE',
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Company not found');
        }
        const errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to delete company (${response.status})`;
        throw new Error(errorMessage);
      }
      
      // Django DELETE returns 204 No Content or success message directly
      // No need to check for result.success
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  /**
   * Update image alt text
   */
  private async updateImageAltText(imageId: number, altEn: string, altAr: string): Promise<void> {
    const isClient = typeof window !== 'undefined';
    
    const imageData = {
      alt_en: altEn,
      alt_ar: altAr
    };
    
    try {
      // Always use fetchWithTokenRefresh since this method is only called from client-side operations
      const response = await fetchWithTokenRefresh(`${this.baseUrl.replace('/companies', '')}/images/${imageId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Company image alt text update failed:', response.status, errorText);
        throw new Error(`Failed to update company image alt text: ${response.status} - ${errorText}`);
      }
      
      await response.json();
      
    } catch (error) {
      console.error('Error in updateImageAltText:', error);
      throw error;
    }
  }
}

export const companiesService = new CompaniesService();
