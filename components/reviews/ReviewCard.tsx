'use client'

import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Badge, 
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Avatar,
  Divider,
  useToast,
  Checkbox
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
  onStatusChange: (reviewId: string, newStatus: string) => void;
  onDistribute: (reviewId: string) => void;
  onSelect: (reviewId: string) => void;
  isSelected: boolean;
  selectedEndpoints: string[];
}

// Helper function to render stars
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <HStack spacing={1}>
      {[...Array(5)].map((_, i) => (
        <Box 
          key={i} 
          color={i < rating ? 'yellow.400' : 'gray.300'}
          fontSize="md"
        >
          ★
        </Box>
      ))}
      <Text ml={2} fontWeight="bold">{rating}</Text>
    </HStack>
  );
};

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onStatusChange, 
  onDistribute, 
  onSelect, 
  isSelected, 
  selectedEndpoints 
}) => {
  const toast = useToast();
  
  // Format timestamp to readable date
  const reviewDate = new Date(review.time * 1000);
  const formattedDate = format(reviewDate, 'MMM dd, yyyy');
  
  // Status badge colors
  const statusColors: Record<string, string> = {
    new: 'blue',
    published: 'green',
    unpublished: 'gray'
  };
  
  // Handle distribute click
  const handleDistribute = () => {
    if (selectedEndpoints.length === 0) {
      toast({
        title: 'No endpoints selected',
        description: 'Please select at least one endpoint to distribute to',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onDistribute(review.id);
  };
  
  // Handle selection toggle
  const handleSelect = () => {
    onSelect(review.id);
  };
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      bg="white"
      p={4} 
      boxShadow="sm"
      position="relative"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
      borderColor={isSelected ? 'blue.500' : 'gray.200'}
    >
      {/* Selection checkbox */}
      <Box position="absolute" top={3} right={3}>
        <Checkbox 
          isChecked={isSelected} 
          onChange={handleSelect}
          colorScheme="blue"
        />
      </Box>
      
      {/* Header with author info */}
      <Flex align="center" mb={3}>
        <Avatar 
          name={review.author_name} 
          src={review.profile_photo_url} 
          size="sm" 
          mr={3}
        />
        <Box>
          <Text fontWeight="bold">{review.author_name}</Text>
          <Text fontSize="sm" color="gray.500">{formattedDate}</Text>
        </Box>
      </Flex>
      
      {/* Rating */}
      <StarRating rating={review.rating} />
      
      {/* Review content */}
      <Text mt={3} fontSize="md">
        {review.text}
      </Text>
      
      <Divider my={3} />
      
      {/* Actions */}
      <Flex justify="space-between" align="center">
        <Badge colorScheme={statusColors[review.status]} px={2} py={1}>
          {review.status.toUpperCase()}
        </Badge>
        
        <HStack spacing={2}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
              Change Status
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => onStatusChange(review.id, 'new')}>
                New
              </MenuItem>
              <MenuItem onClick={() => onStatusChange(review.id, 'published')}>
                Published
              </MenuItem>
              <MenuItem onClick={() => onStatusChange(review.id, 'unpublished')}>
                Unpublished
              </MenuItem>
            </MenuList>
          </Menu>
          
         
        </HStack>
      </Flex>
    </Box>
  );
};

export default ReviewCard;