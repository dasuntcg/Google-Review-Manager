// app/api/cron/fetch-reviews/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get API credentials
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;
    
    if (!apiKey || !placeId) {
      return NextResponse.json(
        { message: 'Missing API credentials' },
        { status: 500 }
      );
    }
    
    // Fetch reviews from Google
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
    
    const fetchedReviews = data.result?.reviews || [];
    
    // Process each review
    let newReviewsCount = 0;
 
    
    for (const review of fetchedReviews) {
      const reviewId = String(review.time);
      
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId }
      });
      
      if (!existingReview) {
        // Create new review
        await prisma.review.create({
          data: {
            id: reviewId,
            author_name: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time,
            profile_photo_url: review.profile_photo_url || '',
            status: 'new',
            dateAdded: new Date()
          }
        });
        newReviewsCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      newReviews: newReviewsCount,
      message: `Successfully processed reviews: ${newReviewsCount} new`
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { message: 'Error in scheduled task', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}