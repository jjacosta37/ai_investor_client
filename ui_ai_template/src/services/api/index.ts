// Import service instances
import { chatService } from './chat';
import { messageService } from './message';

// Export all API services
export { BaseApiService, ApiError } from './base';
export { ChatService, chatService } from './chat';
export { MessageService, messageService } from './message';

// Export all services as a single object for convenience
export const apiServices = {
  chat: chatService,
  message: messageService,
};

// Export types
export type {
  Chat,
  ChatListResponse,
  ChatDetailResponse,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  ApiError as ApiErrorType,
  RequestConfig,
  ApiConfig,
  ApiResponse,
  ApiServiceResponse,
} from '@/types/api';
