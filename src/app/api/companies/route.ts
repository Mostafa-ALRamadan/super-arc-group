import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

async function getAuthToken() {
  // Get credentials from environment variables only
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  
  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required');
  }
  
  const response = await fetch(`${baseUrl}/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Authentication failed:', errorText);
    throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.access;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // For public company listing, only return published companies without authentication
    if (status === 'published' || !status) {
      // Public access - no authentication required for published companies
      const response = await fetch(
        status === 'published' ? `${baseUrl}/companies/?status=published` : `${baseUrl}/companies/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GET /api/companies - backend error:', errorText);
        throw new Error(`Failed to fetch published companies: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // For admin access (all companies including drafts), require authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Forward the request to backend with the user's auth token
    const response = await fetch(`${baseUrl}/companies/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Don't expose technical details to client
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Access denied');
      }
      if (response.status >= 500) {
        throw new Error('Server error');
      }
      
      console.error(`Companies API error: ${response.status} - ${errorText}`);
      throw new Error('Failed to fetch companies');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching companies:', error);
    
    // If authentication failed, return 401 to trigger client logout
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Transform the frontend data to match backend expectations
    const backendData = {
      name_en: body.name.en,
      name_ar: body.name.ar,
      description_en: body.description.en,
      description_ar: body.description.ar,
      link: body.link || '',
      image_id: body.image_id || null // Backend expects image_id, not image object
    };
    
    // Forward the request to backend with proper auth
    const response = await fetch(`${baseUrl}/companies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
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
    console.error('Error creating company:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create company' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Transform the frontend data to match backend expectations
    const backendData = {
      name_en: body.name.en,
      name_ar: body.name.ar,
      description_en: body.description.en,
      description_ar: body.description.ar,
      link: body.link || '',
      image_id: body.image_id || null // Backend expects image_id, not image object
    };
    
    // Forward the request to backend with proper auth
    const response = await fetch(`${baseUrl}/companies/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
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
    console.error('Error updating company:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update company' },
      { status: 500 }
    );
  }
}
