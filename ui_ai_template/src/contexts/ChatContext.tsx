'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services';
import { Chat } from '@/types/api';
import { useApiSilent } from '@/hooks/useApi';

interface ChatContextType {
  // State
  chats: Chat[];
  selectedChatId: string | null;
  loading: boolean; // Only true during initial load, not during refreshes

  // Actions
  selectChat: (chatId: string) => void;
  refreshChats: () => Promise<void>;
  createNewChat: (skipNavigation?: boolean) => Promise<string | null>;

  // Utils
  getCurrentChat: () => Chat | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatApi = useApiSilent<{ chats: Chat[]; total: number }>();

  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Get chatId from URL params
  const urlChatId = searchParams.get('chatId');

  // Sync with URL params
  useEffect(() => {
    if (urlChatId !== selectedChatId) {
      setSelectedChatId(urlChatId);
    }
  }, [urlChatId]);

  // Load chats when user is available (initial load)
  useEffect(() => {
    if (user) {
      initialLoadChats();
    }
  }, [user]);

  const initialLoadChats = async () => {
    if (!user) return;

    setInitialLoading(true);
    const result = await chatApi.execute(() => chatService.getChats(user));

    if (result) {
      // Filter out archived chats and sort by updated_at
      // Since is_archived is optional, treat undefined as not archived
      const activeChats = result.chats.filter((chat) => !chat.is_archived);
      const sortedChats = activeChats.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
      setChats(sortedChats);
    }
    setInitialLoading(false);
  };

  const refreshChats = async () => {
    if (!user) return;

    // Don't show loading spinner for refreshes - just update data silently
    try {
      const result = await chatService.getChats(user);
      if (result) {
        // Filter out archived chats and sort by updated_at
        // Since is_archived is optional, treat undefined as not archived
        const activeChats = result.chats.filter((chat) => !chat.is_archived);
        const sortedChats = activeChats.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        );
        setChats(sortedChats);
      }
    } catch (error) {
      console.error('Failed to refresh chats:', error);
    }
  };

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    router.push(`/?chatId=${chatId}`);
  };

  const createNewChat = async (
    skipNavigation: boolean = false,
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const newChat = await chatService.createChat(null, user);
      setSelectedChatId(newChat.id);

      if (!skipNavigation) {
        // Refresh chats to include the new one (silent refresh)
        await refreshChats();

        // Navigate to the new chat
        router.push(`/?chatId=${newChat.id}`);
      }

      return newChat.id;
    } catch (error) {
      console.error('Failed to create chat:', error);
      return null;
    }
  };

  const getCurrentChat = (): Chat | null => {
    if (!selectedChatId) return null;
    return chats.find((chat) => chat.id === selectedChatId) || null;
  };

  const value: ChatContextType = {
    chats,
    selectedChatId,
    loading: initialLoading, // Only show loading during initial load
    selectChat,
    refreshChats,
    createNewChat,
    getCurrentChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
