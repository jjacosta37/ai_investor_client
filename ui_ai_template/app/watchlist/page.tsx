'use client';

import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Spinner,
  List,
  ListItem,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { MdBookmark, MdAdd, MdTrendingUp, MdSearch, MdShowChart } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { WatchlistCard, StockData } from '@/components/watchlist/WatchlistCard';
import { securitiesService, watchlistService } from '@/services/api';
import { Security, WatchlistItem } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { transformWatchlistToStockDataArray, findWatchlistItemIdBySymbol } from '@/utils/watchlistTransform';

export default function Watchlist() {
  // Auth state
  const { user } = useAuth();
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Security[]>([]);
  
  // Watchlist state
  const [watchlistStocks, setWatchlistStocks] = useState<StockData[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);

  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const gray = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const modalBg = useColorModeValue('white', 'navy.800');

  // Fetch user's watchlist from server
  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setIsLoadingWatchlist(false);
      return;
    }

    try {
      setIsLoadingWatchlist(true);
      const response = await watchlistService.getUserWatchlist(user);
      setWatchlistItems(response.results);
      
      // Transform to UI format
      const stockData = transformWatchlistToStockDataArray(response.results);
      setWatchlistStocks(stockData);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      // Keep empty state on error
      setWatchlistItems([]);
      setWatchlistStocks([]);
    } finally {
      setIsLoadingWatchlist(false);
    }
  }, [user]);

  // Load watchlist on component mount and when user changes
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Remove stock from watchlist
  const handleRemoveStock = async (symbol: string) => {
    if (!user) return;

    // Find the watchlist item ID
    const watchlistItemId = findWatchlistItemIdBySymbol(watchlistItems, symbol);
    if (!watchlistItemId) {
      console.error('Could not find watchlist item ID for symbol:', symbol);
      return;
    }

    try {
      // Optimistically remove from UI
      setWatchlistStocks(prev => prev.filter(stock => stock.symbol !== symbol));
      setWatchlistItems(prev => prev.filter(item => item.security.symbol !== symbol));

      // Call server API
      await watchlistService.removeFromWatchlist(watchlistItemId, user);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      // Revert the optimistic update on error
      fetchWatchlist();
    }
  };

  // Debounced search with useEffect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Show loading state immediately when user starts typing
    setIsSearching(true);

    // Set up the debounced search
    const timeoutId = setTimeout(async () => {
      try {
        const response = await securitiesService.quickSearch(searchQuery, 10, user);
        setSearchResults(response.results);
      } catch (error) {
        console.error('Error searching securities:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1500); // Wait 1.5 seconds after user stops typing

    // Cleanup function to cancel the previous timeout
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery, user]);

  // Simple function to update search query (no longer handles search directly)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToWatchlist = async (item: Security) => {
    if (!user) return;

    // Check if already in watchlist
    if (watchlistStocks.some(stock => stock.symbol === item.symbol)) {
      console.log('Stock already in watchlist:', item.symbol);
      onClose();
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    try {
      setIsAddingToWatchlist(true);
      
      // Call server API to add to watchlist
      const response = await watchlistService.addToWatchlist(item.symbol, user);
      
      // Update local state with the new item
      const newWatchlistItem = response;
      setWatchlistItems(prev => [...prev, newWatchlistItem]);
      
      // Transform using the utility function for consistency
      const newStockData: StockData = {
        symbol: item.symbol,
        companyName: item.name,
        currentPrice: item.current_price || 0,
        change: item.day_change || 0,
        changePercent: item.day_change_percent || 0,
        volume: item.volume || 0,
        marketCap: item.market_cap ? `$${(item.market_cap / 1000000000).toFixed(1)}B` : 'N/A',
        peRatio: item.pe_ratio || 0,
        weekHigh52: item.week_52_high || (item.current_price || 0),
        weekLow52: item.week_52_low || (item.current_price || 0),
        lastUpdated: response.added_at,
        news: item.news_summary ? [
          {
            id: `${response.id}-news-1`,
            headline: item.news_summary.substring(0, 100) + (item.news_summary.length > 100 ? '...' : ''),
            source: 'Market News',
            publishedAt: '1 hour ago',
            sentiment: 'positive'
          }
        ] : [
          {
            id: `${response.id}-news-1`,
            headline: `Oscar Health faces significant near-term challenges with deteriorating profitability metrics despite strong membership growth, as elevated medical costs and higher market risk scores pressure margins.`,
            source: 'Market News',
            publishedAt: '1 hour ago',
            sentiment: 'negative'
          }
        ],
        upcomingEvents: [
          {
            type: 'earnings',
            date: 'Feb 15, 2024',
            description: 'Next Earnings Report'
          }
        ],
        executiveSummary: `Oscar Health (OSCR) is facing significant headwinds following its Q2 2025 earnings release on August 6, 2025. Despite strong membership growth to 2.03 million members (up from 1.58 million YoY), the company reported disappointing financial results with a substantial net loss and deteriorating medical loss ratios. The company has revised its 2025 guidance downward due to higher-than-expected market risk scores across its ACA marketplace footprint. Revenue of $2.86 billion missed analyst estimates of $2.97 billion, though it represented 29% year-over-year growth. The medical loss ratio surged to 91.1%, well above the ~80% threshold typically required for profitability in the ACA market, driven by rising healthcare costs and higher member morbidity. The company reported a net loss of $228.4 million (-$0.89 EPS) compared to a net income of $56.2 million in Q2 2024. Medical expenses jumped dramatically from $1.71 billion to $2.55 billion year-over-year. Oscar has revised its 2025 guidance to expect a medical loss ratio of 86-87%, operating losses of $200-300 million, and adjusted EBITDA losses of approximately $120 million. The stock declined following the earnings announcement, though the company maintains a strong cash position of $2.99 billion.`,
        keyHighlights: [
          'Q2 2025 revenue miss ($2.86B vs $2.97B est.) with 91.1% medical loss ratio well above profitability threshold',
          'Net loss of $228.4M (-$0.89 EPS) compared to $56.2M profit in Q2 2024, driven by $2.55B in medical expenses',
          '2025 guidance revised with MLR expectations of 86-87% and operating losses of $200-300M',
          'Membership grew 28% YoY to 2.03M members, showing strong market penetration',
          'Stock declined following earnings but maintains $2.99B cash position for strategic flexibility'
        ],
        positiveCatalysts: [
          'Strong membership growth of 28% YoY demonstrates market traction and competitive positioning',
          'Robust cash position of $2.99B provides financial flexibility for strategic investments',
          'Expanding ACA marketplace footprint with potential for geographic diversification',
          'Technology-driven healthcare model appeals to younger demographics',
          'Opportunity for medical cost management improvements as operations mature'
        ],
        riskFactors: [
          'Medical loss ratio of 91.1% significantly above profitability threshold of ~80%',
          'Higher-than-expected market risk scores pressuring profitability across footprint',
          'Revised 2025 guidance indicates ongoing operational challenges with $200-300M operating losses',
          'Competitive ACA marketplace with established insurers having cost advantages',
          'Regulatory risk from potential ACA marketplace changes affecting business model'
        ]
      };

      setWatchlistStocks(prev => [...prev, newStockData]);
      
      onClose();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      // Handle error - you could show a toast notification here
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  return (
    <Flex
      w="100%"
      direction="column"
      position="relative"
      h="calc(100vh - 60px)"
      p="20px"
    >
      <VStack spacing="30px" align="stretch" maxW="1200px" mx="auto" w="100%">
        {/* Header */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap="20px"
        >
          <HStack spacing="15px">
            <Icon
              as={MdBookmark}
              width="32px"
              height="32px"
              color={brandColor}
            />
            <Text
              color={textColor}
              fontSize="28px"
              fontWeight="700"
            >
              Investment Watchlist
            </Text>
          </HStack>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            variant="outline"
            borderColor={brandColor}
            color={brandColor}
            _hover={{
              bg: brandColor,
              color: 'white'
            }}
            onClick={onOpen}
            isDisabled={isLoadingWatchlist}
          >
            Add Investment
          </Button>
        </Flex>

        {/* Watchlist Content */}
        {isLoadingWatchlist ? (
          /* Loading State */
          <Flex justify="center" align="center" h="60vh">
            <VStack spacing="20px">
              <Spinner color={brandColor} size="xl" />
              <Text color={textColor} fontSize="lg" fontWeight="600">
                Loading your watchlist...
              </Text>
            </VStack>
          </Flex>
        ) : watchlistStocks.length === 0 ? (
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
            <Text
              color={textColor}
              fontSize="24px"
              fontWeight="600"
              mb="10px"
            >
              Your Watchlist is Empty
            </Text>
            <Text
              color={gray}
              fontSize="16px"
              mb="30px"
              maxW="400px"
            >
              Start building your investment portfolio by adding stocks, bonds, ETFs, or other assets you want to track.
            </Text>
            <Button
              leftIcon={<Icon as={MdAdd} />}
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
              onClick={onOpen}
            >
              Add Your First Investment
            </Button>
          </Flex>
        ) : (
          /* Watchlist Vertical Stack */
          <VStack
            spacing="20px"
            w="100%"
            align="stretch"
          >
            {watchlistStocks.map((stock) => (
              <WatchlistCard
                key={stock.symbol}
                stock={stock}
                onRemove={handleRemoveStock}
              />
            ))}
          </VStack>
        )}

        {/* Placeholder cards for future features */}
        <VStack spacing="20px" display="none">
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing="2px">
                  <Text fontWeight="600" color={textColor}>AAPL</Text>
                  <Text fontSize="sm" color={gray}>Apple Inc.</Text>
                </VStack>
                <VStack align="end" spacing="2px">
                  <Text fontWeight="600" color={textColor}>$150.25</Text>
                  <Text fontSize="sm" color="green.500">+2.45%</Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </VStack>

      {/* Search Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          bg={modalBg}
          borderRadius="20px"
          boxShadow="xl"
          mx="20px"
        >
          <ModalHeader
            pb="20px"
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing="10px">
              <Icon as={MdSearch} color={brandColor} />
              <Text color={textColor} fontSize="lg" fontWeight="600">
                Search Investments
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="30px" pt="20px">
            <VStack spacing="20px" align="stretch">
              {/* Search Input */}
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdSearch} color={gray} />
                </InputLeftElement>
                <Input
                  placeholder="Search for stocks, ETFs, bonds..."
                  value={searchQuery}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                  }}
                  borderRadius="12px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: brandColor,
                    boxShadow: `0 0 0 1px ${brandColor}`,
                  }}
                  color={textColor}
                />
              </InputGroup>

              {/* Search Results */}
              <Box maxH="400px" overflowY="auto">
                {(isSearching || isAddingToWatchlist) && (
                  <Flex justify="center" py="40px">
                    <VStack spacing="10px">
                      <Spinner color={brandColor} size="lg" />
                      <Text color={gray} fontSize="sm">
                        {isSearching ? 'Searching...' : 'Adding to watchlist...'}
                      </Text>
                    </VStack>
                  </Flex>
                )}

                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <Flex justify="center" py="40px">
                    <Text color={gray} fontSize="sm">
                      No investments found for "{searchQuery}"
                    </Text>
                  </Flex>
                )}

                {!isSearching && !isAddingToWatchlist && searchResults.length > 0 && (
                  <List spacing="10px">
                    {searchResults.map((item, index) => (
                      <ListItem key={index}>
                        <Card
                          bg={cardBg}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="12px"
                          cursor="pointer"
                          transition="all 0.2s ease"
                          _hover={{
                            borderColor: brandColor,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            bg: useColorModeValue('gray.50', 'navy.600'),
                          }}
                          onClick={() => handleAddToWatchlist(item)}
                        >
                          <CardBody py="15px">
                            <Flex justify="space-between" align="center">
                              <HStack spacing="12px">
                                <Flex
                                  w="40px"
                                  h="40px"
                                  borderRadius="8px"
                                  bg={brandColor}
                                  align="center"
                                  justify="center"
                                >
                                  <Icon
                                    as={MdShowChart}
                                    color="white"
                                    w="20px"
                                    h="20px"
                                  />
                                </Flex>
                                <VStack align="start" spacing="2px">
                                  <HStack spacing="8px">
                                    <Text
                                      fontWeight="600"
                                      color={textColor}
                                      fontSize="md"
                                    >
                                      {item.symbol}
                                    </Text>
                                    <Badge
                                      colorScheme={
                                        item.security_type === 'CS' ? 'blue' : 
                                        item.security_type === 'ETF' ? 'green' : 'purple'
                                      }
                                      fontSize="xs"
                                      borderRadius="4px"
                                    >
                                      {item.security_type === 'CS' ? 'Stock' : 
                                       item.security_type === 'ETF' ? 'ETF' : 'ADR'}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" color={gray}>
                                    {item.name}
                                  </Text>
                                </VStack>
                              </HStack>
                              <VStack align="end" spacing="2px">
                                <Text fontWeight="600" color={textColor}>
                                  {item.current_price ? `$${item.current_price.toFixed(2)}` : 'N/A'}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={
                                    item.day_change_percent 
                                      ? item.day_change_percent >= 0 ? 'green.500' : 'red.500'
                                      : gray
                                  }
                                >
                                  {item.day_change_percent 
                                    ? `${item.day_change_percent >= 0 ? '+' : ''}${item.day_change_percent.toFixed(2)}%`
                                    : 'N/A'
                                  }
                                </Text>
                              </VStack>
                            </Flex>
                          </CardBody>
                        </Card>
                      </ListItem>
                    ))}
                  </List>
                )}

                {searchQuery.length < 2 && !isSearching && !isAddingToWatchlist && (
                  <Flex justify="center" py="40px">
                    <Text color={gray} fontSize="sm" textAlign="center">
                      Type at least 2 characters to search for investments
                    </Text>
                  </Flex>
                )}
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}