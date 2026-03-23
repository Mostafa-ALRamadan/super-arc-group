import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}`;
    
    // Call the backend dashboard stats endpoint directly
    const response = await fetch(`${baseUrl}/dashboard/stats/`);
    
    if (!response.ok) {
      throw new Error('Backend dashboard stats endpoint failed');
    }
    
    const stats = await response.json();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return default values on error
    return NextResponse.json({
      total_blogs: 0,
      total_projects: 0,
      total_employees: 0,
      total_companies: 0
    }, { status: 500 });
  }
}
