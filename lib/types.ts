// lib/types.ts

export interface Review {
    id: string;
    author_name: string;
    rating: number;
    text: string;
    time: number;
    profile_photo_url?: string;
    status: 'new' | 'published' | 'unpublished';
    dateAdded: string;
  }
  
  export interface Endpoint {
    id: string;
    name: string;
    url: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface DistributionResult {
    distributed: number;
    endpoints: number;
    results: EndpointResult[];
  }
  
  export interface EndpointResult {
    endpoint: string;
    success: boolean;
    statusCode?: number;
    error?: string;
  }
  
  export interface SyncSettings {
    googlePlaceId: string;
    syncFrequency: 'daily' | 'weekly' | 'monthly' | 'manual';
    syncDay: number;
    autoDistribute: boolean;
    minRating: number;
    defaultEndpoints: string[];
  }