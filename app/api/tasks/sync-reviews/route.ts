// app/api/tasks/sync-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Review, SyncSettings, Endpoint } from '@/lib/types';

// Path to our files
const dbPath = path.join(process.cwd(), 'data', 'reviews.json');
const endpointsPath = path.join(process.cwd(), 'data', 'endpoints.json');

// Get settings from localStorage (if this were a real app, this would come from a database)
const getSettings = (): SyncSettings | null => {
  // For a real app, you would fetch this from a database
  // For this demo, we'll simulate reading from a file
  const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
  
  if (fs.existsSync(settingsPath)) {
    try {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading settings file:', error);
      return null;
    }
  }
  
  return null;
};

// Get reviews from our file storage
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

// Save reviews to our file storage
const saveReviews = (reviews: Review[]): void => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  fs.writeFileSync(dbPath, JSON.stringify(reviews, null, 2));
};

// Get endpoints from our file storage
const getEndpoints = (): Endpoint[] => {
  if (!fs.existsSync(endpointsPath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(endpointsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading endpoints file:', error);
    return [];
  }
};

export async function GET(request: NextRequest) {
  try {
    // This API would be called by a cron job or scheduler
    const settings = getSettings();
    
    if (!settings) {
      return NextResponse.json(
        { message: 'No settings found. Please configure the application.' },
        { status: 400 }
      );
    }
    
    // Check if sync should run based on frequency settings
    // This is a simplified check - a real implementation would be more sophisticated
    const shouldSync = true; // For demo purposes, always sync
    
    if (!shouldSync) {
      return NextResponse.json({
        message: 'No sync scheduled for now according to settings.',
        syncSkipped: true
      });
    }
    
    // Get API credentials
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = settings.googlePlaceId || process.env.GOOGLE_PLACE_ID;
    
    if (!apiKey || !placeId) {
      return NextResponse.json(
        { message: 'Missing API credentials. Please set GOOGLE_PLACES_API_KEY and configure your Google Place ID.' },
        { status: 500 }
      );
    }
    
    // Fetch reviews from Google Places API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    );
    
    const fetchedReviews = response.data.result.reviews || [];
    
    // Process reviews
    const existingReviews = getReviews();
    const reviewMap = new Map<string, Review>();
    
    // Add existing reviews to the map
    existingReviews.forEach(review => {
      reviewMap.set(review.id, review);
    });
    
    // Add or update with new reviews
    const newReviews: Review[] = [];
    
    fetchedReviews.forEach((review: any) => {
      const reviewId = review.time.toString();
      
      // Create review object
      const reviewObj: Review = {
        ...review,
        id: reviewId,
        dateAdded: new Date().toISOString(),
        status: 'new' as const
      };
      
      // Check if it's a new review
      if (!reviewMap.has(reviewId)) {
        newReviews.push(reviewObj);
        
        // Add to map
        reviewMap.set(reviewId, reviewObj);
      }
    });
    
    // Auto-distribute if enabled
    // if (settings.autoDistribute && newReviews.length > 0) {
    //   const highRatedReviews = newReviews.filter(review => review.rating >= settings.minRating);
      
    //   if (highRatedReviews.length > 0 && settings.defaultEndpoints.length > 0) {
    //     // Get active endpoints
    //     const allEndpoints = getEndpoints();
    //     const activeEndpoints = allEndpoints.filter(endpoint => 
    //       settings.defaultEndpoints.includes(endpoint.id) && endpoint.active
    //     );
        
    //     if (activeEndpoints.length > 0) {
    //       // Mark reviews as published
    //       highRatedReviews.forEach(review => {
    //         const mapReview = reviewMap.get(review.id);
    //         if (mapReview) {
    //           mapReview.status = 'published';
    //         }
    //       });
          
    //       // In a real app, you would make API calls to distribute these reviews
    //       // For this demo, we'll just simulate that it happened
    //       console.log(`Auto-distributed ${highRatedReviews.length} reviews to ${activeEndpoints.length} endpoints`);
    //     }
    //   }
    // }
    
    // Convert map back to array and save
    const updatedReviews = Array.from(reviewMap.values());
    saveReviews(updatedReviews);
    
    return NextResponse.json({
      message: 'Sync completed successfully',
      totalReviews: updatedReviews.length,
      newReviews: newReviews.length,
      autoDistributed: settings.autoDistribute ? 
        newReviews.filter(review => review.rating >= settings.minRating).length : 0
    });
  } catch (error) {
    console.error('Error in scheduled sync:', error);
    return NextResponse.json(
      { message: 'Failed to sync reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}