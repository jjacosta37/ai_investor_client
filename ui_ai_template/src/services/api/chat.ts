import { User } from 'firebase/auth';
import { BaseApiService } from './base';
import { endpoints } from '../config/api';
import {
  Chat,
  ChatListResponse,
  ChatDetailResponse,
  RequestConfig,
} from '@/types/api';

export class ChatService extends BaseApiService {
  /**
   * Create a new chat conversation
   * @param title - Optional chat title
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<Chat>
   */
  async createChat(
    title: string | null = null,
    user: User | null,
    config?: RequestConfig,
  ): Promise<Chat> {
    const data = title ? { title } : {};
    return this.post<Chat>(endpoints.chats, data, user, config);
  }

  /**
   * Get list of all active chats
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<ChatListResponse>
   */
  async getChats(
    user: User | null,
    config?: RequestConfig,
  ): Promise<ChatListResponse> {
    // Server returns a plain array, not an object with chats property
    const chats = await this.get<Chat[]>(endpoints.chats, user, config);

    // Transform to expected format
    return {
      chats: chats,
      total: chats.length,
    };
  }

  /**
   * Get detailed information about a specific chat
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<ChatDetailResponse>
   */
  async getChatDetails(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<ChatDetailResponse> {
    return this.get<ChatDetailResponse>(endpoints.chat(chatId), user, config);
  }

  /**
   * Update chat information (primarily title)
   * @param chatId - Chat ID
   * @param updates - Chat updates (title, etc.)
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<Chat>
   */
  async updateChat(
    chatId: string,
    updates: Partial<{ title: string }>,
    user: User | null,
    config?: RequestConfig,
  ): Promise<Chat> {
    return this.put<Chat>(endpoints.chat(chatId), updates, user, config);
  }

  /**
   * Delete/archive a chat
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<void>
   */
  async deleteChat(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<void> {
    return this.delete<void>(endpoints.chat(chatId), user, config);
  }

  /**
   * Get chat title based on first message or existing title
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<string>
   */
  async getChatTitle(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<string> {
    const chat = await this.getChatDetails(chatId, user, config);
    return chat.title || 'New Chat';
  }

  /**
   * Check if user owns the chat
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<boolean>
   */
  async validateChatOwnership(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<boolean> {
    try {
      await this.getChatDetails(chatId, user, config);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
