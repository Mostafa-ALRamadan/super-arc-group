import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Forward the request to your backend with authentication
    const response = await fetch(`${baseUrl}/images/`, {
      method: 'POST',
      headers,
      body: formData,
      // Don't set Content-Type header for FormData - fetch sets it automatically with boundary
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      // If it's a token expired error, return a specific message
      if (errorData?.code === 'token_not_valid') {
        return NextResponse.json(
          { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
          { status: 401 }
        );
      }
      
      throw new Error(errorData.error || `Backend returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Check if it's a token expired error
    if (error instanceof Error && error.message.includes('Token expired')) {
      return NextResponse.json(
        { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
