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
  UnorderedList,
  ListItem,
  Tooltip,
  Image,
} from '@chakra-ui/react';
import {
  MdExpandMore,
  MdExpandLess,
  MdTrendingUp,
  MdTrendingDown,
  MdShowChart,
  MdRemove,
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
  newsSummary?: string;
  sentimentRationale?: string;
  upcomingEvents?: UpcomingEvent[];
  executiveSummary?: string;
  keyHighlights?: string[];
  positiveCatalysts?: string[];
  riskFactors?: string[];
}

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary?: string;
  url?: string;
  favicon?: string;
  impactLevel?: 'High' | 'Medium' | 'Low';
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
                <Text
                  fontWeight="700"
                  color={textColor}
                  fontSize="lg"
                >
                  {stock.symbol}
                </Text>
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
          {(stock.newsSummary || (stock.news && stock.news.length > 0)) && (
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
                  <Tooltip
                    label={stock.sentimentRationale || 'No rationale available'}
                    placement="top"
                    hasArrow
                    openDelay={300}
                    closeDelay={150}
                    isDisabled={!stock.sentimentRationale}
                  >
                    <Badge
                      size="sm"
                      colorScheme={
                        (stock.news && stock.news.length > 0 && stock.news[0].sentiment === 'positive') ? 'green' :
                        (stock.news && stock.news.length > 0 && stock.news[0].sentiment === 'negative') ? 'red' : 'gray'
                      }
                      cursor={stock.sentimentRationale ? 'help' : 'default'}
                    >
                      {(stock.news && stock.news.length > 0 && stock.news[0].sentiment === 'positive') ? 'Bullish' :
                       (stock.news && stock.news.length > 0 && stock.news[0].sentiment === 'negative') ? 'Bearish' : 'Neutral'}
                    </Badge>
                  </Tooltip>
                </HStack>
                <Text
                  fontSize="xs"
                  color={textColor}
                  fontWeight="400"
                  noOfLines={3}
                  lineHeight="1.3"
                >
                  {stock.newsSummary || 
                    (stock.news && stock.news.length > 1 
                      ? `${stock.news[0].headline} • ${stock.news[1]?.headline || ''}`
                      : stock.news && stock.news.length > 0 
                        ? stock.news[0].headline
                        : 'No news summary available'
                    )
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

            {/* Executive Summary Section */}
            {stock.executiveSummary && (
              <Box mb="20px">
                <Text
                  fontWeight="600"
                  color={textColor}
                  fontSize="sm"
                  mb="10px"
                >
                  Executive Summary
                </Text>
                <Box
                  p="12px"
                  borderRadius="8px"
                  bg={hoverBg}
                >
                  <Text
                    fontSize="sm"
                    color={textColor}
                    lineHeight="1.7"
                  >
                    {stock.executiveSummary}
                  </Text>
                </Box>
              </Box>
            )}

            {/* Key Highlights Section */}
            {stock.keyHighlights && stock.keyHighlights.length > 0 && (
              <Box mb="20px">
                <Text
                  fontWeight="600"
                  color={textColor}
                  fontSize="sm"
                  mb="10px"
                >
                  Key Highlights
                </Text>
                <Box
                  p="12px"
                  borderRadius="8px"
                  bg={hoverBg}
                >
                  <UnorderedList spacing="4px">
                    {stock.keyHighlights.map((highlight, index) => (
                      <ListItem
                        key={index}
                        fontSize="sm"
                        color={textColor}
                        lineHeight="1.5"
                      >
                        {highlight}
                      </ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              </Box>
            )}

            {/* Positive Catalysts & Risk Factors Section */}
            {((stock.positiveCatalysts && stock.positiveCatalysts.length > 0) || 
              (stock.riskFactors && stock.riskFactors.length > 0)) && (
              <Box mb="20px">
                <SimpleGrid columns={2} spacing="15px">
                  {/* Positive Catalysts Column */}
                  {stock.positiveCatalysts && stock.positiveCatalysts.length > 0 && (
                    <Box
                      p="12px"
                      borderRadius="8px"
                      bg={hoverBg}
                    >
                      <HStack justify="space-between" mb="8px">
                        <Badge
                          size="sm"
                          colorScheme="green"
                        >
                          Positive Catalysts
                        </Badge>
                      </HStack>
                      <UnorderedList spacing="6px">
                        {stock.positiveCatalysts.map((catalyst, index) => (
                          <ListItem
                            key={index}
                            fontSize="sm"
                            color={textColor}
                            lineHeight="1.7"
                          >
                            {catalyst}
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </Box>
                  )}

                  {/* Risk Factors Column */}
                  {stock.riskFactors && stock.riskFactors.length > 0 && (
                    <Box
                      p="12px"
                      borderRadius="8px"
                      bg={hoverBg}
                    >
                      <HStack justify="space-between" mb="8px">
                        <Badge
                          size="sm"
                          colorScheme="red"
                        >
                          Risk Factors
                        </Badge>
                      </HStack>
                      <UnorderedList spacing="6px">
                        {stock.riskFactors.map((risk, index) => (
                          <ListItem
                            key={index}
                            fontSize="sm"
                            color={textColor}
                            lineHeight="1.7"
                          >
                            {risk}
                          </ListItem>
                        ))}
                      </UnorderedList>
                    </Box>
                  )}
                </SimpleGrid>
              </Box>
            )}

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
                <VStack spacing="12px" align="stretch">
                  {stock.news.slice(0, 3).map((newsItem) => (
                    <Box
                      key={newsItem.id}
                      p="16px"
                      borderRadius="12px"
                      bg={hoverBg}
                      border="1px solid"
                      borderColor={borderColor}
                      cursor={newsItem.url ? "pointer" : "default"}
                      transition="all 0.2s ease"
                      _hover={newsItem.url ? {
                        borderColor: brandColor,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-1px)'
                      } : {}}
                      onClick={newsItem.url ? () => window.open(newsItem.url, '_blank', 'noopener,noreferrer') : undefined}
                    >
                      {/* Header with Favicon, Title and Sentiment */}
                      <Flex justify="space-between" align="flex-start" mb="8px">
                        <Flex align="flex-start" flex="1" mr="8px">
                          {newsItem.favicon && (
                            <Image
                              src={newsItem.favicon}
                              alt={`${newsItem.source} favicon`}
                              w="20px"
                              h="20px"
                              mr="8px"
                              mt="2px"
                              borderRadius="2px"
                              flexShrink={0}
                              fallback={<Box w="20px" h="20px" />}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <Text
                            fontSize="md"
                            color={textColor}
                            fontWeight="600"
                            lineHeight="1.4"
                            noOfLines={2}
                            flex="1"
                          >
                            {newsItem.headline}
                          </Text>
                        </Flex>
                        <Badge
                          size="sm"
                          colorScheme={
                            newsItem.sentiment === 'positive' ? 'green' :
                            newsItem.sentiment === 'negative' ? 'red' : 'gray'
                          }
                          flexShrink={0}
                        >
                          {newsItem.sentiment === 'positive' ? 'Bullish' :
                           newsItem.sentiment === 'negative' ? 'Bearish' : 'Neutral'}
                        </Badge>
                      </Flex>

                      {/* Summary Content */}
                      {newsItem.summary && (
                        <Text
                          fontSize="sm"
                          color={textColor}
                          lineHeight="1.5"
                          noOfLines={3}
                          mb="8px"
                        >
                          {newsItem.summary}
                        </Text>
                      )}

                      {/* Footer with Source and Date */}
                      <Flex justify="flex-end" align="center">
                        <Text fontSize="xs" color={gray} textAlign="right">
                          {newsItem.source} • {newsItem.publishedAt}
                        </Text>
                      </Flex>
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
                <Box
                  p="12px"
                  borderRadius="8px"
                  bg={hoverBg}
                >
                  <VStack spacing="8px" align="stretch">
                    {stock.upcomingEvents.map((event, index) => (
                      <HStack key={index} spacing="10px">
                        <Badge
                          size="sm"
                          colorScheme={
                            event.type === 'earnings' ? 'purple' :
                            event.type === 'dividend' ? 'green' : 'blue'
                          }
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
              </Box>
            )}

            {/* Action Buttons */}
            {onRemove && (
              <HStack spacing="8px" justify="flex-end">
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
              </HStack>
            )}
          </Box>
        </Collapse>
      </CardBody>
    </Card>
  );
}