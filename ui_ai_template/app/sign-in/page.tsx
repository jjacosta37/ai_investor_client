'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Icon,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignIn() {
  const { signInWithGoogle, user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const googleBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const googleBorder = useColorModeValue('gray.200', 'whiteAlpha.300');

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      toast({
        title: 'Sign in successful',
        description: 'Welcome! You are now signed in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'An error occurred during sign in.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

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

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <Box
        maxW="md"
        w="full"
        bg={bgColor}
        boxShadow="2xl"
        rounded="xl"
        p={8}
        mx={4}
      >
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color={textColor}>
              Welcome to Chat UI
            </Heading>
            <Text color="gray.500" fontSize="md">
              Sign in to access your personalized chat experience
            </Text>
          </VStack>

          {/* Google Sign In Button */}
          <VStack spacing={4} w="full">
            <Button
              size="lg"
              w="full"
              variant="outline"
              leftIcon={<Icon as={FcGoogle} />}
              onClick={handleGoogleSignIn}
              isLoading={isSigningIn}
              loadingText="Signing in..."
              bg={googleBg}
              border="2px"
              borderColor={googleBorder}
              _hover={{
                bg: useColorModeValue('gray.200', 'whiteAlpha.300'),
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
              fontWeight="semibold"
              fontSize="md"
              h="56px"
            >
              Continue with Google
            </Button>
          </VStack>

          {/* Features */}
          <VStack spacing={3} textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              What you'll get:
            </Text>
            <VStack spacing={1}>
              <Text fontSize="sm" color={textColor}>
                ✨ AI-powered conversations
              </Text>
              <Text fontSize="sm" color={textColor}>
                🔒 Secure and private chats
              </Text>
              <Text fontSize="sm" color={textColor}>
                💾 Chat history saved automatically
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
}
