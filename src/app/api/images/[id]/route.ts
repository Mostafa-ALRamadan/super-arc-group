import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // First, get the image metadata from backend API
    const metadataResponse = await fetch(`${baseUrl}/images/${id}/`, {
      method: 'GET',
    });
    
    if (!metadataResponse.ok) {
      console.error('Image metadata fetch failed:', metadataResponse.status, metadataResponse.statusText);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    const imageMetadata = await metadataResponse.json();
    
    // Get the actual image URL from the metadata
    const imageUrl = imageMetadata.url || imageMetadata.image;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL not found' },
        { status: 404 }
      );
    }
    
    // Check if the URL already includes the backend URL
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
    
    // Fetch the actual image file using the URL from metadata
    const imageResponse = await fetch(fullImageUrl, {
      method: 'GET',
    });
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Image file fetch failed:', imageResponse.status, imageResponse.statusText);
      return NextResponse.json(
        { error: 'Image file not found', details: errorText },
        { status: 404 }
      );
    }
    
    // Get the image data
    const imageBlob = await imageResponse.blob();
    
    // Return the image with proper headers
    return new Response(imageBlob, {
      headers: {
        'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
        'Content-Length': imageResponse.headers.get('Content-Length') || '',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*', // Allow CORS
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to serve image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Update the image alt text
    const response = await fetch(`${baseUrl}/images/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
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
      { success: false, error: error instanceof Error ? error.message : 'Failed to update image' },
      { status: 500 }
    );
  }
}
