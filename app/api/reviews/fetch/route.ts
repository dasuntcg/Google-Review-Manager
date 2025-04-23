// app/api/reviews/fetch/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { Review } from '@/lib/types';

export async function GET() {
  try {
    // Get API credentials from environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;
    
    // Check if credentials exist
    if (!apiKey || !placeId) {
      return NextResponse.json(
        { message: 'Missing API credentials. Please set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in environment variables.' },
        { status: 500 }
      );
    }
    
    // Make a request to Google Places API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    );

    const reviews = response.data.result.reviews || [];
    
    // Add custom status field to each review
    const reviewsWithStatus: Review[] = reviews.map((review: any) => ({
      ...review,
      id: review.time.toString(), // Using timestamp as ID
      status: 'new' as const, // Default status for newly fetched reviews
      dateAdded: new Date().toISOString(),
    }));

    return NextResponse.json(reviewsWithStatus);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}