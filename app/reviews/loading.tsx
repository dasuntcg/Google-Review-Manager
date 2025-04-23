// app/reviews/loading.tsx
import React from 'react';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import AppLayout from '@/components/layout/AppLayout';

export default function Loading() {
  return (
    <AppLayout>
      <Flex justify="center" align="center" minH="70vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg">Loading reviews...</Text>
        </VStack>
      </Flex>
    </AppLayout>
  );
}