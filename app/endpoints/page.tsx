// app/endpoints/page.tsx
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import EndpointsList from '@/components/endpoints/EndpointsList';

export const metadata = {
  title: 'Distribution Endpoints | Google Review Manager',
  description: 'Manage distribution endpoints for your Google reviews',
};

export default function EndpointsPage() {
  return (
    <AppLayout>
      <EndpointsList />
    </AppLayout>
  );
}