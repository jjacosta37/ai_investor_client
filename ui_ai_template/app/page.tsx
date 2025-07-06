'use client';
/*eslint-disable*/

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBox';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { MdAutoAwesome, MdEdit, MdPerson } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import { useMessageApi } from '@/hooks/useApi';
import { messageService } from '@/services';
import { Message } from '@/types/api';

// Message interface for the UI
interface UIMessage {
  type: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const { user } = useAuth();
  const { selectedChatId, createNewChat, getCurrentChat, refreshChats } =
    useChatContext();
  const messageApi = useMessageApi();

  // State
  const [inputCode, setInputCode] = useState<string>('');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Colors
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const brandColor = useColorModeValue('brand.500', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');
  const buttonShadow = useColorModeValue(
    '14px 27px 45px rgba(112, 144, 176, 0.2)',
    'none',
  );
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load existing messages for chat when selectedChatId changes
  useEffect(() => {
    if (selectedChatId && user && !isSendingMessage) {
      loadChatMessages();
    } else if (!selectedChatId) {
      // Clear messages when no chat is selected
      setMessages([]);
    }
  }, [selectedChatId, user, isSendingMessage]);

  const loadChatMessages = async () => {
    if (!selectedChatId || !user) return;

    try {
      const chatMessages = await messageService.getChatMessages(
        selectedChatId,
        user,
      );

      // Convert API messages to UI messages
      const uiMessages: UIMessage[] = chatMessages.map((msg) => ({
        type: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      setMessages(uiMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSubmit = async () => {
    if (!inputCode.trim()) {
      return;
    }

    const messageContent = inputCode.trim();
    setInputCode('');
    setIsLoading(true);
    setIsSendingMessage(true);

    // Add user message to UI immediately
    const userMessage: UIMessage = {
      type: 'user',
      content: messageContent,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Create new chat if none exists
      let chatIdToUse = selectedChatId;
      let newChatCreated = false;
      if (!chatIdToUse) {
        chatIdToUse = await createNewChat(true); // Skip navigation during message sending
        if (!chatIdToUse) {
          throw new Error('Failed to create new chat');
        }
        newChatCreated = true;
      }

      // Send message using the API service
      const result = await messageApi.execute(() =>
        messageService.sendMessage(chatIdToUse!, messageContent, user),
      );

      if (result) {
        // Add assistant message to UI
        const assistantMessage: UIMessage = {
          type: 'assistant',
          content: result.ai_message.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // If we created a new chat, handle navigation and refresh after message is sent
        if (newChatCreated) {
          await refreshChats();
          // Update URL to reflect the new chat
          window.history.replaceState(null, '', `/?chatId=${chatIdToUse}`);
        } else {
          // Refresh chat list to update the last message and timestamp
          await refreshChats();
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Remove the user message from UI if sending failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsSendingMessage(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputCode(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'there';
  };

  // Get current chat title
  const getCurrentChatTitle = () => {
    const currentChat = getCurrentChat();
    return currentChat?.title || 'New Chat';
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
                <Flex key={index} w="100%" mb="20px">
                  {message.type === 'user' ? (
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
                        zIndex="2"
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
                  ) : (
                    // AI Message
                    <Flex w="100%">
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
                    <Text
                      color={textColor}
                      fontWeight="600"
                      fontSize="sm"
                      lineHeight="24px"
                    >
                      Thinking...
                    </Text>
                  </Flex>
                </Flex>
              )}
            </>
          ) : (
            // Welcome message
            <Flex
              direction="column"
              w="100%"
              mx="auto"
              display="flex"
              justifyContent="center"
              alignItems="center"
              h="100%"
            >
              <Box
                mx="auto"
                w={{ base: '100%', md: '100%', xl: '100%' }}
                h="100%"
                maxW="1000px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <Icon
                  as={MdAutoAwesome}
                  width="80px"
                  height="80px"
                  color={brandColor}
                  mb="20px"
                />
                <Text
                  color={textColor}
                  fontSize="36px"
                  fontWeight="700"
                  mb="20px"
                  textAlign="center"
                >
                  Hi {getUserDisplayName()}!
                </Text>
                <Text color={gray} fontSize="16px" textAlign="center" mb="30px">
                  {selectedChatId
                    ? `Continue your conversation in "${getCurrentChatTitle()}"`
                    : 'Ask me anything to start a new conversation!'}
                </Text>
              </Box>
            </Flex>
          )}
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </Flex>

        {/* Input */}
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
            disabled={isLoading}
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
            isLoading={isLoading}
            disabled={isLoading}
          >
            Submit
          </Button>
        </Flex>

        <Flex justify="center" pb="2px" px="20px" flexShrink={0}>
          <Text fontSize="xs" textAlign="center" color={gray}>
            Chat interface ready for your own LLM integration.
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
