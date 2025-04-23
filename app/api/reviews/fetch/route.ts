// app/api/reviews/fetch/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { Review } from '@/lib/types';

export async function GET() {
    try {
        // Get API credentials from environment variables
        const apiKey = 'AIzaSyC90DX-JK6bB5QBeA015-6Y2b09SGdA6Ak';
        const placeId = 'ChIJhSubTmJfIWsRVSCWpZOoWhM';

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

        const { data } = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    fields: 'reviews',
                    key: apiKey,
                },
            }
        )

        console.log('Google Places response:', JSON.stringify(data, null, 2))


        const original = response.data;

        // (2) Extract and augment reviews
        const rawReviews = original.result?.reviews ?? [];
        const reviewsWithStatus: Review[] = rawReviews.map((r: any) => ({
            ...r,
            id: String(r.time),             // timestamp as ID
            status: 'new' as const,         // your default status
            dateAdded: new Date().toISOString(),
        }));

        // (3) Rebuild the payload to mirror Google’s structure
        const formatted = {
            html_attributions: original.html_attributions || [],
            result: {
                reviews: reviewsWithStatus,
            },
            status: original.status || 'OK',
        };

        return NextResponse.json(formatted);

        // const reviews = response.data.result.reviews || [];

        // // Add custom status field to each review
        // const reviewsWithStatus: Review[] = reviews.map((review: any) => ({
        //   ...review,
        //   id: review.time.toString(), // Using timestamp as ID
        //   status: 'new' as const, // Default status for newly fetched reviews
        //   dateAdded: new Date().toISOString(),
        // }));

        // return NextResponse.json(reviewsWithStatus);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { message: 'Failed to fetch reviews', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}