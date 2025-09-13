'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { holdingsService } from '@/services/api';
import { ManualHoldingFormData, SimpleHolding, Security } from '@/types/api';
import { ManualHoldingRow } from './ManualHoldingRow';

interface ManualHoldingsModalProps {
  onSuccess?: () => void; // Called when a holding is added/deleted successfully
}

export function ManualHoldingsModal({ onSuccess }: ManualHoldingsModalProps) {
  const { user } = useAuth();

  // State for existing holdings
  const [holdings, setHoldings] = useState<SimpleHolding[]>([]);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(true);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);

  // State for new holding form
  const [formData, setFormData] = useState<ManualHoldingFormData>({
    symbol: '',
    quantity: '',
    average_cost: '',
    first_purchase_date: '',
  });
  const [selectedSecurity, setSelectedSecurity] = useState<Security | null>(null);

  // State for operations
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingHoldingId, setDeletingHoldingId] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  // Colors
  const tableBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const grayColor = useColorModeValue('gray.500', 'gray.400');
  const headerBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  // Load manual holdings
  const loadHoldings = useCallback(async () => {
    if (!user) return;

    setIsLoadingHoldings(true);
    setHoldingsError(null);

    try {
      const response = await holdingsService.getManualHoldings(user);
      setHoldings(response.results);
    } catch (error) {
      console.error('Error loading manual holdings:', error);
      setHoldingsError(error instanceof Error ? error.message : 'Failed to load holdings');
    } finally {
      setIsLoadingHoldings(false);
    }
  }, [user]);

  // Load holdings on mount
  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  // Handle form field changes
  const handleFormChange = (field: keyof ManualHoldingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle security selection from search
  const handleSecuritySelect = (security: Security) => {
    setSelectedSecurity(security);
    setFormData(prev => ({
      ...prev,
      symbol: `${security.symbol} - ${security.name}`
    }));
  };

  // Handle adding new holding
  const handleAddHolding = async () => {
    if (!selectedSecurity || !user) return;

    if (formData.quantity === '' || formData.average_cost === '' || !formData.first_purchase_date) {
      setOperationError('Please fill in all required fields');
      return;
    }

    setIsAddingNew(true);
    setOperationError(null);

    try {
      await holdingsService.createHolding(user, {
        security_symbol: selectedSecurity.symbol,
        quantity: Number(formData.quantity),
        average_cost: Number(formData.average_cost),
        first_purchase_date: formData.first_purchase_date,
        broker: '', // Empty as requested
        notes: '', // Empty as requested
      });

      // Reset form
      setFormData({
        symbol: '',
        quantity: '',
        average_cost: '',
        first_purchase_date: '',
      });
      setSelectedSecurity(null);

      // Reload holdings
      await loadHoldings();
      
      // Notify parent of success
      onSuccess?.();
    } catch (error) {
      console.error('Error adding holding:', error);
      setOperationError(error instanceof Error ? error.message : 'Failed to add holding');
    } finally {
      setIsAddingNew(false);
    }
  };

  // Handle deleting a holding
  const handleDeleteHolding = async (holdingId: string) => {
    if (!user) return;

    setDeletingHoldingId(holdingId);
    setOperationError(null);

    try {
      // Perform the delete operation and wait for server confirmation
      await holdingsService.deleteHolding(user, holdingId);

      // Only update UI after successful server response
      setHoldings(prev => prev.filter(h => h.id !== holdingId));
      
      // Notify parent of success
      onSuccess?.();
      
    } catch (error) {
      console.error('Error deleting holding:', error);
      
      // Show appropriate error message
      if (error instanceof Error && error.message.includes('404')) {
        setOperationError('Holding was already deleted or does not exist');
      } else {
        setOperationError(error instanceof Error ? error.message : 'Failed to delete holding');
      }
    } finally {
      setDeletingHoldingId(null);
    }
  };

  return (
    <VStack spacing="24px" align="stretch" w="100%">
      {/* Header */}
      <VStack spacing="8px" align="start">
        <Text color={textColor} fontSize="lg" fontWeight="600">
          Manual Holdings Management
        </Text>
        <Text color={grayColor} fontSize="sm">
          Add your investment holdings manually or delete existing manual entries. 
          Broker and notes fields are optional and left empty for now.
        </Text>
      </VStack>

      {/* Operation Error Alert */}
      {operationError && (
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <Box>
            <AlertTitle>Operation Failed!</AlertTitle>
            <AlertDescription>{operationError}</AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Add New Holding Section */}
      <Box>
        <VStack spacing="12px" align="start">
          <HStack spacing="8px" align="center">
            <Text color={textColor} fontSize="md" fontWeight="600">
              Add New Investment
            </Text>
            <Badge colorScheme="green" size="sm">
              Manual Entry
            </Badge>
          </HStack>
          
          <TableContainer 
            w="100%" 
            bg={tableBg} 
            borderRadius="12px" 
            border="1px solid" 
            borderColor={borderColor}
            sx={{
              // Allow dropdown to show outside table bounds
              overflow: 'visible',
              '& table': {
                overflow: 'visible'
              }
            }}
          >
            <Table size="sm">
              <Thead bg={headerBg}>
                <Tr>
                  <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Symbol</Th>
                  <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Quantity</Th>
                  <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Avg Cost ($)</Th>
                  <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Purchase Date</Th>
                  <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px" textAlign="center">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                <ManualHoldingRow
                  type="add"
                  formData={formData}
                  onFormChange={handleFormChange}
                  onAdd={handleAddHolding}
                  onSecuritySelect={handleSecuritySelect}
                  isAddingNew={isAddingNew}
                />
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>
      </Box>

      <Divider />

      {/* Existing Holdings Section */}
      <Box>
        <VStack spacing="12px" align="start">
          <HStack spacing="8px" align="center">
            <Text color={textColor} fontSize="md" fontWeight="600">
              Your Manual Holdings
            </Text>
            <Badge colorScheme="blue" size="sm">
              {holdings.length} {holdings.length === 1 ? 'Position' : 'Positions'}
            </Badge>
          </HStack>

          {/* Holdings Error */}
          {holdingsError && (
            <Alert status="error" borderRadius="12px">
              <AlertIcon />
              <Box>
                <AlertTitle>Failed to load holdings!</AlertTitle>
                <AlertDescription>{holdingsError}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Holdings Loading */}
          {isLoadingHoldings && (
            <HStack justify="center" w="100%" py="40px">
              <Spinner color="brand.500" size="md" />
              <Text color={grayColor} fontSize="sm">
                Loading your holdings...
              </Text>
            </HStack>
          )}

          {/* Holdings Table */}
          {!isLoadingHoldings && !holdingsError && (
            <TableContainer 
              w="100%" 
              bg={tableBg} 
              borderRadius="12px" 
              border="1px solid" 
              borderColor={borderColor}
              sx={{
                // Allow dropdown to show outside table bounds
                overflow: 'visible',
                '& table': {
                  overflow: 'visible'
                }
              }}
            >
              <Table size="sm">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Security</Th>
                    <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Quantity</Th>
                    <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Avg Cost ($)</Th>
                    <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Purchase Date</Th>
                    <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px">Value & P&L</Th>
                    <Th color={grayColor} fontSize="xs" fontWeight="600" px="16px" textAlign="center">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {holdings.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py="40px">
                        <VStack spacing="8px">
                          <Text color={grayColor} fontSize="sm">
                            No manual holdings found
                          </Text>
                          <Text color={grayColor} fontSize="xs">
                            Add your first manual holding using the form above
                          </Text>
                        </VStack>
                      </Td>
                    </Tr>
                  ) : (
                    holdings.map((holding) => (
                      <ManualHoldingRow
                        key={holding.id}
                        type="existing"
                        holding={holding}
                        onDelete={handleDeleteHolding}
                        isDeletingHolding={deletingHoldingId === holding.id}
                      />
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}