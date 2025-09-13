'use client';

import {
  Tr,
  Td,
  Input,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  Badge,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { SecuritySearch } from '@/components/fields/SecuritySearch';
import { ManualHoldingFormData, SimpleHolding, Security } from '@/types/api';

interface ManualHoldingRowProps {
  // For new row (add mode)
  formData?: ManualHoldingFormData;
  onFormChange?: (field: keyof ManualHoldingFormData, value: any) => void;
  onAdd?: () => void;
  onSecuritySelect?: (security: Security) => void;
  isAddingNew?: boolean;
  
  // For existing row (display mode)  
  holding?: SimpleHolding;
  onDelete?: (holdingId: string) => void;
  isDeletingHolding?: boolean;
  
  // Row type
  type: 'add' | 'existing';
}

export function ManualHoldingRow({
  formData,
  onFormChange,
  onAdd,
  onSecuritySelect,
  isAddingNew = false,
  holding,
  onDelete,
  isDeletingHolding = false,
  type
}: ManualHoldingRowProps) {
  // Colors
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const grayColor = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('white', 'navy.800');
  const inputBorder = useColorModeValue('gray.300', 'whiteAlpha.300');

  // Helper function to format numbers for display
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  // Add new holding row
  if (type === 'add') {
    if (!formData || !onFormChange || !onAdd || !onSecuritySelect) {
      return null;
    }

    const isFormValid = formData.symbol && 
      formData.quantity !== '' && formData.quantity > 0 &&
      formData.average_cost !== '' && formData.average_cost > 0 &&
      formData.first_purchase_date;

    return (
      <Tr borderBottom="1px solid" borderColor={borderColor}>
        <Td px="16px" py="12px">
          <SecuritySearch
            onSelect={onSecuritySelect}
            value={formData.symbol}
            placeholder="Search symbol..."
            isDisabled={isAddingNew}
          />
        </Td>
        <Td px="16px" py="12px">
          <Input
            type="number"
            step="0.000001"
            min="0.000001"
            value={formData.quantity}
            onChange={(e) => onFormChange('quantity', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            bg={inputBg}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="8px"
            fontSize="sm"
            _focus={{
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
            isDisabled={isAddingNew}
          />
        </Td>
        <Td px="16px" py="12px">
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.average_cost}
            onChange={(e) => onFormChange('average_cost', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            bg={inputBg}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="8px"
            fontSize="sm"
            _focus={{
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
            isDisabled={isAddingNew}
          />
        </Td>
        <Td px="16px" py="12px">
          <Input
            type="date"
            value={formData.first_purchase_date}
            onChange={(e) => onFormChange('first_purchase_date', e.target.value)}
            bg={inputBg}
            border="1px solid"
            borderColor={inputBorder}
            borderRadius="8px"
            fontSize="sm"
            _focus={{
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
            isDisabled={isAddingNew}
          />
        </Td>
        <Td px="16px" py="12px">
          <HStack spacing="8px">
            <Tooltip 
              label={!isFormValid ? "Please fill all required fields" : "Add to your portfolio"}
              placement="top"
            >
              <IconButton
                aria-label="Add holding"
                icon={<MdAdd />}
                size="sm"
                colorScheme="green"
                variant="ghost"
                onClick={onAdd}
                isDisabled={!isFormValid || isAddingNew}
                isLoading={isAddingNew}
                _hover={{
                  bg: "green.50",
                  color: "green.600",
                }}
              />
            </Tooltip>
          </HStack>
        </Td>
      </Tr>
    );
  }

  // Existing holding row
  if (type === 'existing' && holding) {
    const totalCost = holding.total_cost;
    const currentValue = holding.current_value || 0;
    const gainLoss = holding.unrealized_gain_loss || 0;
    const gainLossPercent = holding.unrealized_gain_loss_percent || 0;
    const isPositive = gainLoss >= 0;

    return (
      <Tr borderBottom="1px solid" borderColor={borderColor}>
        <Td px="16px" py="12px">
          <VStack align="start" spacing="2px">
            <HStack spacing="8px" align="center">
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                {holding.security.symbol}
              </Text>
              <Badge 
                size="sm" 
                colorScheme={
                  holding.security.security_type === 'ETF' ? 'purple' : 
                  holding.security.security_type === 'CS' ? 'blue' : 'orange'
                }
              >
                {holding.security.security_type}
              </Badge>
            </HStack>
            <Text fontSize="xs" color={grayColor} noOfLines={1}>
              {holding.security.name}
            </Text>
          </VStack>
        </Td>
        <Td px="16px" py="12px">
          <Text fontSize="sm" color={textColor} fontWeight="500">
            {formatNumber(holding.quantity, 6)}
          </Text>
        </Td>
        <Td px="16px" py="12px">
          <Text fontSize="sm" color={textColor} fontWeight="500">
            ${formatNumber(holding.average_cost)}
          </Text>
        </Td>
        <Td px="16px" py="12px">
          <Text fontSize="sm" color={textColor}>
            {new Date(holding.first_purchase_date).toLocaleDateString()}
          </Text>
        </Td>
        <Td px="16px" py="12px">
          <VStack align="start" spacing="2px">
            <Text fontSize="sm" color={textColor} fontWeight="500">
              ${formatNumber(totalCost)}
            </Text>
            {currentValue > 0 && (
              <HStack spacing="4px">
                <Text fontSize="xs" color={grayColor}>
                  Now: ${formatNumber(currentValue)}
                </Text>
                <Text 
                  fontSize="xs" 
                  color={isPositive ? 'green.500' : 'red.500'}
                  fontWeight="500"
                >
                  ({isPositive ? '+' : ''}{formatNumber(gainLossPercent)}%)
                </Text>
              </HStack>
            )}
          </VStack>
        </Td>
        <Td px="16px" py="12px">
          <HStack spacing="8px">
            <Tooltip label="Delete this holding" placement="top">
              <IconButton
                aria-label="Delete holding"
                icon={<MdDelete />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete?.(holding.id)}
                isDisabled={isDeletingHolding}
                isLoading={isDeletingHolding}
                _hover={{
                  bg: "red.50",
                  color: "red.600",
                }}
              />
            </Tooltip>
          </HStack>
        </Td>
      </Tr>
    );
  }

  return null;
}