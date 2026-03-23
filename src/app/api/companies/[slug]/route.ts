import { NextResponse } from 'next/server';
import { fetchWithTokenRefresh } from '../../../../services/auth/auth-fetch';
import { authService } from '../../../../services/auth/auth.service';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // For GET requests, allow public access (for SSR and public viewing)
    if (request.method === 'GET') {
      const response = await fetch(`${baseUrl}/companies/${slug}/`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Company not found' },
            { status: 404 }
          );
        }
        throw new Error('Failed to fetch company');
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // For POST, PUT, DELETE methods, require authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract token from header
    const token = authHeader.substring(7);
    
    // Set the token in auth service
    (authService as any).accessToken = token;
    
    const response = await authService.fetchWithAuth(`${baseUrl}/companies/${slug}/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch company');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Transform frontend data to backend format
    const backendData = {
      name_en: body.name?.en,
      name_ar: body.name?.ar,
      description_en: body.description?.en,
      description_ar: body.description?.ar,
      link: body.link || '',
      image_id: body.image_id || null
    };
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${baseUrl}/companies/${slug}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(backendData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      throw new Error(errorData.error || `Backend returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${baseUrl}/companies/${slug}/`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      throw new Error(errorData.error || `Backend returned ${response.status}: ${errorText}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete company' },
      { status: 500 }
    );
  }
}
