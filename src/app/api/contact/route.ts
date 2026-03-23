import { NextRequest, NextResponse } from 'next/server';

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, email, phone, subject, message } = body;
    
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, message' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Prepare headers for backend request (no auth required)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Prepare contact form data for backend
    const contactData = {
      name,
      email,
      phone: phone && phone.trim() !== '' ? phone : "Not provided",
      subject,
      message,
    };
    
    // Send to backend contact endpoint (no auth required)
    const response = await fetch(`${baseUrl}/contact/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactData),
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
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      data
    });
    
  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to submit contact form',
        success: false 
      },
      { status: 500 }
    );
  }
}
