import { fetchWithTokenRefresh, handleAuthError } from '../auth/auth-fetch';

export interface Employee {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  position: {
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
  company_id: number;
  company?: string; // Company name as returned by backend
  initials: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeFormData {
  name: {
    en: string;
    ar: string;
  };
  position: {
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
  company_id: number | null;
}

class EmployeeService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/employees/`;

  /**
   * Get all employees (fetches all pages from Django backend)
   */
  async getEmployees(): Promise<Employee[]> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      const allEmployees: any[] = [];
      let nextUrl: string | null = this.baseUrl;
      
      // Fetch all pages until there's no next page
      while (nextUrl) {
        let response: Response;
        
        if (isClient) {
          // Client-side: use automatic token refresh
          response = await fetchWithTokenRefresh(nextUrl, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } else {
          // Server-side: use absolute URL (for SSR compatibility)
          response = await fetch(nextUrl);
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        
        const result = await response.json();
        
        // Django backend returns paginated response with results array
        const employeesArray = result.results || result.data || [];
        allEmployees.push(...employeesArray);
        
        // Check if there's a next page
        nextUrl = result.next || null;
      }
      
      if (!Array.isArray(allEmployees)) {
        throw new Error('Invalid response from server');
      }
      
      // Transform Django backend format to frontend format
      const transformedEmployees = allEmployees.map((employee: any) => ({
        id: employee.id,
        name: {
          en: employee.name_en,
          ar: employee.name_ar
        },
        position: {
          en: employee.position_en,
          ar: employee.position_ar
        },
        image: employee.image ? {
          id: employee.image.id,
          url: employee.image.url,
          alt_en: employee.image.alt_en,
          alt_ar: employee.image.alt_ar
        } : undefined,
        image_id: employee.image?.id || null,
        company_id: employee.company_id,
        company: employee.company,
        initials: employee.name_en.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('').substring(0, 3),
        createdAt: employee.created_at,
        updatedAt: employee.updated_at
      }));
      
      return transformedEmployees;
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch employee');
      }
      
      const employee = await response.json();
      
      // Fetch companies to get company name if company_id exists
      let companyName = undefined;
      let companyId = employee.company_id;
      
      // If company_id is not directly available but company object exists, extract it
      if (!companyId && employee.company && employee.company.id) {
        companyId = employee.company.id;
        companyName = `${employee.company.name_en} (${employee.company.name_ar})`;
      } else if (employee.company_id) {
        // Fetch company name if we have company_id but no company object
        try {
          const companiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/companies/`);
          if (companiesResponse.ok) {
            const companiesResult = await companiesResponse.json();
            const companiesArray = companiesResult.results || companiesResult.data || companiesResult;
            const company = companiesArray.find((c: any) => c.id === employee.company_id);
            if (company) {
              companyName = `${company.name_en} (${company.name_ar})`;
            }
          }
        } catch (error) {
          console.error('Failed to fetch company name:', error);
        }
      }
      
      // Transform Django backend format to frontend format
      const transformedEmployee = {
        id: employee.id,
        name: {
          en: employee.name_en,
          ar: employee.name_ar
        },
        position: {
          en: employee.position_en,
          ar: employee.position_ar
        },
        image: employee.image ? {
          id: employee.image.id,
          url: employee.image.url,
          alt_en: employee.image.alt_en,
          alt_ar: employee.image.alt_ar
        } : undefined,
        image_id: employee.image?.id || null,
        company_id: companyId,
        company: companyName,
        initials: employee.name_en.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('').substring(0, 3),
        createdAt: employee.created_at,
        updatedAt: employee.updated_at
      };
      
      return transformedEmployee;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(data: EmployeeFormData): Promise<Employee> {
    try {
      // Transform frontend data to backend format
      const backendData = {
        name_en: data.name.en,
        name_ar: data.name.ar,
        position_en: data.position.en,
        position_ar: data.position.ar,
        company_id: data.company_id,
        image_id: data.image_id
      };
      
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        response = await fetchWithTokenRefresh('/api/employees/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendData),
        });
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetchWithTokenRefresh('/api/employees/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to create employee (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.position_en) errorMessage = `English position: ${errorData.position_en}`;
        if (errorData.position_ar) errorMessage = `Arabic position: ${errorData.position_ar}`;
        if (errorData.company_id) errorMessage = `Company: ${errorData.company_id}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Transform Django backend format to frontend format
      const transformedEmployee = {
        id: result.id,
        name: {
          en: result.name_en,
          ar: result.name_ar
        },
        position: {
          en: result.position_en,
          ar: result.position_ar
        },
        image: result.image ? {
          id: result.image.id,
          url: result.image.url,
          alt_en: result.image.alt_en,
          alt_ar: result.image.alt_ar
        } : undefined,
        image_id: result.image?.id || null,
        company_id: result.company_id || null, // Backend may not return company_id
        company: result.company,
        initials: result.name_en.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('').substring(0, 3),
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
      
      return transformedEmployee;
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<Employee> {
    try {
      // Transform frontend data to backend format
      const backendData: any = {
        name_en: data.name?.en,
        name_ar: data.name?.ar,
        position_en: data.position?.en,
        position_ar: data.position?.ar,
        company_id: data.company_id,
        image_id: data.image_id
      };
      
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        response = await fetchWithTokenRefresh(`${this.baseUrl}/${id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendData),
        });
      } else {
        // Server-side: use absolute URL (for SSR compatibility)
        response = await fetch(`${this.baseUrl}/${id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update employee (${response.status})`;
        if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
        if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
        if (errorData.position_en) errorMessage = `English position: ${errorData.position_en}`;
        if (errorData.position_ar) errorMessage = `Arabic position: ${errorData.position_ar}`;
        if (errorData.company_id) errorMessage = `Company: ${errorData.company_id}`;
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Update image alt text separately if image exists and alt text is provided
      if (data.image && data.image.alt_en && data.image.alt_ar && data.image_id) {
        try {
          await this.updateImageAltText(data.image_id, data.image.alt_en, data.image.alt_ar);
        } catch (error) {
          console.error('Failed to update image alt text:', error);
          // Don't fail the whole update if alt text update fails
        }
      }
      
      // Transform Django backend format to frontend format
      const transformedEmployee = {
        id: result.id,
        name: {
          en: result.name_en,
          ar: result.name_ar
        },
        position: {
          en: result.position_en,
          ar: result.position_ar
        },
        image: result.image ? {
          id: result.image.id,
          url: result.image.url,
          alt_en: result.image.alt_en,
          alt_ar: result.image.alt_ar
        } : undefined,
        image_id: result.image?.id || null,
        company_id: result.company_id || null, // Backend may not return company_id
        company: result.company,
        initials: result.name_en.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('').substring(0, 3),
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
      
      return transformedEmployee;
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error updating employee:', error);
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
      let response: Response;
      
      if (isClient) {
        response = await fetchWithTokenRefresh(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${imageId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(imageData),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/images/${imageId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(imageData),
        });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image alt text update failed:', response.status, errorText);
        throw new Error(`Failed to update image alt text: ${response.status} - ${errorText}`);
      }
      
      await response.json();
      
    } catch (error) {
      console.error('Error in updateImageAltText:', error);
      throw error;
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
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
          throw new Error('Employee not found');
        }
        const errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to delete employee (${response.status})`;
        throw new Error(errorMessage);
      }
      
      // Django DELETE returns 204 No Content or success message directly
    } catch (error) {
      // Handle authentication errors
      if (handleAuthError(error)) {
        throw error; // Re-throw after handling auth
      }
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  /**
   * Get employees by company
   */
  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    try {
      // Check if we're on client side
      const isClient = typeof window !== 'undefined';
      
      let response: Response;
      
      if (isClient) {
        // Client-side: use automatic token refresh
        response = await fetchWithTokenRefresh(`${this.baseUrl}/?company=${companyId}`);
      } else {
        // Server-side: use absolute URL for SSR compatibility
        response = await fetch(`${this.baseUrl}/?company=${companyId}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees by company');
      }
      
      const result = await response.json();
      
      // Django backend returns paginated response with results array
      const employeesArray = result.results || result.data || result;
      
      if (!Array.isArray(employeesArray)) {
        throw new Error('Invalid response from server');
      }
      
      // Transform Django backend format to frontend format
      const transformedEmployees = employeesArray.map((employee: any) => ({
        id: employee.id,
        name: {
          en: employee.name_en,
          ar: employee.name_ar
        },
        position: {
          en: employee.position_en,
          ar: employee.position_ar
        },
        image: employee.image ? {
          id: employee.image.id,
          url: employee.image.url,
          alt_en: employee.image.alt_en,
          alt_ar: employee.image.alt_ar
        } : undefined,
        image_id: employee.image?.id || null,
        company_id: employee.company_id || null, // Backend may not return company_id
        company: employee.company,
        initials: employee.name_en.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('').substring(0, 3),
        createdAt: employee.created_at,
        updatedAt: employee.updated_at
      }));
      
      return transformedEmployees;
    } catch (error) {
      console.error('Error fetching employees by company:', error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
