'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  IconButton,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  useToast,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Text
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import useEndpoints from '@/hooks/use-endpoints';
import { Endpoint } from '@/lib/types';

interface FormData {
  name: string;
  url: string;
  active: boolean;
}

const EndpointsList: React.FC = () => {
  // State
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    active: true
  });
  
  // Hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const endpointsHook = useEndpoints();
  
  // Load endpoints
  useEffect(() => {
    loadEndpoints();
  }, []);
  
  const loadEndpoints = async () => {
    setLoading(true);
    try {
      const data = await endpointsHook.fetchEndpoints();
      setEndpoints(data);
    } catch (error) {
      console.error('Error loading endpoints:', error);
      toast({
        title: 'Error loading endpoints',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Open modal for creating new endpoint
  const handleAddNew = () => {
    setSelectedEndpoint(null);
    setFormData({
      name: '',
      url: '',
      active: true
    });
    onOpen();
  };
  
  // Open modal for editing endpoint
  const handleEdit = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setFormData({
      name: endpoint.name,
      url: endpoint.url,
      active: endpoint.active
    });
    onOpen();
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Submit form to create/update endpoint
  const handleSubmit = async () => {
    // Validate form
    if (!formData.name.trim() || !formData.url.trim()) {
      toast({
        title: 'Validation error',
        description: 'Name and URL are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      if (selectedEndpoint) {
        // Update existing endpoint
        const updatedEndpoint = await endpointsHook.updateEndpoint({
          id: selectedEndpoint.id,
          ...formData
        });
        
        if (updatedEndpoint) {
          // Update local state
          setEndpoints(endpoints.map(ep => 
            ep.id === updatedEndpoint.id ? updatedEndpoint : ep
          ));
          
          toast({
            title: 'Endpoint updated',
            description: `Successfully updated ${updatedEndpoint.name}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        // Create new endpoint
        const newEndpoint = await endpointsHook.createEndpoint(formData);
        
        if (newEndpoint) {
          // Update local state
          setEndpoints([...endpoints, newEndpoint]);
          
          toast({
            title: 'Endpoint created',
            description: `Successfully created ${newEndpoint.name}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      }
      
      // Close modal and reset form
      onClose();
      setFormData({
        name: '',
        url: '',
        active: true
      });
    } catch (error) {
      toast({
        title: selectedEndpoint ? 'Error updating endpoint' : 'Error creating endpoint',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Delete endpoint
  const handleDelete = async (endpointId: string) => {
    if (!window.confirm('Are you sure you want to delete this endpoint?')) {
      return;
    }
    
    try {
      const success = await endpointsHook.deleteEndpoint(endpointId);
      
      if (success) {
        // Update local state
        setEndpoints(endpoints.filter(ep => ep.id !== endpointId));
        
        toast({
          title: 'Endpoint deleted',
          description: 'Successfully deleted the endpoint',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error deleting endpoint',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Toggle endpoint active status
  const handleToggleActive = async (endpoint: Endpoint) => {
    try {
      const updatedEndpoint = await endpointsHook.updateEndpoint({
        id: endpoint.id,
        active: !endpoint.active
      });
      
      if (updatedEndpoint) {
        // Update local state
        setEndpoints(endpoints.map(ep => 
          ep.id === updatedEndpoint.id ? updatedEndpoint : ep
        ));
        
        toast({
          title: updatedEndpoint.active ? 'Endpoint activated' : 'Endpoint deactivated',
          description: `${updatedEndpoint.name} is now ${updatedEndpoint.active ? 'active' : 'inactive'}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating endpoint',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">Distribution Endpoints</Heading>
        
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={handleAddNew}
        >
          Add New Endpoint
        </Button>
      </Flex>
      
      {/* Loading state */}
      {loading && (
        <Flex justify="center" my={10}>
          <Spinner size="xl" />
        </Flex>
      )}
      
      {/* Error state */}
      {endpointsHook.error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {endpointsHook.error}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading && endpoints.length === 0 && (
        <Box textAlign="center" my={10} p={6} bg="white" borderRadius="md">
          <Heading as="h3" size="md" mb={2}>No endpoints configured</Heading>
          <Text mb={4}>
            Add endpoints to distribute your reviews to various websites
          </Text>
          
          <Button 
            onClick={handleAddNew} 
            colorScheme="blue"
            leftIcon={<AddIcon />}
          >
            Add Your First Endpoint
          </Button>
        </Box>
      )}
      
      {/* Endpoints table */}
      {!loading && endpoints.length > 0 && (
        <Box 
          bg="white" 
          borderRadius="md" 
          boxShadow="sm" 
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Name</Th>
                <Th>URL</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {endpoints.map(endpoint => (
                <Tr key={endpoint.id}>
                  <Td fontWeight="medium">{endpoint.name}</Td>
                  <Td><Text noOfLines={1}>{endpoint.url}</Text></Td>
                  <Td>
                    <Flex align="center">
                      <Switch 
                        colorScheme="green" 
                        size="sm" 
                        isChecked={endpoint.active}
                        onChange={() => handleToggleActive(endpoint)}
                        mr={2}
                      />
                      <Badge colorScheme={endpoint.active ? 'green' : 'gray'}>
                        {endpoint.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Flex>
                  </Td>
                  <Td>
                    {endpoint.createdAt ? 
                      new Date(endpoint.createdAt).toLocaleDateString() : 
                      'N/A'}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        aria-label="Edit"
                        size="sm"
                        onClick={() => handleEdit(endpoint)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete"
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(endpoint.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEndpoint ? 'Edit Endpoint' : 'Add New Endpoint'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Endpoint Name</FormLabel>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Main Website"
              />
              <FormHelperText>
                A friendly name to identify this endpoint
              </FormHelperText>
            </FormControl>
            
            <FormControl mb={4} isRequired>
              <FormLabel>API URL</FormLabel>
              <Input 
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/api/reviews"
              />
              <FormHelperText>
                The endpoint that will receive the reviews via POST request
              </FormHelperText>
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="is-active" mb="0">
                Active
              </FormLabel>
              <Switch 
                id="is-active" 
                name="active"
                isChecked={formData.active}
                onChange={handleInputChange}
                colorScheme="green"
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={endpointsHook.loading}
            >
              {selectedEndpoint ? 'Update' : 'Create'} Endpoint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EndpointsList;