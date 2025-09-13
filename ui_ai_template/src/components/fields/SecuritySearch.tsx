'use client';

import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  useColorModeValue,
  Spinner,
  Badge,
  Button,
  Portal,
} from '@chakra-ui/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { securitiesService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Security } from '@/types/api';

interface SecuritySearchProps {
  placeholder?: string;
  onSelect: (security: Security) => void;
  value?: string;
  isDisabled?: boolean;
}

export function SecuritySearch({
  placeholder = "Search for a stock or ETF...",
  onSelect,
  value = "",
  isDisabled = false
}: SecuritySearchProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [searchResults, setSearchResults] = useState<Security[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSecurityState, setSelectedSecurityState] = useState<Security | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputRect, setInputRect] = useState<DOMRect | null>(null);

  // Colors
  const inputBg = useColorModeValue('white', 'navy.800');
  const inputBorder = useColorModeValue('gray.300', 'whiteAlpha.300');
  const textColor = useColorModeValue('navy.700', 'white');
  const grayColor = useColorModeValue('gray.500', 'gray.400');
  const resultsBg = useColorModeValue('white', 'navy.700');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await securitiesService.quickSearch(query, 8, user);
      setSearchResults(response.results);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search securities');
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Debounce search input
  useEffect(() => {
    // Don't search if a security is already selected
    if (selectedSecurityState) {
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch, selectedSecurityState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    setSearchTerm(inputValue);
    setSelectedSecurityState(null); // Clear selected security when user types
  };

  const handleSecuritySelect = (security: Security) => {
    const displayText = `${security.symbol} - ${security.name}`;
    setDisplayValue(displayText);
    setSelectedSecurityState(security);
    setShowResults(false);
    setSearchResults([]); // Clear search results
    onSelect(security);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
    // Update input position for dropdown positioning
    if (inputRef.current) {
      setInputRect(inputRef.current.getBoundingClientRect());
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicks on result items
    setTimeout(() => setShowResults(false), 200);
  };

  const handleClear = () => {
    setSearchTerm('');
    setDisplayValue('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedSecurityState(null);
  };

  return (
    <Box position="relative" w="100%">
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        bg={inputBg}
        border="1px solid"
        borderColor={inputBorder}
        borderRadius="12px"
        px="16px"
        py="12px"
        fontSize="sm"
        color={textColor}
        _focus={{
          borderColor: "brand.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
        }}
        _placeholder={{
          color: grayColor,
        }}
        isDisabled={isDisabled}
      />
      
      {displayValue && (
        <Button
          size="sm"
          variant="ghost"
          position="absolute"
          right="8px"
          top="50%"
          transform="translateY(-50%)"
          onClick={handleClear}
          color={grayColor}
          _hover={{ color: textColor }}
          minW="auto"
          h="auto"
          p="4px"
        >
          ×
        </Button>
      )}

      {/* Search Results Dropdown */}
      {showResults && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg={resultsBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="12px"
          mt="4px"
          maxH="300px"
          overflowY="auto"
          zIndex={9999}
          boxShadow="xl"
          __css={{
            transform: 'translateZ(0)', // Forces hardware acceleration
          }}
        >
          {isSearching && (
            <HStack justify="center" p="20px">
              <Spinner size="sm" color="brand.500" />
              <Text fontSize="sm" color={grayColor}>
                Searching...
              </Text>
            </HStack>
          )}

          {error && (
            <Box p="20px" textAlign="center">
              <Text fontSize="sm" color="red.500">
                {error}
              </Text>
            </Box>
          )}

          {!isSearching && !error && searchResults.length === 0 && searchTerm.length >= 2 && !selectedSecurityState && (
            <Box p="20px" textAlign="center">
              <Text fontSize="sm" color={grayColor}>
                No securities found for "{searchTerm}"
              </Text>
            </Box>
          )}

          {!isSearching && !error && searchResults.length > 0 && (
            <VStack spacing={0} align="stretch">
              {searchResults.map((security) => (
                <Box
                  key={security.symbol}
                  p="12px 16px"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleSecuritySelect(security)}
                  borderRadius="12px"
                  mx="4px"
                  my="2px"
                >
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing="2px">
                      <HStack spacing="8px" align="center">
                        <Text fontSize="sm" fontWeight="600" color={textColor}>
                          {security.symbol}
                        </Text>
                        <Badge 
                          size="sm" 
                          colorScheme={
                            security.security_type === 'ETF' ? 'purple' : 
                            security.security_type === 'CS' ? 'blue' : 'orange'
                          }
                        >
                          {security.security_type}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color={grayColor} noOfLines={1}>
                        {security.name}
                      </Text>
                    </VStack>
                    {security.current_price && (
                      <VStack align="end" spacing="2px">
                        <Text fontSize="sm" fontWeight="500" color={textColor}>
                          ${security.current_price.toFixed(2)}
                        </Text>
                        {security.day_change_percent && (
                          <Text 
                            fontSize="xs" 
                            color={security.day_change_percent >= 0 ? 'green.500' : 'red.500'}
                            fontWeight="500"
                          >
                            {security.day_change_percent >= 0 ? '+' : ''}
                            {security.day_change_percent.toFixed(2)}%
                          </Text>
                        )}
                      </VStack>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
}