'use client';

import React from 'react';
import {
  Card,
  CardBody,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Flex,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import {
  MdTrendingUp,
  MdTrendingDown,
  MdAccountBalance,
  MdAttachMoney,
  MdShowChart,
} from 'react-icons/md';
import { HoldingsResponse } from '@/types/api';

interface PortfolioSummaryProps {
  portfolioData: HoldingsResponse;
  isLoading?: boolean;
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue'
}) => {
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const grayColor = useColorModeValue('gray.500', 'gray.400');
  
  const trendColor = 
    trend === 'up' ? 'green.500' : 
    trend === 'down' ? 'red.500' : 
    grayColor;

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderColor} h="100%">
      <CardBody>
        <VStack align="start" spacing={4} h="100%">
          <HStack justify="space-between" w="100%">
            <Icon as={icon} w={8} h={8} color={`${color}.500`} />
            {trend && trendValue && (
              <HStack spacing={1}>
                <Icon 
                  as={trend === 'up' ? MdTrendingUp : MdTrendingDown} 
                  w={4} 
                  h={4} 
                  color={trendColor}
                />
                <Text fontSize="sm" color={trendColor} fontWeight="500">
                  {trendValue}
                </Text>
              </HStack>
            )}
          </HStack>
          
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" color={grayColor} fontWeight="500">
              {title}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {value}
            </Text>
            {subtitle && (
              <Text fontSize="sm" color={grayColor}>
                {subtitle}
              </Text>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ 
  portfolioData, 
  isLoading = false 
}) => {
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const grayColor = useColorModeValue('gray.500', 'gray.400');

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} bg={cardBg} border="1px solid" borderColor={borderColor} h="140px">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="100%">
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                </HStack>
                <VStack align="start" spacing={2}>
                  <div style={{ width: '80px', height: '16px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                  <div style={{ width: '120px', height: '24px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  const {
    total_portfolio_value,
    total_cost,
    total_unrealized_gain_loss,
    total_unrealized_gain_loss_percent,
    count
  } = portfolioData;

  const isGainPositive = total_unrealized_gain_loss >= 0;
  const gainTrend = isGainPositive ? 'up' : 'down';
  const gainPercent = total_unrealized_gain_loss_percent.toFixed(2);

  return (
    <VStack spacing="20px" align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px">
        <SummaryCard
          title="Total Portfolio Value"
          value={`$${total_portfolio_value.toLocaleString()}`}
          subtitle="Current market value"
          icon={MdAccountBalance}
          color="blue"
        />
        
        <SummaryCard
          title="Total Investment"
          value={`$${total_cost.toLocaleString()}`}
          subtitle="Amount invested"
          icon={MdAttachMoney}
          color="purple"
        />
        
        <SummaryCard
          title="Unrealized P&L"
          value={`${isGainPositive ? '+' : ''}$${Math.abs(total_unrealized_gain_loss).toLocaleString()}`}
          subtitle="Unrealized gains/losses"
          icon={MdShowChart}
          trend={gainTrend}
          trendValue={`${isGainPositive ? '+' : ''}${gainPercent}%`}
          color={isGainPositive ? 'green' : 'red'}
        />
        
        <SummaryCard
          title="Holdings Count"
          value={count.toString()}
          subtitle="Number of positions"
          icon={MdTrendingUp}
          color="teal"
        />
      </SimpleGrid>

      {/* Detailed Summary Card */}
      <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text color={textColor} fontSize="lg" fontWeight="bold">
              Portfolio Performance Summary
            </Text>
            
            <StatGroup>
              <Stat>
                <StatLabel color={grayColor}>Portfolio Return</StatLabel>
                <StatNumber color={isGainPositive ? 'green.500' : 'red.500'}>
                  {isGainPositive ? '+' : ''}{gainPercent}%
                </StatNumber>
                <StatHelpText color={grayColor}>
                  <StatArrow type={isGainPositive ? 'increase' : 'decrease'} />
                  {isGainPositive ? '+' : ''}$
                  {Math.abs(total_unrealized_gain_loss).toLocaleString()} total
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel color={grayColor}>Average Position Size</StatLabel>
                <StatNumber color={textColor}>
                  ${(total_portfolio_value / count).toLocaleString()}
                </StatNumber>
                <StatHelpText color={grayColor}>
                  Per holding
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel color={grayColor}>Invested vs Current</StatLabel>
                <StatNumber color={textColor}>
                  ${total_cost.toLocaleString()} → ${total_portfolio_value.toLocaleString()}
                </StatNumber>
                <StatHelpText color={grayColor}>
                  Investment growth
                </StatHelpText>
              </Stat>
            </StatGroup>

            <Divider />
            
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color={grayColor}>
                Last updated: {new Date().toLocaleString()}
              </Text>
              <Text 
                fontSize="sm" 
                color={isGainPositive ? 'green.500' : 'red.500'}
                fontWeight="500"
              >
                {isGainPositive ? 'Portfolio is profitable' : 'Portfolio is at a loss'}
              </Text>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};