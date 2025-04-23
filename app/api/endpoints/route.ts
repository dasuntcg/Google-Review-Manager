// app/api/endpoints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Endpoint } from '@/lib/types';

// Path to our endpoints database file
const endpointsPath = path.join(process.cwd(), 'data', 'endpoints.json');

// Ensure the data directory and endpoints file exist
const ensureEndpointsFileExists = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  if (!fs.existsSync(endpointsPath)) {
    // Create a default endpoints file
    const defaultEndpoints: Endpoint[] = [
      {
        id: 'website1',
        name: 'Main Website',
        url: 'https://example.com/api/reviews',
        active: true
      },
      {
        id: 'website2',
        name: 'Landing Page',
        url: 'https://landing.example.com/api/testimonials',
        active: false
      }
    ];
    fs.writeFileSync(endpointsPath, JSON.stringify(defaultEndpoints, null, 2));
  }
};

// Get all endpoints
const getEndpoints = (): Endpoint[] => {
  ensureEndpointsFileExists();
  try {
    const data = fs.readFileSync(endpointsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading endpoints file:', error);
    return [];
  }
};

// Save endpoints
const saveEndpoints = (endpoints: Endpoint[]): void => {
  ensureEndpointsFileExists();
  fs.writeFileSync(endpointsPath, JSON.stringify(endpoints, null, 2));
};

// GET - Fetch all endpoints
export async function GET() {
  try {
    const endpoints = getEndpoints();
    return NextResponse.json(endpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return NextResponse.json(
      { message: 'Failed to fetch endpoints', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new endpoint
export async function POST(request: NextRequest) {
  try {
    const { name, url, active = true } = await request.json();
    
    if (!name || !url) {
      return NextResponse.json(
        { message: 'Missing required fields: name and url' },
        { status: 400 }
      );
    }
    
    const endpoints = getEndpoints();
    
    // Create new endpoint
    const newEndpoint: Endpoint = {
      id: uuidv4(),
      name,
      url,
      active,
      createdAt: new Date().toISOString()
    };
    
    // Add to endpoints list
    endpoints.push(newEndpoint);
    
    // Save updated endpoints
    saveEndpoints(endpoints);
    
    return NextResponse.json(newEndpoint, { status: 201 });
  } catch (error) {
    console.error('Error creating endpoint:', error);
    return NextResponse.json(
      { message: 'Failed to create endpoint', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update an endpoint
export async function PUT(request: NextRequest) {
  try {
    const { id, name, url, active } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    const endpoints = getEndpoints();
    const endpointIndex = endpoints.findIndex(endpoint => endpoint.id === id);
    
    if (endpointIndex === -1) {
      return NextResponse.json(
        { message: 'Endpoint not found' },
        { status: 404 }
      );
    }
    
    // Update endpoint
    endpoints[endpointIndex] = {
      ...endpoints[endpointIndex],
      ...(name !== undefined && { name }),
      ...(url !== undefined && { url }),
      ...(active !== undefined && { active }),
      updatedAt: new Date().toISOString()
    };
    
    // Save updated endpoints
    saveEndpoints(endpoints);
    
    return NextResponse.json(endpoints[endpointIndex]);
  } catch (error) {
    console.error('Error updating endpoint:', error);
    return NextResponse.json(
      { message: 'Failed to update endpoint', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    let endpoints = getEndpoints();
    const initialLength = endpoints.length;
    
    // Filter out the endpoint to delete
    endpoints = endpoints.filter(endpoint => endpoint.id !== id);
    
    if (endpoints.length === initialLength) {
      return NextResponse.json(
        { message: 'Endpoint not found' },
        { status: 404 }
      );
    }
    
    // Save updated endpoints
    saveEndpoints(endpoints);
    
    return NextResponse.json({ message: 'Endpoint deleted successfully' });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    return NextResponse.json(
      { message: 'Failed to delete endpoint', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}