'use client';

import {
  Box,
  Card,
  CardBody,
  Flex,
  Text,
  Icon,
  HStack,
  VStack,
  Badge,
  Button,
  Collapse,
  useColorModeValue,
  IconButton,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import {
  MdExpandMore,
  MdExpandLess,
  MdTrendingUp,
  MdTrendingDown,
  MdShowChart,
  MdRemove,
  MdNotifications,
  MdShare,
} from 'react-icons/md';
import { useState } from 'react';

// Stock data interface
export interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  peRatio: number;
  weekHigh52: number;
  weekLow52: number;
  lastUpdated: string;
  news?: NewsItem[];
  upcomingEvents?: UpcomingEvent[];
}

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface UpcomingEvent {
  type: 'earnings' | 'dividend' | 'split';
  date: string;
  description: string;
}

interface WatchlistCardProps {
  stock: StockData;
  onRemove?: (symbol: string) => void;
}

export function WatchlistCard({ stock, onRemove }: WatchlistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Theme colors
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const gray = useColorModeValue('gray.500', 'gray.400');
  const greenColor = useColorModeValue('green.500', 'green.300');
  const redColor = useColorModeValue('red.500', 'red.300');
  const hoverBg = useColorModeValue('gray.50', 'navy.600');

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? greenColor : redColor;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatChange = (change: number, isPercent = false) => {
    const prefix = change >= 0 ? '+' : '';
    if (isPercent) {
      return `${prefix}${change.toFixed(2)}%`;
    }
    return `${prefix}${formatCurrency(change)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="16px"
      overflow="hidden"
      transition="all 0.2s ease"
      _hover={{
        borderColor: brandColor,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <CardBody p="20px">
        {/* Collapsed State - Always Visible */}
        <Flex
          align="flex-start"
          cursor="pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          gap="40px"
          w="100%"
        >
          {/* Left Side - Stock Info with Fixed Width */}
          <Flex w="400px" align="start">
            <HStack spacing="12px" w="100%">
              {/* Stock Icon */}
              <Flex
                w="48px"
                h="48px"
                borderRadius="12px"
                bg={brandColor}
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon
                  as={MdShowChart}
                  color="white"
                  w="24px"
                  h="24px"
                />
              </Flex>

              {/* Symbol and Company */}
              <VStack align="start" spacing="2px" flex="1" minW="0">
                <HStack spacing="8px">
                  <Text
                    fontWeight="700"
                    color={textColor}
                    fontSize="lg"
                  >
                    {stock.symbol}
                  </Text>
                  {stock.news && stock.news.length > 0 && (
                    <Badge
                      colorScheme="red"
                      fontSize="xs"
                      borderRadius="4px"
                      px="6px"
                    >
                      NEWS
                    </Badge>
                  )}
                </HStack>
                <Text
                  fontSize="sm"
                  color={gray}
                  noOfLines={1}
                >
                  {stock.companyName}
                </Text>
              </VStack>

              {/* Price and Change */}
              <VStack align="end" spacing="4px" w="120px" flexShrink={0}>
                <Text
                  fontWeight="700"
                  color={textColor}
                  fontSize="xl"
                >
                  {formatCurrency(stock.currentPrice)}
                </Text>
                <HStack spacing="4px">
                  <Icon
                    as={isPositive ? MdTrendingUp : MdTrendingDown}
                    color={changeColor}
                    w="16px"
                    h="16px"
                  />
                  <Text
                    fontSize="sm"
                    color={changeColor}
                    fontWeight="600"
                  >
                    {formatChange(stock.changePercent, true)}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Flex>

          {/* Right Side - News Summary with Expanded Width */}
          {stock.news && stock.news.length > 0 && (
            <Box flex="1" maxW="600px">
              <Box
                p="12px"
                borderRadius="8px"
                bg={hoverBg}
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
                w="100%"
                onClick={(e) => e.stopPropagation()}
              >
                <HStack justify="space-between" mb="6px">
                  <Text fontSize="sm" color={textColor} fontWeight="600">
                    Summary of latest news
                  </Text>
                  <Badge
                    size="sm"
                    colorScheme={
                      stock.news[0].sentiment === 'positive' ? 'green' :
                      stock.news[0].sentiment === 'negative' ? 'red' : 'gray'
                    }
                  >
                    {stock.news[0].sentiment}
                  </Badge>
                </HStack>
                <Text
                  fontSize="xs"
                  color={textColor}
                  fontWeight="400"
                  noOfLines={3}
                  lineHeight="1.3"
                >
                  {stock.news.length > 1 
                    ? `${stock.news[0].headline} • ${stock.news[1]?.headline || ''}`
                    : stock.news[0].headline
                  }
                </Text>
              </Box>
            </Box>
          )}

          {/* Expand Button - Fixed Width */}
          <Flex w="40px" justify="center" flexShrink={0}>
            <IconButton
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
              icon={<Icon as={isExpanded ? MdExpandLess : MdExpandMore} />}
              size="sm"
              variant="ghost"
              color={gray}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            />
          </Flex>
        </Flex>

        {/* Expanded State - Collapsible Content */}
        <Collapse in={isExpanded} animateOpacity>
          <Box pt="20px">
            <Divider mb="20px" borderColor={borderColor} />
            
            {/* Detailed Stats */}
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing="15px" mb="20px">
              <Stat>
                <StatLabel color={gray} fontSize="xs">Volume</StatLabel>
                <StatNumber color={textColor} fontSize="md">
                  {formatVolume(stock.volume)}
                </StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel color={gray} fontSize="xs">Market Cap</StatLabel>
                <StatNumber color={textColor} fontSize="md">
                  {stock.marketCap}
                </StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel color={gray} fontSize="xs">P/E Ratio</StatLabel>
                <StatNumber color={textColor} fontSize="md">
                  {stock.peRatio}
                </StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel color={gray} fontSize="xs">52W High</StatLabel>
                <StatNumber color={textColor} fontSize="md">
                  {formatCurrency(stock.weekHigh52)}
                </StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel color={gray} fontSize="xs">52W Low</StatLabel>
                <StatNumber color={textColor} fontSize="md">
                  {formatCurrency(stock.weekLow52)}
                </StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel color={gray} fontSize="xs">Change</StatLabel>
                <StatNumber color={changeColor} fontSize="md">
                  {formatChange(stock.change)}
                </StatNumber>
              </Stat>
            </SimpleGrid>

            {/* Latest News Section */}
            {stock.news && stock.news.length > 0 && (
              <Box mb="20px">
                <Text
                  fontWeight="600"
                  color={textColor}
                  fontSize="sm"
                  mb="10px"
                >
                  Latest News
                </Text>
                <VStack spacing="8px" align="stretch">
                  {stock.news.slice(0, 3).map((newsItem) => (
                    <Box
                      key={newsItem.id}
                      p="12px"
                      borderRadius="8px"
                      bg={hoverBg}
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
                    >
                      <HStack justify="space-between" mb="4px">
                        <Text fontSize="xs" color={gray}>
                          {newsItem.source}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={
                            newsItem.sentiment === 'positive' ? 'green' :
                            newsItem.sentiment === 'negative' ? 'red' : 'gray'
                          }
                        >
                          {newsItem.sentiment}
                        </Badge>
                      </HStack>
                      <Text
                        fontSize="sm"
                        color={textColor}
                        fontWeight="500"
                        noOfLines={2}
                      >
                        {newsItem.headline}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* What to Watch Section */}
            {stock.upcomingEvents && stock.upcomingEvents.length > 0 && (
              <Box mb="20px">
                <Text
                  fontWeight="600"
                  color={textColor}
                  fontSize="sm"
                  mb="10px"
                >
                  What to Watch
                </Text>
                <VStack spacing="8px" align="stretch">
                  {stock.upcomingEvents.map((event, index) => (
                    <HStack key={index} spacing="10px">
                      <Badge
                        colorScheme={
                          event.type === 'earnings' ? 'purple' :
                          event.type === 'dividend' ? 'green' : 'blue'
                        }
                        fontSize="xs"
                        px="8px"
                        py="2px"
                        borderRadius="6px"
                      >
                        {event.type.toUpperCase()}
                      </Badge>
                      <Text fontSize="sm" color={textColor} flex="1">
                        {event.description}
                      </Text>
                      <Text fontSize="xs" color={gray}>
                        {event.date}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Action Buttons */}
            <HStack spacing="8px" justify="flex-end">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdNotifications} />}
                borderColor={borderColor}
                color={textColor}
                _hover={{ borderColor: brandColor, color: brandColor }}
              >
                Alerts
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdShare} />}
                borderColor={borderColor}
                color={textColor}
                _hover={{ borderColor: brandColor, color: brandColor }}
              >
                Share
              </Button>
              {onRemove && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={MdRemove} />}
                  borderColor="red.200"
                  color="red.500"
                  _hover={{ borderColor: 'red.400', bg: 'red.50' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(stock.symbol);
                  }}
                >
                  Remove
                </Button>
              )}
            </HStack>
          </Box>
        </Collapse>
      </CardBody>
    </Card>
  );
}