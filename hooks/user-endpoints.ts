'use client'

import { useState } from 'react';
import axios from 'axios';
import { Endpoint } from '@/lib/types';

interface EndpointInput {
  name: string;
  url: string;
  active: boolean;
}

interface EndpointUpdateInput {
  id: string;
  name?: string;
  url?: string;
  active?: boolean;
}

const useEndpoints = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all endpoints
  const fetchEndpoints = async (): Promise<Endpoint[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<Endpoint[]>('/api/endpoints');
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch endpoints';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  // Create a new endpoint
  const createEndpoint = async (endpointData: EndpointInput): Promise<Endpoint | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<Endpoint>('/api/endpoints', endpointData);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create endpoint';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Update an endpoint
  const updateEndpoint = async (endpointData: EndpointUpdateInput): Promise<Endpoint | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put<Endpoint>('/api/endpoints', endpointData);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update endpoint';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Delete an endpoint
  const deleteEndpoint = async (endpointId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete('/api/endpoints', {
        data: { id: endpointId }
      });
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete endpoint';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    error,
    fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint
  };
};

export default useEndpoints;