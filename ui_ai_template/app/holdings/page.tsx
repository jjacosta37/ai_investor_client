'use client';

import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { MdPieChart, MdTrendingUp, MdRefresh, MdAdd, MdAccountBalance, MdEdit } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BaseModal } from '@/components/modal/BaseModal';
import { holdingsService } from '@/services/api';
import { HoldingsResponse } from '@/types/api';
import { PortfolioSummary } from '@/components/holdings/PortfolioSummary';
import { PortfolioTreemap } from '@/components/holdings/PortfolioTreemap';

export default function Holdings() {
  // Auth state
  const { user } = useAuth();

  // Holdings state
  const [portfolioData, setPortfolioData] = useState<HoldingsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const gray = useColorModeValue('gray.500', 'gray.400');

  // Fetch user's holdings from server
  const fetchHoldings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await holdingsService.getUserHoldings(user);
      setPortfolioData(response);
    } catch (error) {
      console.error('Error fetching holdings:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load holdings',
      );
      setPortfolioData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load holdings on component mount and when user changes
  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchHoldings();
  };

  return (
    <Flex
      w="100%"
      direction="column"
      position="relative"
      h="calc(100vh - 60px)"
      p="20px"
    >
      <VStack spacing="30px" align="stretch" maxW="1400px" mx="auto" w="100%">
        {/* Header */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap="20px"
        >
          <HStack spacing="15px">
            <Icon
              as={MdPieChart}
              width="32px"
              height="32px"
              color={brandColor}
            />
            <Text color={textColor} fontSize="28px" fontWeight="700">
              Holdings
            </Text>
          </HStack>
          <HStack spacing="12px">
            <Button
              leftIcon={<Icon as={MdAdd} />}
              variant="outline"
              borderColor={brandColor}
              color={brandColor}
              _hover={{
                bg: brandColor,
                color: 'white',
              }}
              onClick={onOpen}
            >
              Add Investments
            </Button>
            <Button
              leftIcon={<Icon as={MdRefresh} />}
              variant="outline"
              borderColor={brandColor}
              color={brandColor}
              _hover={{
                bg: brandColor,
                color: 'white',
              }}
              onClick={handleRefresh}
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              Refresh Data
            </Button>
          </HStack>
        </Flex>

        {/* Error State */}
        {error && (
          <Alert status="error" borderRadius="12px">
            <AlertIcon />
            <Box>
              <AlertTitle>Error loading portfolio!</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing the page or check your
                connection.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && !error ? (
          <Flex justify="center" align="center" h="60vh">
            <VStack spacing="20px">
              <Spinner color={brandColor} size="xl" />
              <Text color={textColor} fontSize="lg" fontWeight="600">
                Loading your portfolio...
              </Text>
            </VStack>
          </Flex>
        ) : portfolioData && portfolioData.count === 0 ? (
          /* Empty State */
          <Flex
            direction="column"
            justify="center"
            align="center"
            h="60vh"
            textAlign="center"
          >
            <Icon
              as={MdTrendingUp}
              width="80px"
              height="80px"
              color={gray}
              mb="20px"
            />
            <Text color={textColor} fontSize="24px" fontWeight="600" mb="10px">
              No Holdings Found
            </Text>
            <Text color={gray} fontSize="16px" mb="30px" maxW="500px">
              You don't have any holdings in your portfolio yet. Holdings
              represent the actual securities you own, not just the ones you're
              watching.
            </Text>
            <Button
              leftIcon={<Icon as={MdRefresh} />}
              variant="primary"
              py="20px"
              px="16px"
              fontSize="sm"
              borderRadius="45px"
              w={{ base: '200px', md: '250px' }}
              h="54px"
              _hover={{
                boxShadow:
                  '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
                _disabled: {
                  bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
                },
              }}
              onClick={handleRefresh}
              isLoading={isLoading}
            >
              Refresh Portfolio
            </Button>
          </Flex>
        ) : portfolioData ? (
          /* Portfolio Content */
          <VStack spacing="30px" w="100%" align="stretch">
            {/* Portfolio Summary Cards */}
            <PortfolioSummary
              portfolioData={portfolioData}
              isLoading={isLoading}
            />

            {/* Portfolio Treemap */}
            <PortfolioTreemap
              holdings={portfolioData.results}
              totalValue={portfolioData.total_portfolio_value}
            />
          </VStack>
        ) : null}
      </VStack>

      {/* Add Investments Modal */}
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Add Investments"
        icon={MdAdd}
        size="lg"
      >
        <Text color={gray} fontSize="sm" mb="20px">
          Choose how you'd like to add your investments to track your portfolio.
        </Text>
        <VStack spacing="16px" align="stretch">
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
            onClick={() => {
              // TODO: Implement Plaid integration
              console.log('Plaid integration clicked');
              onClose();
            }}
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
          <Button
            leftIcon={<Icon as={MdEdit} />}
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
            onClick={() => {
              // TODO: Implement manual entry
              console.log('Manual entry clicked');
              onClose();
            }}
          >
            <VStack spacing="2px">
              <Text fontSize="md" fontWeight="600">
                Manually Add Investments
              </Text>
              <Text fontSize="xs" opacity={0.8}>
                Enter your holdings information manually
              </Text>
            </VStack>
          </Button>
        </VStack>
      </BaseModal>
    </Flex>
  );
}
