// app/api/reviews/manage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Review } from '@/lib/types';

// Path to our mock database file
const dbPath = path.join(process.cwd(), 'data', 'reviews.json');

// Ensure the data directory exists
const ensureDbExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
  }
};

// Get all reviews from our "database"
const getReviews = (): Review[] => {
  ensureDbExists();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reviews file:', error);
    return [];
  }
};

// Save reviews to our "database"
const saveReviews = (reviews: Review[]): void => {
  ensureDbExists();
  fs.writeFileSync(dbPath, JSON.stringify(reviews, null, 2));
};

// GET - Return all reviews
export async function GET() {
  try {
    const reviews = getReviews();
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
    const reviewsArray = newReviews.result.reviews;
    
    if (!Array.isArray(reviewsArray)) {
      return NextResponse.json(
        { message: 'Expected an array of reviews' },
        { status: 400 }
      );
    }
    
    // Get existing reviews
    const existingReviews = getReviews();
    
    // Merge and deduplicate reviews based on id (timestamp)
    const reviewMap = new Map<string, Review>();
    
    // Add existing reviews to the map
    existingReviews.forEach(review => {
      reviewMap.set(review.id, review);
    });
    
    // Add or update with new reviews
    reviewsArray.forEach(review => {
      // If review already exists, keep its status and other custom fields
      if (reviewMap.has(review.id)) {
        const existingReview = reviewMap.get(review.id);
        if (existingReview) {
          reviewMap.set(review.id, { 
            ...review,
            status: existingReview.status || 'new',
            dateAdded: existingReview.dateAdded || new Date().toISOString(),
          });
        }
      } else {
        // Otherwise, add as a new review
        reviewMap.set(review.id, { 
          ...review, 
          status: 'new',
          dateAdded: new Date().toISOString(),
        });
      }
    });
    
    // Convert map back to array
    const updatedReviews = Array.from(reviewMap.values());
    
    // Save to "database"
    saveReviews(updatedReviews);
    
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
    
    const reviews = getReviews();
    const reviewIndex = reviews.findIndex(review => review.id === id);
    
    if (reviewIndex === -1) {
      return NextResponse.json(
        { message: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Update the review status
    reviews[reviewIndex].status = status as 'new' | 'published' | 'unpublished';
    
    // Save updated reviews
    saveReviews(reviews);
    
    return NextResponse.json(reviews[reviewIndex]);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { message: 'Failed to update review', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}