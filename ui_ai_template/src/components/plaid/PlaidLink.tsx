'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { MdAccountBalance } from 'react-icons/md';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '@/contexts/AuthContext';
import { plaidService } from '@/services/api/plaid';

interface PlaidLinkProps {
  onSuccess: () => void;
  onError?: (error: any) => void;
  onExit?: () => void;
  buttonProps?: any;
  children?: React.ReactNode;
}

export function PlaidLink({
  onSuccess,
  onError,
  onExit,
  buttonProps = {},
  children,
}: PlaidLinkProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');

  // Create link token when component mounts
  const createLinkToken = useCallback(async () => {
    if (!user || linkToken || isCreatingToken) return;

    try {
      setIsCreatingToken(true);
      const response = await plaidService.createLinkToken(user);
      setLinkToken(response.link_token);
    } catch (error) {
      console.error('Failed to create link token:', error);
      toast({
        title: 'Connection Failed',
        description: 'Unable to initialize Plaid Link. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onError?.(error);
    } finally {
      setIsCreatingToken(false);
    }
  }, [user, linkToken, isCreatingToken, toast, onError]);

  // Initialize link token when component mounts
  useEffect(() => {
    createLinkToken();
  }, [createLinkToken]);

  // Handle successful Link flow
  const handleOnSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      console.log('Plaid Link onSuccess called:', { public_token, metadata });

      if (!user) return;

      try {
        setIsConnecting(true);

        // Exchange public token for access token
        const response = await plaidService.exchangePublicToken(
          public_token,
          user,
        );

        // Show success toast
        toast({
          title: 'Account Connected!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Call onSuccess callback with the new item data
        onSuccess();
      } catch (error) {
        console.error('Failed to exchange token:', error);
        toast({
          title: 'Connection Failed',
          description:
            'Failed to complete account connection. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        onError?.(error);
      } finally {
        setIsConnecting(false);
      }
    },
    [user, toast, onSuccess, onError],
  );

  // Handle Plaid Link errors
  const handleOnError = useCallback(
    (error: any) => {
      console.error('Plaid Link error:', error);
      toast({
        title: 'Connection Error',
        description:
          error.error_message || 'An error occurred during account connection.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onError?.(error);
    },
    [toast, onError],
  );

  // Handle user exiting Link flow
  const handleOnExit = useCallback(
    (error: any, metadata: any) => {
      console.log('User exited Plaid Link:', { error, metadata });

      if (error) {
        toast({
          title: 'Connection Cancelled',
          description: 'Account connection was cancelled.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }

      onExit?.();
    },
    [toast, onExit],
  );

  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  };

  const { open, ready } = usePlaidLink(config);

  // Handle button click
  const handleClick = () => {
    if (ready && linkToken) {
      open();
    } else if (!linkToken && !isCreatingToken) {
      // Retry creating link token
      createLinkToken();
    }
  };

  // Button loading states
  const isLoading = isCreatingToken || isConnecting || !ready;
  const loadingText = isCreatingToken
    ? 'Initializing...'
    : isConnecting
    ? 'Connecting...'
    : !ready
    ? 'Loading...'
    : undefined;

  // Render custom children if provided
  if (children) {
    return (
      <div
        onClick={handleClick}
        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        {children}
      </div>
    );
  }

  // Default button rendering
  return (
    <Button
      leftIcon={<Icon as={MdAccountBalance} />}
      variant="outline"
      borderColor={brandColor}
      color={brandColor}
      size="lg"
      h="60px"
      borderRadius="12px"
      _hover={{
        bg: brandColor,
        color: 'white',
      }}
      isLoading={isLoading}
      loadingText={loadingText}
      isDisabled={isLoading}
      onClick={handleClick}
      {...buttonProps}
    >
      <VStack spacing="2px">
        <Text fontSize="md" fontWeight="600">
          Connect via Plaid
        </Text>
        <Text fontSize="xs" opacity={0.8}>
          Automatically sync your brokerage accounts
        </Text>
      </VStack>
    </Button>
  );
}

// Export a simple hook for using Plaid Link programmatically
export function usePlaidConnection() {
  const { user } = useAuth();
  const toast = useToast();

  const connectAccount = useCallback(
    async (onSuccess?: (itemId: string, institutionName: string) => void) => {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to connect your account.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        // Create link token
        const tokenResponse = await plaidService.createLinkToken(user);

        // You would need to implement the Link flow here
        // This is just a placeholder for the hook pattern
        console.log('Link token created:', tokenResponse.link_token);
      } catch (error) {
        console.error('Failed to connect account:', error);
        toast({
          title: 'Connection Failed',
          description: 'Unable to connect account. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [user, toast],
  );

  return { connectAccount };
}
