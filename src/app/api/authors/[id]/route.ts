import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${baseUrl}/authors/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/authors/[id]:', error);
    
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch author from backend' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Generate proper alt text based on the updated names
    const alt_en = `${body.name_en || 'Unknown'} Employee Photo`;
    const alt_ar = `صورة الموظف ${body.name_ar || 'غير معروف'}`;
    
    const backendData = {
      name_en: body.name_en,
      name_ar: body.name_ar,
      image_id: body.image_id || null,
      bio_en: body.bio_en || '',
      bio_ar: body.bio_ar || '',
      // Include alt text in the update if backend supports it
      alt_en: alt_en,
      alt_ar: alt_ar
    };

    const response = await fetch(`${baseUrl}/authors/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API /api/authors/[id] PUT - Backend error:', response.status, errorText);
      
      // Try to parse error as JSON, fallback to text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      // Extract meaningful error message
      let errorMessage = errorData.message || errorData.error || errorData.detail || `Failed to update author (${response.status})`;
      if (errorData.name_en) errorMessage = `English name: ${errorData.name_en}`;
      if (errorData.name_ar) errorMessage = `Arabic name: ${errorData.name_ar}`;
      if (errorData.bio_en) errorMessage = `English bio: ${errorData.bio_en}`;
      if (errorData.bio_ar) errorMessage = `Arabic bio: ${errorData.bio_ar}`;
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // If the backend response has an image with incorrect alt text, try to update it separately
    if (data.image && body.image_id && (
      data.image.alt_en !== alt_en || 
      data.image.alt_ar !== alt_ar
    )) {
      try {
        const imageUpdateResponse = await fetch(`${baseUrl}/images/${body.image_id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            alt_en: alt_en,
            alt_ar: alt_ar
          }),
        });
        
        if (imageUpdateResponse.ok) {
          // Fetch the updated author data to return
          const updatedAuthorResponse = await fetch(`${baseUrl}/authors/${id}/`, {
            headers: {
              'Authorization': authHeader,
            },
          });
          if (updatedAuthorResponse.ok) {
            const updatedData = await updatedAuthorResponse.json();
            return NextResponse.json(updatedData);
          }
        } else {
          console.warn('API /api/authors/[id] PUT - Failed to update image alt text separately');
        }
      } catch (error) {
        console.warn('API /api/authors/[id] PUT - Error updating image alt text:', error);
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/authors/[id]:', error);
    
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update author' },
      { status: 500 }
    );
  }
}
