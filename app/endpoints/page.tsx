// app/endpoints/page.tsx
'use client'
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import EndpointsList from '@/components/endpoints/EndpointsList';


export default function EndpointsPage() {
  return (
    <AppLayout>
      <EndpointsList />
    </AppLayout>
  );
}