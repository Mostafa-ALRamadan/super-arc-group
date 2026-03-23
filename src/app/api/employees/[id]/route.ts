import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${baseUrl}/employees/${id}/`, {
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        );
      }
      
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
    console.error('Error fetching employee:', error);
    
    // Check if it's a token expired error
    if (error instanceof Error && error.message.includes('Token expired')) {
      return NextResponse.json(
        { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    const response = await fetch(`${baseUrl}/employees/${id}/`, {
      method: 'PUT',
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
    console.error('Error updating employee:', error);
    
    // Check if it's a token expired error
    if (error instanceof Error && error.message.includes('Token expired')) {
      return NextResponse.json(
        { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${baseUrl}/employees/${id}/`, {
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
      
      // If it's a token expired error, return a specific message
      if (errorData?.code === 'token_not_valid') {
        return NextResponse.json(
          { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
          { status: 401 }
        );
      }
      
      throw new Error(errorData.error || `Backend returned ${response.status}: ${errorText}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    
    // Check if it's a token expired error
    if (error instanceof Error && error.message.includes('Token expired')) {
      return NextResponse.json(
        { error: 'Token expired. Please refresh the page to re-login.', needsReauth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
