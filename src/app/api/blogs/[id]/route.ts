import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Forward the request to backend with the user's auth token
    const response = await fetch(`${baseUrl}/blogs/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch blog: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching blog:', error);
    
    // If authentication failed, return 401 to trigger client logout
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
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
      title_en: body.title.en,
      title_ar: body.title.ar,
      excerpt_en: body.excerpt.en,
      excerpt_ar: body.excerpt.ar,
      content: body.content, // Editor.js format
      cover_image_id: body.cover_image_id || null,
      category_id: body.category_id,
      author_id: body.author_id,
      reading_time: body.reading_time || 5,
      tags_en: body.tags?.en || [],
      tags_ar: body.tags?.ar || [],
      status: body.status || 'draft',
      is_featured: body.is_featured || false,
      published_at: body.published_at || new Date().toISOString(),
      seo: body.seo || {
        meta_description: '',
        keywords: '',
        og_title: '',
        og_description: ''
      }
    };
    
    // Forward the request to backend with proper auth
    const response = await fetch(`${baseUrl}/blogs/${id}/`, {
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
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Forward DELETE request to backend
    const response = await fetch(`${baseUrl}/blogs/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete blog: ${response.status} - ${errorText}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    
    // If authentication failed, return 401 to trigger client logout
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
