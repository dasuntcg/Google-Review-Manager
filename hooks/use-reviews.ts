// hooks/use-reviews.ts
'use client'

import { useState } from 'react';
import axios from 'axios';
import { Review } from '@/lib/types';

const useReviews = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all reviews from database
  const fetchStoredReviews = async (): Promise<Review[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<Review[]>('/api/reviews/manage');
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  // Fetch new reviews from Google Places API
  const fetchNewReviews = async (): Promise<Review[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // First fetch from Google API
      const reviewsResponse = await axios.get('/api/reviews/fetch');
      const newReviews = reviewsResponse.data;
      
      // Then store them in our database
      const saveResponse = await axios.post('/api/reviews/manage', newReviews);
      
      setLoading(false);
      return saveResponse.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch new reviews';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  // Update review status
  const updateReviewStatus = async (reviewId: string, newStatus: string): Promise<Review | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put<Review>('/api/reviews/manage', {
        id: reviewId,
        status: newStatus
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  return {
    loading,
    error,
    fetchStoredReviews,
    fetchNewReviews,
    updateReviewStatus
  };
};

export default useReviews;