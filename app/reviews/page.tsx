// app/reviews/page.tsx
'use client'
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ReviewsList from '@/components/reviews/ReviewsList';



export default function ReviewsPage() {
  return (
    <AppLayout>
      <ReviewsList />
    </AppLayout>
  );
}