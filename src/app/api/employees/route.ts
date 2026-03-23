import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function GET(request: Request) {
  try {
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company');
    
    // Build URL with query params and fetch directly
    const response = await fetch(
      `${baseUrl}/employees/${companyId ? `?company=${companyId}` : ''}`, {
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
    console.error('Error fetching employees:', error);
    
    // Check if it's a token expired error
    if (error instanceof Error && error.message.includes('Token expired')) {
      return NextResponse.json(
        { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${baseUrl}/employees/`, {
      method: 'POST',
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
    console.error('Error creating employee:', error);
    
    // Check if it's a token expired error
    if (error instanceof Error && error.message.includes('Token expired')) {
      return NextResponse.json(
        { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
