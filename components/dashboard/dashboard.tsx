'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Flex,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Divider
} from '@chakra-ui/react';
import { RepeatIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import useReviews from '@/hooks/use-reviews';
import useEndpoints from '@/hooks/use-endpoints';
import { format, subDays } from 'date-fns';
import { Review, Endpoint } from '@/lib/types';

// Star rating component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <HStack spacing={1}>
      {[...Array(5)].map((_, i) => (
        <Box 
          key={i} 
          color={i < rating ? 'yellow.400' : 'gray.300'}
          fontSize="lg"
        >
          ★
        </Box>
      ))}
    </HStack>
  );
};

// Review summary card
const ReviewSummaryCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <Card size="sm" variant="outline">
      <CardBody p={4}>
        <Flex mb={2} justify="space-between" align="center">
          <Text fontWeight="bold" noOfLines={1}>{review.author_name}</Text>
          <StarRating rating={review.rating} />
        </Flex>
        <Text fontSize="sm" noOfLines={2}>{review.text}</Text>
      </CardBody>
    </Card>
  );
};

interface DashboardStats {
  total: number;
  new: number;
  published: number;
  unpublished: number;
  avgRating: string;
  recentReviews: Review[];
}

const Dashboard: React.FC = () => {
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    new: 0,
    published: 0,
    unpublished: 0,
    avgRating: '0',
    recentReviews: []
  });
  
  // Hooks
  const reviewsHook = useReviews();
  const endpointsHook = useEndpoints();
  const toast = useToast();
  
  // Initial data loading
  useEffect(() => {
    loadData();
  }, []);
  
  // Load all required data
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch reviews
      const reviewsData = await reviewsHook.fetchStoredReviews();
      setReviews(reviewsData);
      
      // Fetch endpoints
      const endpointsData = await endpointsHook.fetchEndpoints();
      setEndpoints(endpointsData);
      
      // Calculate stats
      calculateStats(reviewsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate review statistics
  const calculateStats = (reviewsData: Review[]) => {
    if (!reviewsData || reviewsData.length === 0) {
      setStats({
        total: 0,
        new: 0,
        published: 0,
        unpublished: 0,
        avgRating: '0',
        recentReviews: []
      });
      return;
    }
    
    // Count by status
    const byStatus = reviewsData.reduce((acc: Record<string, number>, review) => {
      acc[review.status] = (acc[review.status] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate average rating
    const sumRatings = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = sumRatings / reviewsData.length;
    
    // Get recent reviews (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30).getTime() / 1000;
    const recentReviews = reviewsData
      .filter(review => review.time >= thirtyDaysAgo)
      .sort((a, b) => b.time - a.time);
    
    setStats({
      total: reviewsData.length,
      new: byStatus.new || 0,
      published: byStatus.published || 0,
      unpublished: byStatus.unpublished || 0,
      avgRating: avgRating.toFixed(1),
      recentReviews: recentReviews.slice(0, 5) // Top 5 most recent
    });
  };
  
  // Fetch new reviews from Google
  const handleRefreshReviews = async () => {
    try {
      const updatedReviews = await reviewsHook.fetchNewReviews();
      setReviews(updatedReviews);
      calculateStats(updatedReviews);
      
      toast({
        title: 'Reviews updated',
        description: 'Successfully fetched latest reviews from Google',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error refreshing reviews:', error);
      toast({
        title: 'Error refreshing reviews',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Flex>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">Dashboard</Heading>
        
        <Button 
          leftIcon={<RepeatIcon />} 
          colorScheme="blue"
          onClick={handleRefreshReviews}
          isLoading={reviewsHook.loading}
        >
          Refresh Reviews
        </Button>
      </Flex>
      
      {/* Error notifications */}
      {(reviewsHook.error || endpointsHook.error) && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {reviewsHook.error || endpointsHook.error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Stat
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          borderLeft="4px solid"
          borderLeftColor="blue.500"
        >
          <StatLabel>Total Reviews</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
          <StatHelpText>All Google reviews</StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          borderLeft="4px solid"
          borderLeftColor="yellow.500"
        >
          <StatLabel>Average Rating</StatLabel>
          <Flex align="center">
            <StatNumber>{stats.avgRating}</StatNumber>
            <Text color="yellow.500" ml={2} fontSize="xl">★</Text>
          </Flex>
          <StatHelpText>Out of 5 stars</StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          borderLeft="4px solid"
          borderLeftColor="green.500"
        >
          <StatLabel>Published Reviews</StatLabel>
          <StatNumber>{stats.published}</StatNumber>
          <StatHelpText>
            {stats.total > 0 ? `${Math.round((stats.published / stats.total) * 100)}% of total` : '0% of total'}
          </StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          borderLeft="4px solid"
          borderLeftColor="purple.500"
        >
          <StatLabel>New Reviews</StatLabel>
          <StatNumber>{stats.new}</StatNumber>
          <StatHelpText>Waiting for approval</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      {/* Main content grid */}
      <Grid
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
        gap={6}
      >
        {/* Recent Reviews */}
        <GridItem>
          <Card>
            <CardHeader pb={0}>
              <Flex justify="space-between" align="center">
                <Heading size="md">Recent Reviews</Heading>
                <Button
                  as={Link}
                  href="/reviews"
                  size="sm"
                  rightIcon={<ExternalLinkIcon />}
                  variant="ghost"
                >
                  View All
                </Button>
              </Flex>
            </CardHeader>
            
            <CardBody>
              {stats.recentReviews.length === 0 ? (
                <Text textAlign="center" py={6} color="gray.500">
                  No recent reviews found
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {stats.recentReviews.map(review => (
                    <ReviewSummaryCard key={review.id} review={review} />
                  ))}
                </VStack>
              )}
            </CardBody>
            
            <CardFooter pt={0}>
              <Button 
                width="full" 
                colorScheme="blue" 
                as={Link} 
                href="/reviews"
              >
                Manage All Reviews
              </Button>
            </CardFooter>
          </Card>
        </GridItem>
        
        {/* Status & Endpoint Summary */}
        <GridItem>
          <Card mb={6}>
            <CardHeader pb={0}>
              <Heading size="md">Review Status</Heading>
            </CardHeader>
            
            <CardBody>
              {stats.total === 0 ? (
                <Text textAlign="center" py={4} color="gray.500">
                  No reviews to display
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>New</Text>
                      <Text>{stats.new} ({Math.round((stats.new / stats.total) * 100)}%)</Text>
                    </Flex>
                    <Progress value={(stats.new / stats.total) * 100} colorScheme="blue" borderRadius="full" />
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>Published</Text>
                      <Text>{stats.published} ({Math.round((stats.published / stats.total) * 100)}%)</Text>
                    </Flex>
                    <Progress value={(stats.published / stats.total) * 100} colorScheme="green" borderRadius="full" />
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>Unpublished</Text>
                      <Text>{stats.unpublished} ({Math.round((stats.unpublished / stats.total) * 100)}%)</Text>
                    </Flex>
                    <Progress value={(stats.unpublished / stats.total) * 100} colorScheme="gray" borderRadius="full" />
                  </Box>
                </VStack>
              )}
            </CardBody>
          </Card>
          
          
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;