// app/page.tsx

'use client'
import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import AppLayout from '@/components/layout/AppLayout';

export default function HomePage() {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}