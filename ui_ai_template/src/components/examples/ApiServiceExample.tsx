'use client';

import { useState } from 'react';
import { Box, Button, VStack, Text, Input, useToast } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, messageService } from '@/services';
import { useMessageApi, useChatApi } from '@/hooks/useApi';
import { Chat, Message } from '@/types/api';

export default function ApiServiceExample() {
  const { user } = useAuth();
  const toast = useToast();
  const messageApi = useMessageApi();
  const chatApi = useChatApi();

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // Create a new chat
  const handleCreateChat = async () => {
    const result = await chatApi.execute(() =>
      chatService.createChat('API Test Chat', user),
    );

    if (result) {
      setChats((prev) => [...prev, result]);
      setSelectedChatId(result.id);
      toast({
        title: 'Success',
        description: `Created chat: ${result.title}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load all chats
  const handleLoadChats = async () => {
    const result = await chatApi.execute(() => chatService.getChats(user));

    if (result) {
      setChats(result.chats);
      toast({
        title: 'Chats Loaded',
        description: `Found ${result.chats.length} chats`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    const result = await messageApi.execute(() =>
      messageService.sendMessage(selectedChatId, messageInput, user),
    );

    if (result) {
      setMessages((prev) => [
        ...prev,
        result.user_message,
        result.assistant_message,
      ]);
      setMessageInput('');
      toast({
        title: 'Message Sent',
        description: 'Received AI response',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Load messages for selected chat
  const handleLoadMessages = async () => {
    if (!selectedChatId) return;

    try {
      const chatMessages = await messageService.getChatMessages(
        selectedChatId,
        user,
      );
      setMessages(chatMessages);
      toast({
        title: 'Messages Loaded',
        description: `Found ${chatMessages.length} messages`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Get role display text
  const getRoleDisplay = (role: Message['role']) => {
    switch (role) {
      case 'user':
        return 'You';
      case 'assistant':
        return 'AI Assistant';
      case 'system':
        return 'System';
      default:
        return role;
    }
  };

  // Get role color
  const getRoleColor = (role: Message['role']) => {
    switch (role) {
      case 'user':
        return { bg: 'blue.50', border: 'blue.500', text: 'blue.600' };
      case 'assistant':
        return { bg: 'green.50', border: 'green.500', text: 'green.600' };
      case 'system':
        return { bg: 'gray.50', border: 'gray.500', text: 'gray.600' };
      default:
        return { bg: 'gray.50', border: 'gray.500', text: 'gray.600' };
    }
  };

  return (
    <Box p={6} maxW="800px" mx="auto">
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          API Service Test Interface
        </Text>

        <Text fontSize="md" color="gray.600">
          This component demonstrates the API service integration with your
          Django server.
        </Text>

        {/* Chat Management */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Chat Management
          </Text>
          <VStack spacing={2}>
            <Button
              onClick={handleCreateChat}
              isLoading={chatApi.loading}
              colorScheme="blue"
              w="full"
            >
              Create New Chat
            </Button>
            <Button
              onClick={handleLoadChats}
              isLoading={chatApi.loading}
              colorScheme="green"
              w="full"
            >
              Load All Chats
            </Button>
          </VStack>
        </Box>

        {/* Chat Selection */}
        {chats.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Select Chat
            </Text>
            <VStack spacing={2}>
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  variant={selectedChatId === chat.id ? 'solid' : 'outline'}
                  colorScheme="purple"
                  w="full"
                >
                  {chat.title} (ID: {chat.id.slice(0, 8)}...)
                  {chat.is_archived && (
                    <Text as="span" ml={2} fontSize="xs" color="orange.500">
                      [ARCHIVED]
                    </Text>
                  )}
                </Button>
              ))}
            </VStack>
          </Box>
        )}

        {/* Message Management */}
        {selectedChatId && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Message Management
            </Text>
            <VStack spacing={2}>
              <Input
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                isLoading={messageApi.loading}
                colorScheme="orange"
                w="full"
                disabled={!messageInput.trim()}
              >
                Send Message
              </Button>
              <Button onClick={handleLoadMessages} colorScheme="teal" w="full">
                Load Messages
              </Button>
            </VStack>
          </Box>
        )}

        {/* Messages Display */}
        {messages.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Messages ({messages.length})
            </Text>
            <VStack spacing={2} align="stretch">
              {messages.map((message) => {
                const roleColors = getRoleColor(message.role);
                return (
                  <Box
                    key={message.id}
                    p={3}
                    bg={roleColors.bg}
                    borderRadius="md"
                    borderLeft={`4px solid`}
                    borderLeftColor={roleColors.border}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={roleColors.text}
                    >
                      {getRoleDisplay(message.role)}
                    </Text>
                    <Text fontSize="sm" mt={1}>
                      {message.content}
                    </Text>
                    {message.metadata &&
                      Object.keys(message.metadata).length > 0 && (
                        <Text fontSize="xs" color="gray.500" mt={2}>
                          Metadata: {JSON.stringify(message.metadata)}
                        </Text>
                      )}
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        {/* Status Information */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Status
          </Text>
          <VStack spacing={1} align="stretch">
            <Text fontSize="sm">
              <strong>User:</strong>{' '}
              {user?.displayName || user?.email || 'Not authenticated'}
            </Text>
            <Text fontSize="sm">
              <strong>Selected Chat:</strong> {selectedChatId || 'None'}
            </Text>
            <Text fontSize="sm">
              <strong>Total Chats:</strong> {chats.length}
            </Text>
            <Text fontSize="sm">
              <strong>Total Messages:</strong> {messages.length}
            </Text>
            <Text fontSize="sm">
              <strong>API Base URL:</strong>{' '}
              {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
