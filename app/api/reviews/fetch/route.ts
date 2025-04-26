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
    const { data } = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'reviews',
          key: apiKey,
        },
      }
    );

    console.log('Google Places response:', JSON.stringify(data, null, 2));

    // Extract and augment reviews
    const rawReviews = data.result?.reviews ?? [];
    const reviewsWithStatus: Review[] = rawReviews.map((r: any) => ({
      ...r,
      id: String(r.time),             // timestamp as ID
      status: 'new' as const,         // default status
      dateAdded: new Date().toISOString(),
    }));

    // Rebuild the payload to mirror Google's structure
    const formatted = {
      html_attributions: data.html_attributions || [],
      result: {
        reviews: reviewsWithStatus,
      },
      status: data.status || 'OK',
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Failed to fetch reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}