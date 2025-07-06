import { User } from 'firebase/auth';
import { BaseApiService } from './base';
import { endpoints } from '../config/api';
import {
  Message,
  SendMessageRequest,
  SendMessageResponse,
  RequestConfig,
} from '@/types/api';

export class MessageService extends BaseApiService {
  /**
   * Send a message to a chat and receive AI response
   * @param chatId - Chat ID
   * @param content - Message content
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<SendMessageResponse>
   */
  async sendMessage(
    chatId: string,
    content: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<SendMessageResponse> {
    const data: SendMessageRequest = { content };
    return this.post<SendMessageResponse>(
      endpoints.messages(chatId),
      data,
      user,
      config,
    );
  }

  /**
   * Get all messages for a specific chat
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<Message[]>
   */
  async getChatMessages(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<Message[]> {
    return this.get<Message[]>(endpoints.messages(chatId), user, config);
  }

  /**
   * Clear all messages from a chat
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<void>
   */
  async clearChatMessages(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<void> {
    return this.delete<void>(endpoints.clearMessages(chatId), user, config);
  }

  /**
   * Get the latest message from a chat
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<Message | null>
   */
  async getLatestMessage(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<Message | null> {
    const messages = await this.getChatMessages(chatId, user, config);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  /**
   * Get messages count for a chat
   * @param chatId - Chat ID
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<number>
   */
  async getMessageCount(
    chatId: string,
    user: User | null,
    config?: RequestConfig,
  ): Promise<number> {
    const messages = await this.getChatMessages(chatId, user, config);
    return messages.length;
  }

  /**
   * Get messages with pagination (if needed in future)
   * @param chatId - Chat ID
   * @param page - Page number
   * @param limit - Messages per page
   * @param user - Firebase user instance
   * @param config - Optional request configuration
   * @returns Promise<Message[]>
   */
  async getMessagesPaginated(
    chatId: string,
    page: number = 1,
    limit: number = 50,
    user: User | null,
    config?: RequestConfig,
  ): Promise<Message[]> {
    // For now, just return all messages
    // In future, you can modify the API to support pagination
    const messages = await this.getChatMessages(chatId, user, config);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return messages.slice(startIndex, endIndex);
  }
}

// Export singleton instance
export const messageService = new MessageService();
