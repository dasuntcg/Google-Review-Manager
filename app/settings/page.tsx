// app/settings/page.tsx
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SettingsForm from '@/components/settings/SettingsForm';

export const metadata = {
  title: 'Settings | Google Review Manager',
  description: 'Configure your Google Review Manager settings',
};

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsForm />
    </AppLayout>
  );
}