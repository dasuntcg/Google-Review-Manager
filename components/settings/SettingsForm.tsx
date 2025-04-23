'use client'

import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    Card,
    CardHeader,
    CardBody,
    Divider,
    Switch,
    HStack,
    Text,
    useToast,
    Alert,
    AlertIcon,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    FormHelperText,
    Link,
    Flex
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import useEndpoints from '@/hooks/use-endpoints';
import { Endpoint, SyncSettings } from '@/lib/types';

const SettingsForm: React.FC = () => {
    // State
    const [settings, setSettings] = useState<SyncSettings>({
        googlePlaceId: '',
        syncFrequency: 'weekly',
        syncDay: 1, // Monday
        autoDistribute: false,
        minRating: 4,
        defaultEndpoints: []
    });
    const [availableEndpoints, setAvailableEndpoints] = useState<Endpoint[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);
    const toast = useToast();
    const endpointsHook = useEndpoints();

    // Load settings from localStorage and endpoints from API on mount
    useEffect(() => {
        const loadData = async () => {
            // Load settings
            const storedSettings = localStorage.getItem('reviewManagerSettings');
            if (storedSettings) {
                try {
                    setSettings(JSON.parse(storedSettings));
                } catch (error) {
                    console.error('Error parsing stored settings:', error);
                }
            }

            // Load endpoints
            try {
                const endpoints = await endpointsHook.fetchEndpoints();
                setAvailableEndpoints(endpoints);
            } catch (error) {
                console.error('Error loading endpoints:', error);
                toast({
                    title: 'Error loading endpoints',
                    description: error instanceof Error ? error.message : 'Could not load distribution endpoints',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        };

        loadData();
    }, []);

    // Handle form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        
        const target = e.target;
        const { name, value, type } = target;

        let checked: boolean | undefined;
        if (type === 'checkbox' && target instanceof HTMLInputElement) {
            checked = target.checked;
        }

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Reset saved state when form changes
        if (saved) setSaved(false);
    };

    // Handle number input changes
    const handleNumberChange = (name: string, value: number | string) => {
        setSettings(prev => ({
            ...prev,
            [name]: typeof value === 'string' ? parseInt(value) : value
        }));

        // Reset saved state
        if (saved) setSaved(false);
    };

    // Handle endpoint selection
    const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const endpointId = e.target.value;

        if (endpointId === "") return;

        // Add to defaultEndpoints if not already included
        if (!settings.defaultEndpoints.includes(endpointId)) {
            setSettings(prev => ({
                ...prev,
                defaultEndpoints: [...prev.defaultEndpoints, endpointId]
            }));
        }

        // Reset saved state
        if (saved) setSaved(false);
    };

    // Remove endpoint from defaults
    const removeEndpoint = (endpointId: string) => {
        setSettings(prev => ({
            ...prev,
            defaultEndpoints: prev.defaultEndpoints.filter(id => id !== endpointId)
        }));

        // Reset saved state
        if (saved) setSaved(false);
    };

    // Save settings
    const handleSave = () => {
        setLoading(true);

        try {
            // Validate Place ID
            if (!settings.googlePlaceId.trim()) {
                toast({
                    title: 'Google Place ID Required',
                    description: 'Please enter your Google Place ID to continue',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                setLoading(false);
                return;
            }

            // Store in localStorage
            localStorage.setItem('reviewManagerSettings', JSON.stringify(settings));

            // Update environment variable (in a real app, this would be a server-side update)
            // For this demo, we'll simulate by using localStorage
            localStorage.setItem('GOOGLE_PLACE_ID', settings.googlePlaceId);

            // Show success message
            toast({
                title: 'Settings saved',
                description: 'Your settings have been saved successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setSaved(true);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: 'Error saving settings',
                description: error instanceof Error ? error.message : 'Something went wrong',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Get endpoint name by ID
    const getEndpointName = (id: string): string => {
        const endpoint = availableEndpoints.find(ep => ep.id === id);
        return endpoint ? endpoint.name : 'Unknown Endpoint';
    };

    return (
        <Box>
            <Heading as="h1" size="lg" mb={6}>Settings</Heading>

            <VStack spacing={6} align="stretch">
                {/* Google API Settings */}
                <Card>
                    <CardHeader pb={2}>
                        <Heading size="md">Google API Settings</Heading>
                    </CardHeader>

                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Google Place ID</FormLabel>
                                <Input
                                    name="googlePlaceId"
                                    value={settings.googlePlaceId}
                                    onChange={handleChange}
                                    placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                                />
                                <FormHelperText>
                                    Your Google Place ID is required to fetch reviews.{' '}
                                    <Link
                                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                        isExternal
                                        color="blue.500"
                                    >
                                        How to find your Place ID <ExternalLinkIcon mx="2px" />
                                    </Link>
                                </FormHelperText>
                            </FormControl>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Sync Settings */}
                <Card>
                    <CardHeader pb={2}>
                        <Heading size="md">Synchronization Settings</Heading>
                    </CardHeader>

                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Sync Frequency</FormLabel>
                                <Select
                                    name="syncFrequency"
                                    value={settings.syncFrequency}
                                    onChange={handleChange}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="manual">Manual Only</option>
                                </Select>
                                <FormHelperText>
                                    How often to automatically fetch new reviews from Google
                                </FormHelperText>
                            </FormControl>

                            {settings.syncFrequency === 'weekly' && (
                                <FormControl>
                                    <FormLabel>Sync Day</FormLabel>
                                    <Select
                                        name="syncDay"
                                        value={settings.syncDay}
                                        onChange={handleChange}
                                    >
                                        <option value={1}>Monday</option>
                                        <option value={2}>Tuesday</option>
                                        <option value={3}>Wednesday</option>
                                        <option value={4}>Thursday</option>
                                        <option value={5}>Friday</option>
                                        <option value={6}>Saturday</option>
                                        <option value={0}>Sunday</option>
                                    </Select>
                                </FormControl>
                            )}

                            <Divider />

                            <FormControl display="flex" alignItems="center">
                                <FormLabel htmlFor="auto-distribute" mb="0">
                                    Auto-distribute new reviews
                                </FormLabel>
                                <Switch
                                    id="auto-distribute"
                                    name="autoDistribute"
                                    isChecked={settings.autoDistribute}
                                    onChange={handleChange}
                                    colorScheme="green"
                                />
                            </FormControl>

                            {settings.autoDistribute && (
                                <>
                                    <FormControl>
                                        <FormLabel>Minimum Rating for Auto-distribution</FormLabel>
                                        <NumberInput
                                            min={1}
                                            max={5}
                                            value={settings.minRating}
                                            onChange={(valueString) => handleNumberChange('minRating', valueString)}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                        <FormHelperText>
                                            Only auto-distribute reviews with this rating or higher
                                        </FormHelperText>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Default Distribution Endpoints</FormLabel>
                                        <Select
                                            placeholder="Select endpoint to add"
                                            onChange={handleEndpointChange}
                                            value=""
                                        >
                                            {availableEndpoints
                                                .filter(ep => ep.active)
                                                .map(endpoint => (
                                                    <option key={endpoint.id} value={endpoint.id}>
                                                        {endpoint.name}
                                                    </option>
                                                ))}
                                        </Select>
                                        <FormHelperText>
                                            Selected endpoints will receive auto-distributed reviews
                                        </FormHelperText>
                                    </FormControl>

                                    {/* List of selected endpoints */}
                                    {settings.defaultEndpoints.length > 0 && (
                                        <Box mt={2}>
                                            <Text fontWeight="medium" mb={2}>Selected Endpoints:</Text>
                                            <VStack align="stretch" spacing={2}>
                                                {settings.defaultEndpoints.map(endpointId => (
                                                    <Flex
                                                        key={endpointId}
                                                        justify="space-between"
                                                        align="center"
                                                        p={2}
                                                        bg="gray.50"
                                                        borderRadius="md"
                                                    >
                                                        <Text>{getEndpointName(endpointId)}</Text>
                                                        <Button
                                                            size="xs"
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            onClick={() => removeEndpoint(endpointId)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Flex>
                                                ))}
                                            </VStack>
                                        </Box>
                                    )}

                                    {settings.defaultEndpoints.length === 0 && settings.autoDistribute && (
                                        <Alert status="warning">
                                            <AlertIcon />
                                            No default endpoints selected. Auto-distributed reviews won't be sent anywhere.
                                        </Alert>
                                    )}
                                </>
                            )}
                        </VStack>
                    </CardBody>
                </Card>

                {/* Save Button */}
                <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleSave}
                    isLoading={loading}
                    loadingText="Saving..."
                >
                    Save Settings
                </Button>

                {saved && (
                    <Alert status="success">
                        <AlertIcon />
                        Settings saved successfully!
                    </Alert>
                )}
            </VStack>
        </Box>
    );
};

export default SettingsForm;