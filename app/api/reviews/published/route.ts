// app/api/reviews/published/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Review } from '@/lib/types';

// Path to our reviews database file
const dbPath = path.join(process.cwd(), 'data', 'reviews.json');

// Get all reviews from our "database"
const getReviews = (): Review[] => {
  if (!fs.existsSync(dbPath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reviews file:', error);
    return [];
  }
};

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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined;
    const category = searchParams.get('category') || undefined;
    
    // Get all reviews
    const allReviews = getReviews();
    
    // Filter only published reviews
    let publishedReviews = allReviews.filter(review => review.status === 'published');
    
    // Apply additional filters if provided
    if (minRating) {
      publishedReviews = publishedReviews.filter(review => review.rating >= minRating);
    }
    
    
    // Apply limit if provided
    if (limit && limit > 0) {
      publishedReviews = publishedReviews.slice(0, limit);
    }
    
    // Return the published reviews as JSON
    return NextResponse.json({
      total: publishedReviews.length,
      reviews: publishedReviews
    });
  } catch (error) {
    console.error('Error retrieving published reviews:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve published reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}