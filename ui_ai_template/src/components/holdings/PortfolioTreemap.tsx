'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { Treemap, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { Holding, TreemapData } from '@/types/api';

interface PortfolioTreemapProps {
  holdings: Holding[];
  totalValue: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TreemapData;
  }>;
}

// Custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'gray.400');
  
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const gainLoss = data.gainLoss ?? 0;
    const gainLossPercent = data.gainLossPercent ?? 0;
    const isPositive = gainLoss >= 0;
    
    return (
      <Card 
        bg={cardBg} 
        border="1px solid" 
        borderColor={borderColor}
        boxShadow="lg"
        p={3}
      >
        <CardBody p={0}>
          <VStack align="start" spacing={2}>
            <HStack spacing={2}>
              <Text fontWeight="bold" color={textColor} fontSize="sm">
                {data.symbol}
              </Text>
              <Text fontSize="sm" color={gray}>
                ({data.percentage.toFixed(1)}%)
              </Text>
            </HStack>
            <Text fontSize="xs" color={gray}>
              {data.name}
            </Text>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                Value: ${data.value.toLocaleString()}
              </Text>
              <HStack spacing={2}>
                <Text 
                  fontSize="sm" 
                  color={isPositive ? 'green.500' : 'red.500'}
                  fontWeight="500"
                >
                  {isPositive ? '+' : ''}${Math.abs(gainLoss).toFixed(2)}
                </Text>
                <Text 
                  fontSize="sm" 
                  color={isPositive ? 'green.500' : 'red.500'}
                >
                  ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    );
  }
  return null;
};

export const PortfolioTreemap: React.FC<PortfolioTreemapProps> = ({ holdings, totalValue }) => {
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  
  // State to handle client-side rendering
  const [isMounted, setIsMounted] = useState(false);

  // Ensure this only renders on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Transform holdings data to treemap format
  const treemapData = useMemo(() => {
    return holdings.map((holding, index) => {
      const gainLoss = Number(holding.unrealized_gain_loss) || 0;
      const gainLossPercent = Number(holding.unrealized_gain_loss_percent) || 0;
      const currentValue = Number(holding.current_value) || 0;
      const portfolioWeight = Number(holding.portfolio_weight_percent) || 0;
      const isPositive = gainLoss >= 0;
      
      // Generate colors based on performance
      const colors = {
        positive: ['#10B981', '#059669', '#047857', '#065F46'],
        negative: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
        neutral: ['#6B7280', '#4B5563', '#374151', '#1F2937']
      };
      
      let colorArray = colors.neutral;
      if (gainLoss > 0) colorArray = colors.positive;
      if (gainLoss < 0) colorArray = colors.negative;
      
      const colorIndex = index % colorArray.length;
      
      return {
        name: holding.security.name,
        value: currentValue,
        symbol: holding.security.symbol,
        percentage: portfolioWeight,
        gainLoss: gainLoss,
        gainLossPercent: gainLossPercent,
        color: colorArray[colorIndex]
      } as TreemapData;
    });
  }, [holdings]);

  // Show loading state until mounted on client
  if (!isMounted) {
    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <Text color={textColor} fontSize="xl" fontWeight="bold">
                Portfolio Composition
              </Text>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                {holdings.length} Holdings
              </Badge>
            </HStack>
            
            <Flex justify="center" align="center" h="400px">
              <VStack spacing="20px">
                <Spinner color={brandColor} size="lg" />
                <Text color={textColor} fontSize="md">
                  Loading chart...
                </Text>
              </VStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <Flex justify="center" align="center" h="400px">
            <Text color={textColor} fontSize="lg">
              No holdings to display
            </Text>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Text color={textColor} fontSize="xl" fontWeight="bold">
              Portfolio Composition
            </Text>
            <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
              {holdings.length} Holdings
            </Badge>
          </HStack>
          
          <Box h="400px" w="100%">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="value"
                aspectRatio={4/3}
                stroke="#fff"
                strokeWidth={2}
              >
                <RechartsTooltip content={<CustomTooltip />} />
                {treemapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Treemap>
            </ResponsiveContainer>
          </Box>

          {/* Legend */}
          <Box>
            <Text color={textColor} fontSize="sm" fontWeight="600" mb={3}>
              Holdings Overview
            </Text>
            <VStack spacing={2} align="stretch">
              {treemapData.map((item, index) => {
                const gainLoss = Number(item.gainLoss) || 0;
                const gainLossPercent = Number(item.gainLossPercent) || 0;
                const percentage = Number(item.percentage) || 0;
                const value = Number(item.value) || 0;
                const isPositive = gainLoss >= 0;
                return (
                  <HStack key={index} justify="space-between" spacing={4}>
                    <HStack spacing={3}>
                      <Box
                        w={4}
                        h={4}
                        bg={item.color}
                        borderRadius="sm"
                        flexShrink={0}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="500" color={textColor}>
                          {item.symbol}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {percentage.toFixed(1)}% • ${value.toLocaleString()}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text 
                      fontSize="sm" 
                      color={isPositive ? 'green.500' : 'red.500'}
                      fontWeight="500"
                    >
                      {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};