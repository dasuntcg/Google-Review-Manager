// app/api/reviews/published/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API key validation (you would implement a more secure solution in production)
const validateApiKey = (apiKey: string | null): boolean => {
  // Replace this with your actual API key validation logic
  const validApiKey = process.env.API_KEY || 'your-api-key-here';
  return apiKey === validApiKey;
};

export async function GET(request: NextRequest) {
  try {
    // Check for API key in the request headers
    const apiKey = request.headers.get('x-api-key');
    
    if (!validateApiKey(apiKey)) {
      return NextResponse.json(
        { message: 'Unauthorized. Invalid or missing API key.' },
        { status: 401 }
      );
    }

    // Get filter parameters from URL
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const minRatingParam = searchParams.get('minRating');
    const minRating = minRatingParam ? parseInt(minRatingParam) : undefined;
    const category = searchParams.get('category') || undefined;
    
    // Build the where clause for filtering
    const where = {
      status: 'published',
      ...(minRating && { rating: { gte: minRating } }),
      // You can add category filtering here if needed
    };
    
    // Get total count of matching reviews
    const total = await prisma.review.count({
      where
    });
    
    // Get filtered reviews
    const publishedReviews = await prisma.review.findMany({
      where,
      orderBy: {
        time: 'desc'
      },
      ...(limit && { take: limit }),
    });
    
    // Create response with cache headers for better performance
    const response = NextResponse.json({
      total,
      reviews: publishedReviews
    });
    
    // Cache for 1 hour but revalidate every minute
    response.headers.set('Cache-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('Error retrieving published reviews:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve published reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}