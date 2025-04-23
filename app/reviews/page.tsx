// app/reviews/page.tsx
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ReviewsList from '@/components/reviews/ReviewsList';

export const metadata = {
  title: 'Reviews | Google Review Manager',
  description: 'Manage your Google reviews',
};

export default function ReviewsPage() {
  return (
    <AppLayout>
      <ReviewsList />
    </AppLayout>
  );
}