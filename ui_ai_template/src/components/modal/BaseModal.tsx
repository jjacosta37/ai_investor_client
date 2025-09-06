'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: IconType;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  trapFocus?: boolean;
  closeOnOverlayClick?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  icon,
  size = 'lg',
  children,
  trapFocus = true,
  closeOnOverlayClick = true,
}: BaseModalProps) {
  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const modalBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={size} 
      isCentered
      trapFocus={trapFocus}
      closeOnOverlayClick={closeOnOverlayClick}
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent 
        bg={modalBg} 
        borderRadius="20px" 
        boxShadow="xl" 
        mx="20px"
        zIndex={1500}
      >
        <ModalHeader pb="20px" borderBottom="1px solid" borderColor={borderColor}>
          <HStack spacing="10px">
            {icon && <Icon as={icon} color={brandColor} />}
            <Text color={textColor} fontSize="lg" fontWeight="600">
              {title}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb="30px" pt="20px">
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}