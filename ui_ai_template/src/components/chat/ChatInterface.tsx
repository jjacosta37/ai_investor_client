'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdAutoAwesome, MdPerson } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageApi } from '@/hooks/useApi';
import { chatService, messageService } from '@/services';
import { Message } from '@/types/api';
import MessageBoxChat from '@/components/MessageBox';

interface ChatInterfaceProps {
  chatId?: string;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const messageApi = useMessageApi();

  // State
  const [inputCode, setInputCode] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    chatId || null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Colors
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const textColor = useColorModeValue('navy.700', 'white');
  const gray = useColorModeValue('gray.500', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load existing messages for chat
  useEffect(() => {
    if (currentChatId && user) {
      loadChatMessages();
    }
  }, [currentChatId, user]);

  const loadChatMessages = async () => {
    if (!currentChatId || !user) return;

    try {
      const chatMessages = await messageService.getChatMessages(
        currentChatId,
        user,
      );
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createNewChat = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const newChat = await chatService.createChat(null, user);
      setCurrentChatId(newChat.id);
      return newChat.id;
    } catch (error) {
      console.error('Failed to create chat:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!inputCode.trim()) {
      return;
    }

    const messageContent = inputCode.trim();
    setInputCode('');
    setIsLoading(true);

    try {
      // Create new chat if none exists
      let chatIdToUse = currentChatId;
      if (!chatIdToUse) {
        chatIdToUse = await createNewChat();
        if (!chatIdToUse) {
          throw new Error('Failed to create new chat');
        }
      }

      // Send message using the API service
      const result = await messageApi.execute(() =>
        messageService.sendMessage(chatIdToUse!, messageContent, user),
      );

      if (result) {
        // Add both user and assistant messages to the UI
        setMessages((prev) => [
          ...prev,
          result.user_message,
          result.assistant_message,
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputCode(event.target.value);
  };

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  return (
    <Flex
      w="100%"
      direction="column"
      position="relative"
      h="calc(100vh - 60px)"
    >
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        h="100%"
        maxW="1000px"
      >
        {/* Messages */}
        <Flex
          direction="column"
          w="100%"
          mx="auto"
          flex="1"
          overflowY="auto"
          px="20px"
          pt="100px"
          pb="20px"
          minH="0"
        >
          {messages.length > 0 ? (
            <>
              {messages.map((message, index) => (
                <Flex key={message.id || index} w="100%" mb="20px">
                  {message.role === 'user' ? (
                    // User Message
                    <Flex w="100%" align={'center'}>
                      <Flex
                        borderRadius="full"
                        justify="center"
                        align="center"
                        bg={'transparent'}
                        border="1px solid"
                        borderColor={borderColor}
                        me="20px"
                        h="40px"
                        minH="40px"
                        minW="40px"
                      >
                        <Icon
                          as={MdPerson}
                          width="20px"
                          height="20px"
                          color={brandColor}
                        />
                      </Flex>
                      <Flex
                        p="22px"
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="14px"
                        w="100%"
                        zIndex={'2'}
                      >
                        <Text
                          color={textColor}
                          fontWeight="600"
                          fontSize={{ base: 'sm', md: 'md' }}
                          lineHeight={{ base: '24px', md: '26px' }}
                        >
                          {message.content}
                        </Text>
                      </Flex>
                    </Flex>
                  ) : message.role === 'assistant' ? (
                    // Assistant Message
                    <Flex w="100%" align={'flex-start'}>
                      <Flex
                        borderRadius="full"
                        justify="center"
                        align="center"
                        bg={
                          'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'
                        }
                        me="20px"
                        h="40px"
                        minH="40px"
                        minW="40px"
                      >
                        <Icon
                          as={MdAutoAwesome}
                          width="20px"
                          height="20px"
                          color="white"
                        />
                      </Flex>
                      <MessageBoxChat output={message.content} />
                    </Flex>
                  ) : (
                    // System Message (if needed)
                    <Flex w="100%" align={'flex-start'}>
                      <Flex
                        borderRadius="full"
                        justify="center"
                        align="center"
                        bg="gray.500"
                        me="20px"
                        h="40px"
                        minH="40px"
                        minW="40px"
                      >
                        <Text color="white" fontSize="xs" fontWeight="bold">
                          SYS
                        </Text>
                      </Flex>
                      <Flex
                        p="22px"
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="14px"
                        w="100%"
                        bg="gray.50"
                      >
                        <Text
                          color={textColor}
                          fontWeight="500"
                          fontSize={{ base: 'sm', md: 'md' }}
                          lineHeight={{ base: '24px', md: '26px' }}
                          fontStyle="italic"
                        >
                          {message.content}
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <Flex w="100%" mb="20px">
                  <Flex
                    borderRadius="full"
                    justify="center"
                    align="center"
                    bg={
                      'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'
                    }
                    me="20px"
                    h="40px"
                    minH="40px"
                    minW="40px"
                  >
                    <Icon
                      as={MdAutoAwesome}
                      width="20px"
                      height="20px"
                      color="white"
                    />
                  </Flex>
                  <Flex
                    p="22px"
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="14px"
                    w="100%"
                    align="center"
                  >
                    <Text color={gray} fontSize="sm">
                      Thinking...
                    </Text>
                  </Flex>
                </Flex>
              )}

              {/* Invisible element for auto-scroll */}
              <div ref={messagesEndRef} />
            </>
          ) : (
            // Empty state
            <Flex justify="center" align="center" flex="1" direction="column">
              <Icon
                as={MdAutoAwesome}
                width="48px"
                height="48px"
                color={gray}
                mb="20px"
              />
              <Text
                color={textColor}
                fontSize="xl"
                textAlign="center"
                fontWeight="bold"
              >
                Welcome back, {getUserDisplayName()}! 👋
              </Text>
              <Text color={gray} fontSize="lg" textAlign="center" mt="8px">
                Start a conversation with your AI assistant
              </Text>
              <Text color={gray} fontSize="sm" textAlign="center" mt="8px">
                Type a message below to begin chatting
              </Text>
            </Flex>
          )}
        </Flex>

        {/* Chat Input */}
        <Flex
          px="20px"
          pb="20px"
          pt="10px"
          borderTop="1px solid"
          borderColor={borderColor}
          flexShrink={0}
        >
          <Input
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color={inputColor}
            _placeholder={placeholderColor}
            placeholder="Type your message here..."
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            value={inputCode}
            disabled={isLoading || messageApi.loading}
          />
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
            onClick={handleSubmit}
            isLoading={isLoading || messageApi.loading}
            disabled={isLoading || messageApi.loading}
          >
            Submit
          </Button>
        </Flex>

        <Flex justify="center" pb="2px" px="20px" flexShrink={0}>
          <Text fontSize="xs" textAlign="center" color={gray}>
            Connected to your Django API server
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
