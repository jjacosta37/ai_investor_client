// Import service instances
import { chatService } from './chat';
import { messageService } from './message';
import { securitiesService } from './securities';

// Export all API services
export { BaseApiService, ApiError } from './base';
export { ChatService, chatService } from './chat';
export { MessageService, messageService } from './message';
export { SecuritiesService, securitiesService } from './securities';

// Export all services as a single object for convenience
export const apiServices = {
  chat: chatService,
  message: messageService,
  securities: securitiesService,
};

// Export types
export type {
  Chat,
  ChatListResponse,
  ChatDetailResponse,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  Security,
  SecurityFundamentals,
  SecurityDetail,
  SecurityListResponse,
  SecurityDetailResponse,
  SecuritySearchParams,
  ApiError as ApiErrorType,
  RequestConfig,
  ApiConfig,
  ApiResponse,
  ApiServiceResponse,
} from '@/types/api';
