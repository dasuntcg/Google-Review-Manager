'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Button,
  HStack,
  VStack,
  Text,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  useToast,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { SearchIcon, RepeatIcon } from '@chakra-ui/icons';
import ReviewCard from './ReviewCard';
import useReviews from '@/hooks/use-reviews';
import useEndpoints from '@/hooks/use-endpoints';
import { Review, Endpoint } from '@/lib/types';

const ReviewsList: React.FC = () => {
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Hooks
  const reviewsHook = useReviews();
  const endpointsHook = useEndpoints();
  
  // Initial data loading
  useEffect(() => {
    loadData();
  }, []);
  
  // Load all required data
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch reviews from our database
      const reviewsData = await reviewsHook.fetchStoredReviews();
      setReviews(reviewsData);
      
      // Fetch endpoints
      const endpointsData = await endpointsHook.fetchEndpoints();
      setEndpoints(endpointsData);
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
  
  // Fetch new reviews from Google
  const fetchNewReviews = async () => {
    try {
      const updatedReviews = await reviewsHook.fetchNewReviews();
      setReviews(updatedReviews);
      
      toast({
        title: 'Reviews updated',
        description: 'Successfully fetched latest reviews from Google',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error fetching reviews',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle status change
  const handleStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      await reviewsHook.updateReviewStatus(reviewId, newStatus);
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, status: newStatus as 'new' | 'published' | 'unpublished' } 
          : review
      ));
      
      toast({
        title: 'Status updated',
        description: `Review status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle distribute
  // const handleDistribute = async (reviewIds: string[]) => {
  //   try {
  //     const result = await reviewsHook.distributeReviews(
  //       reviewIds, 
  //       selectedEndpoints
  //     );
      
  //     if (result) {
  //       // Update local state to mark reviews as published
  //       setReviews(reviews.map(review => 
  //         reviewIds.includes(review.id) 
  //           ? { ...review, status: 'published' } 
  //           : review
  //       ));
        
  //       // Reset selections
  //       setSelectedReviews([]);
  //       setSelectedEndpoints([]);
  //       onClose();
        
  //       toast({
  //         title: 'Reviews distributed',
  //         description: `Successfully distributed ${result.distributed} reviews to ${result.endpoints} endpoints`,
  //         status: 'success',
  //         duration: 3000,
  //         isClosable: true,
  //       });
  //     }
  //   } catch (error) {
  //     toast({
  //       title: 'Error distributing reviews',
  //       description: error instanceof Error ? error.message : 'Something went wrong',
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // };
  
  // Handle bulk distribute
  const handleBulkDistribute = () => {
    if (selectedReviews.length === 0) {
      toast({
        title: 'No reviews selected',
        description: 'Please select at least one review to distribute',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onOpen();
  };
  
  // Toggle review selection
  const toggleReviewSelection = (reviewId: string) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };
  
  // Toggle endpoint selection
  const toggleEndpointSelection = (endpointId: string) => {
    setSelectedEndpoints(prev => 
      prev.includes(endpointId)
        ? prev.filter(id => id !== endpointId)
        : [...prev, endpointId]
    );
  };
  
  // Filter and search reviews
  const filteredReviews = reviews
    .filter(review => {
      // Filter by status
      if (filter !== 'all' && review.status !== filter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm.trim() !== '' && 
          !(review.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.text.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => b.time - a.time); // Sort by date, newest first
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">Reviews Manager</Heading>
        
        <HStack>
          <Button 
            leftIcon={<RepeatIcon />} 
            colorScheme="blue" 
            onClick={fetchNewReviews}
            isLoading={reviewsHook.loading}
          >
            Fetch New Reviews
          </Button>
          
         
        </HStack>
      </Flex>
      
      {/* Filters */}
      <Flex 
        bg="white" 
        p={4} 
        borderRadius="md" 
        boxShadow="sm" 
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        align={{ md: 'center' }}
        justify="space-between"
        gap={4}
      >
        <HStack spacing={4} width={{ base: '100%', md: 'auto' }}>
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            width="150px"
          >
            <option value="all">All Reviews</option>
            <option value="new">New</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </Select>
          
          <Badge colorScheme="blue" px={2} py={1}>
            {filteredReviews.length} Reviews
          </Badge>
        </HStack>
        
        <InputGroup width={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search reviews..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Flex>
      
      {/* Loading state */}
      {loading && (
        <Flex justify="center" my={10}>
          <VStack>
            <Spinner size="xl" />
            <Text mt={4}>Loading reviews...</Text>
          </VStack>
        </Flex>
      )}
      
      {/* Error state from hooks */}
      {(reviewsHook.error || endpointsHook.error) && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {reviewsHook.error || endpointsHook.error}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading && filteredReviews.length === 0 && (
        <Box textAlign="center" my={10} p={6} bg="white" borderRadius="md">
          <Heading as="h3" size="md" mb={2}>No reviews found</Heading>
          <Text mb={4}>
            {searchTerm || filter !== 'all' 
              ? "Try changing your filters or search term" 
              : "Click 'Fetch New Reviews' to get started"}
          </Text>
          
          <Button 
            onClick={fetchNewReviews} 
            colorScheme="blue"
            isLoading={reviewsHook.loading}
          >
            Fetch Reviews from Google
          </Button>
        </Box>
      )}
      
      {/* Reviews grid */}
      {!loading && filteredReviews.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredReviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review}
              onStatusChange={handleStatusChange}
              
              onSelect={toggleReviewSelection}
              isSelected={selectedReviews.includes(review.id)}
              selectedEndpoints={selectedEndpoints}
            />
          ))}
        </SimpleGrid>
      )}
      
     
    </Box>
  );
};

export default ReviewsList;