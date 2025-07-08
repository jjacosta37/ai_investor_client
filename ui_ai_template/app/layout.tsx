'use client';
import React, { ReactNode } from 'react';
import type { AppProps } from 'next/app';
import {
  ChakraProvider,
  Box,
  Portal,
  useDisclosure,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import theme from '@/theme/theme';
import routes from '@/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import Navbar from '@/components/navbar/NavbarAdmin';
import { getActiveRoute, getActiveNavbar } from '@/utils/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/styles/globals.css';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import AppWrappers from './AppWrappers';
import { useAuth } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';

function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <ChatProvider>
      <Box>
        <Sidebar routes={routes} />
        <Box
          pt={{ base: '60px', md: '000px' }}
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                logoText={'Chat AI Template'}
                brandText={getActiveRoute(routes, pathname)}
                secondary={getActiveNavbar(routes, pathname)}
              />
            </Box>
          </Portal>
          <Box
            mx="auto"
            p={{ base: '20px', md: '30px' }}
            pe="20px"
            minH="100vh"
            pt="50px"
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ChatProvider>
  );
}

function RootLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Handle authentication redirects
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname?.includes('sign-in');

      if (!user && !isAuthPage) {
        // Redirect to sign-in if not authenticated and not already on auth page
        router.push('/sign-in');
      } else if (user && isAuthPage) {
        // Redirect to home if authenticated and on auth page
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        <Text>Loading...</Text>
      </Flex>
    );
  }

  // Show sign-in page if on auth route
  if (pathname?.includes('sign-in')) {
    return <>{children}</>;
  }

  // Show main app layout if authenticated
  if (user) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // Fallback - should not reach here due to useEffect redirect
  return null;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id={'root'}>
        <AppWrappers>
          <RootLayoutContent>{children}</RootLayoutContent>
        </AppWrappers>
      </body>
    </html>
  );
}
