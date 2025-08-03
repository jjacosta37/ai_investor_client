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
import { useState, useEffect } from 'react';
import { WatchlistCard, StockData } from '@/components/watchlist/WatchlistCard';

export default function Watchlist() {
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Watchlist state
  const [watchlistStocks, setWatchlistStocks] = useState<StockData[]>([]);

  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const gray = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const modalBg = useColorModeValue('white', 'navy.800');

  // Load mock watchlist data on component mount
  useEffect(() => {
    const mockWatchlistData: StockData[] = [
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        currentPrice: 150.25,
        change: 3.67,
        changePercent: 2.5,
        volume: 45231000,
        marketCap: '$2.45T',
        peRatio: 24.5,
        weekHigh52: 198.23,
        weekLow52: 124.17,
        lastUpdated: new Date().toISOString(),
        news: [
          {
            id: '1',
            headline: 'Apple Reports Strong Q4 Earnings Beat Expectations',
            source: 'Reuters',
            publishedAt: '2 hours ago',
            sentiment: 'positive'
          },
          {
            id: '2',
            headline: 'iPhone 16 Sales Exceed Analyst Projections',
            source: 'Bloomberg',
            publishedAt: '5 hours ago',
            sentiment: 'positive'
          },
          {
            id: '3',
            headline: 'Apple Faces Regulatory Challenges in EU',
            source: 'Financial Times',
            publishedAt: '1 day ago',
            sentiment: 'negative'
          }
        ],
        upcomingEvents: [
          {
            type: 'earnings',
            date: 'Jan 25, 2024',
            description: 'Q1 2024 Earnings Report'
          },
          {
            type: 'dividend',
            date: 'Feb 8, 2024',
            description: 'Ex-Dividend Date ($0.24)'
          }
        ]
      },
      {
        symbol: 'GOOGL',
        companyName: 'Alphabet Inc.',
        currentPrice: 2840.12,
        change: -15.34,
        changePercent: -0.54,
        volume: 28431000,
        marketCap: '$1.85T',
        peRatio: 22.8,
        weekHigh52: 3030.93,
        weekLow52: 2193.62,
        lastUpdated: new Date().toISOString(),
        news: [
          {
            id: '4',
            headline: 'Google AI Bard Receives Major Update',
            source: 'TechCrunch',
            publishedAt: '3 hours ago',
            sentiment: 'positive'
          }
        ],
        upcomingEvents: [
          {
            type: 'earnings',
            date: 'Jan 30, 2024',
            description: 'Q4 2023 Earnings Report'
          }
        ]
      },
      {
        symbol: 'TSLA',
        companyName: 'Tesla, Inc.',
        currentPrice: 245.67,
        change: 12.45,
        changePercent: 5.34,
        volume: 67834000,
        marketCap: '$780B',
        peRatio: 65.2,
        weekHigh52: 299.29,
        weekLow52: 138.80,
        lastUpdated: new Date().toISOString(),
        news: [
          {
            id: '5',
            headline: 'Tesla Cybertruck Deliveries Begin',
            source: 'CNBC',
            publishedAt: '1 hour ago',
            sentiment: 'positive'
          },
          {
            id: '6',
            headline: 'Musk Announces New Gigafactory Plans',
            source: 'Wall Street Journal',
            publishedAt: '4 hours ago',
            sentiment: 'neutral'
          }
        ],
        upcomingEvents: [
          {
            type: 'earnings',
            date: 'Jan 24, 2024',
            description: 'Q4 2023 Earnings Report'
          }
        ]
      }
    ];
    
    setWatchlistStocks(mockWatchlistData);
  }, []);

  // Remove stock from watchlist
  const handleRemoveStock = (symbol: string) => {
    setWatchlistStocks(prev => prev.filter(stock => stock.symbol !== symbol));
  };

  // Mock search function (replace with your actual API call)
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock search results
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', price: '$150.25', change: '+2.45%' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock', price: '$2,840.12', change: '+1.23%' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock', price: '$378.85', change: '+0.89%' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Stock', price: '$245.67', change: '-1.45%' },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', price: '$420.15', change: '+0.75%' },
      ].filter(item => 
        item.symbol.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const handleAddToWatchlist = (item: any) => {
    // Check if already in watchlist
    if (watchlistStocks.some(stock => stock.symbol === item.symbol)) {
      console.log('Stock already in watchlist:', item.symbol);
      onClose();
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    // Create new stock data from search result
    const newStock: StockData = {
      symbol: item.symbol,
      companyName: item.name,
      currentPrice: parseFloat(item.price.replace('$', '').replace(',', '')),
      change: parseFloat(item.change.replace('+', '').replace('%', '')),
      changePercent: parseFloat(item.change.replace('+', '').replace('%', '')),
      volume: Math.floor(Math.random() * 50000000) + 1000000,
      marketCap: `$${Math.floor(Math.random() * 2000)}B`,
      peRatio: Math.floor(Math.random() * 50) + 10,
      weekHigh52: parseFloat(item.price.replace('$', '').replace(',', '')) * 1.3,
      weekLow52: parseFloat(item.price.replace('$', '').replace(',', '')) * 0.7,
      lastUpdated: new Date().toISOString(),
      news: [
        {
          id: Date.now().toString(),
          headline: `${item.name} shows strong market performance`,
          source: 'Market News',
          publishedAt: '1 hour ago',
          sentiment: 'positive'
        }
      ],
      upcomingEvents: [
        {
          type: 'earnings',
          date: 'Feb 15, 2024',
          description: 'Next Earnings Report'
        }
      ]
    };

    setWatchlistStocks(prev => [...prev, newStock]);
    onClose();
    setSearchQuery('');
    setSearchResults([]);
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
          >
            Add Investment
          </Button>
        </Flex>

        {/* Watchlist Content */}
        {watchlistStocks.length === 0 ? (
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
                    setSearchQuery(e.target.value);
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
                {isSearching && (
                  <Flex justify="center" py="40px">
                    <Spinner color={brandColor} size="lg" />
                  </Flex>
                )}

                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <Flex justify="center" py="40px">
                    <Text color={gray} fontSize="sm">
                      No investments found for "{searchQuery}"
                    </Text>
                  </Flex>
                )}

                {!isSearching && searchResults.length > 0 && (
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
                                      colorScheme={item.type === 'Stock' ? 'blue' : 'green'}
                                      fontSize="xs"
                                      borderRadius="4px"
                                    >
                                      {item.type}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="sm" color={gray}>
                                    {item.name}
                                  </Text>
                                </VStack>
                              </HStack>
                              <VStack align="end" spacing="2px">
                                <Text fontWeight="600" color={textColor}>
                                  {item.price}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={item.change.startsWith('+') ? 'green.500' : 'red.500'}
                                >
                                  {item.change}
                                </Text>
                              </VStack>
                            </Flex>
                          </CardBody>
                        </Card>
                      </ListItem>
                    ))}
                  </List>
                )}

                {searchQuery.length < 2 && !isSearching && (
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