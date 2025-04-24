'use client'

import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Container,
  VStack,
  HStack,
  Text,
  Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  currentPath: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, currentPath }) => {
  const isActive = currentPath === href;
  
  return (
    <Link
      as={NextLink}
      href={href}
      px={4}
      py={2}
      rounded="md"
      _hover={{ bg: 'gray.100' }}
      bg={isActive ? 'gray.100' : 'transparent'}
      fontWeight={isActive ? 'bold' : 'normal'}
    >
      {children}
    </Link>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Flex
        as="header"
        position="fixed"
        w="100%"
        bg="white"
        boxShadow="sm"
        zIndex={10}
        py={4}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Heading as="h1" size="md">Google Review Manager</Heading>
            </HStack>
            
            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavItem href="/" currentPath={pathname}>
                Dashboard
              </NavItem>
              <NavItem href="/reviews" currentPath={pathname}>
                Reviews
              </NavItem>
              
              <NavItem href="/settings" currentPath={pathname}>
                Settings
              </NavItem>
            </HStack>
          </Flex>
        </Container>
      </Flex>
      
      {/* Main Content */}
      <Container maxW="container.xl" pt="80px" pb="20px">
        {children}
      </Container>
      
      {/* Footer */}
      <Box as="footer" bg="gray.700" color="white" py={4}>
        <Container maxW="container.xl">
          <VStack spacing={2} align="center">
            <Text fontSize="sm">
              &copy; {new Date().getFullYear()} Google Review Manager
            </Text>
            <Text fontSize="xs">
              Built with Next.js and Chakra UI
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;