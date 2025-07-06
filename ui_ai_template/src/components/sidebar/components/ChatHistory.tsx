'use client';

import {
  Box,
  Flex,
  Text,
  VStack,
  useColorModeValue,
  Spinner,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { useChatContext } from '@/contexts/ChatContext';

export default function ChatHistory() {
  const { chats, selectedChatId, loading, selectChat } = useChatContext();

  // Colors
  const textColor = useColorModeValue('navy.700', 'white');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const activeColor = useColorModeValue('navy.700', 'white');
  const activeBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const truncateTitle = (title: string, maxLength: number = 25) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" py="20px">
        <Spinner size="sm" color="brand.500" />
      </Flex>
    );
  }

  if (chats.length === 0) {
    return (
      <Box px="20px" py="10px">
        <Text
          fontSize="xs"
          color={inactiveColor}
          textAlign="center"
          fontStyle="italic"
        >
          No chat history yet
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={1} align="stretch" px="10px">
      {chats.map((chat) => (
        <Tooltip
          key={chat.id}
          label={chat.title || 'New Chat'}
          placement="right"
          hasArrow
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectChat(chat.id)}
            bg={selectedChatId === chat.id ? activeBg : 'transparent'}
            color={selectedChatId === chat.id ? activeColor : inactiveColor}
            _hover={{
              bg: hoverBg,
              color: textColor,
            }}
            _active={{
              bg: activeBg,
            }}
            justifyContent="flex-start"
            px="12px"
            py="8px"
            h="auto"
            minH="36px"
            borderRadius="8px"
            fontWeight="500"
            fontSize="sm"
            w="100%"
            transition="all 0.2s"
          >
            <Flex w="100%" justify="space-between" align="center">
              <Text
                flex="1"
                textAlign="left"
                noOfLines={1}
                fontSize="sm"
                fontWeight="500"
              >
                {truncateTitle(chat.title || 'New Chat')}
              </Text>
              <Text
                fontSize="xs"
                color={inactiveColor}
                opacity={0.7}
                ml="8px"
                flexShrink={0}
              >
                {formatDate(chat.updated_at)}
              </Text>
            </Flex>
          </Button>
        </Tooltip>
      ))}
    </VStack>
  );
}
