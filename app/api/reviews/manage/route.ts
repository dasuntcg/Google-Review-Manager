// app/api/reviews/manage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Review } from '@/lib/types';

// GET - Return all reviews
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: {
        time: 'desc'
      }
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    return NextResponse.json(
      { message: 'Failed to get reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Save new reviews
export async function POST(request: NextRequest) {
  try {
    const newReviews = await request.json();
    console.log('New reviews:', newReviews);
    
    // Handle both formats: direct array or nested under result.reviews
    let reviewsArray;
    if (newReviews.result && newReviews.result.reviews) {
      reviewsArray = newReviews.result.reviews;
    } else if (Array.isArray(newReviews)) {
      reviewsArray = newReviews;
    } else {
      return NextResponse.json(
        { message: 'Expected reviews data in a valid format' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(reviewsArray)) {
      return NextResponse.json(
        { message: 'Expected an array of reviews' },
        { status: 400 }
      );
    }
    
    // Get existing review IDs
    const existingReviewIds = await prisma.review.findMany({
      where: {
        id: {
          in: reviewsArray.map(review => review.id)
        }
      },
      select: {
        id: true,
        status: true,
        dateAdded: true
      }
    });
    
    // Create a map for easier lookup
    const existingMap = new Map();
    existingReviewIds.forEach((review: { id: string; status: string; dateAdded: Date }) => {
      existingMap.set(review.id, review);
    });
    
    // Process each review using upsert
    for (const review of reviewsArray) {
      const existing = existingMap.get(review.id);
      
      await prisma.review.upsert({
        where: { id: review.id },
        update: {
          author_name: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
          profile_photo_url: review.profile_photo_url || '',
          // Keep existing status and dateAdded if they exist
          status: existing ? existing.status : 'new',
          dateAdded: existing ? existing.dateAdded : new Date()
        },
        create: {
          id: review.id,
          author_name: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
          profile_photo_url: review.profile_photo_url || '',
          status: 'new',
          dateAdded: new Date()
        }
      });
    }
    
    // Fetch all reviews to return the updated list
    const updatedReviews = await prisma.review.findMany({
      orderBy: {
        time: 'desc'
      }
    });
    
    return NextResponse.json(updatedReviews);
  } catch (error) {
    console.error('Error saving reviews:', error);
    return NextResponse.json(
      { message: 'Failed to save reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update review status
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { message: 'Missing required fields: id and status' },
        { status: 400 }
      );
    }
    
    try {
      // Update the review
      const updatedReview = await prisma.review.update({
        where: { id },
        data: { status }
      });
      
      return NextResponse.json(updatedReview);
    } catch (error) {
      // If review not found
      if (error.code === 'P2025') {
        return NextResponse.json(
          { message: 'Review not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { message: 'Failed to update review', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}