import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function GET(request: NextRequest) {
  try {
    // For public author listing, allow access without authentication
    // Authors are generally public information needed for blog posts
    const response = await fetch(`${baseUrl}/authors/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GET /api/authors - backend error:', errorText);
      throw new Error(`Failed to fetch authors: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/authors:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch authors' },
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
      name_en: body.name_en,
      name_ar: body.name_ar,
      image_id: body.image_id || null,
      bio_en: body.bio_en || '',
      bio_ar: body.bio_ar || ''
    };

    // Forward the request to backend with proper auth
    const response = await fetch(`${baseUrl}/authors/`, {
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
    console.error('Error creating author:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create author' },
      { status: 500 }
    );
  }
}
