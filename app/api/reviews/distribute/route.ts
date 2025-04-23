// app/api/reviews/distribute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Review, Endpoint, EndpointResult, DistributionResult } from '@/lib/types';

// Path to our mock database files
const dbPath = path.join(process.cwd(), 'data', 'reviews.json');
const endpointsPath = path.join(process.cwd(), 'data', 'endpoints.json');

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

// Save reviews to our "database"
const saveReviews = (reviews: Review[]): void => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  fs.writeFileSync(dbPath, JSON.stringify(reviews, null, 2));
};

// Get configured distribution endpoints
const getEndpoints = (): Endpoint[] => {
  if (!fs.existsSync(endpointsPath)) {
    // Create a default endpoints file if it doesn't exist
    const defaultEndpoints: Endpoint[] = [
      {
        id: 'website1',
        name: 'Main Website',
        url: 'https://example.com/api/reviews',
        active: true
      },
      {
        id: 'website2',
        name: 'Landing Page',
        url: 'https://landing.example.com/api/testimonials',
        active: false
      }
    ];
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    fs.writeFileSync(endpointsPath, JSON.stringify(defaultEndpoints, null, 2));
    return defaultEndpoints;
  }
  try {
    const data = fs.readFileSync(endpointsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading endpoints file:', error);
    return [];
  }
};

export async function POST(request: NextRequest) {
  try {
    const { reviewIds, endpointIds } = await request.json();
    
    if (!Array.isArray(reviewIds) || !Array.isArray(endpointIds)) {
      return NextResponse.json(
        { message: 'Invalid request body. Expected reviewIds and endpointIds arrays' },
        { status: 400 }
      );
    }

    // Get reviews and endpoints
    const allReviews = getReviews();
    const allEndpoints = getEndpoints();
    
    // Filter reviews to distribute
    const reviewsToDistribute = allReviews.filter(review => 
      reviewIds.includes(review.id)
    );
    
    if (reviewsToDistribute.length === 0) {
      return NextResponse.json(
        { message: 'No reviews found to distribute' },
        { status: 404 }
      );
    }
    
    // Filter active endpoints
    const endpoints = allEndpoints.filter(endpoint => 
      endpointIds.includes(endpoint.id) && endpoint.active
    );
    
    if (endpoints.length === 0) {
      return NextResponse.json(
        { message: 'No active endpoints found' },
        { status: 404 }
      );
    }
    
    // Distribute reviews to each endpoint
    const results: Promise<EndpointResult>[] = endpoints.map(async (endpoint) => {
      try {
        const response = await axios.post(endpoint.url, {
          reviews: reviewsToDistribute
        });
        return {
          endpoint: endpoint.name,
          success: true,
          statusCode: response.status
        };
      } catch (error) {
        return {
          endpoint: endpoint.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    const distributionResults = await Promise.all(results);
    
    // Update review status to 'published'
    const updatedReviews = allReviews.map(review => {
      if (reviewIds.includes(review.id)) {
        return { ...review, status: 'published' as const };
      }
      return review;
    });
    
    // Save updated reviews
    saveReviews(updatedReviews);
    
    const response: DistributionResult = {
      distributed: reviewsToDistribute.length,
      endpoints: endpoints.length,
      results: distributionResults
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error distributing reviews:', error);
    return NextResponse.json(
      { message: 'Failed to distribute reviews', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}