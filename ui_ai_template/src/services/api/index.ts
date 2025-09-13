// Import service instances
import { chatService } from './chat';
import { messageService } from './message';
import { securitiesService } from './securities';
import { watchlistService } from './watchlist';
import { holdingsService } from './holdings';
import { newsSummaryService } from './newsSummary';

// Export all API services
export { BaseApiService, ApiError } from './base';
export { ChatService, chatService } from './chat';
export { MessageService, messageService } from './message';
export { SecuritiesService, securitiesService } from './securities';
export { WatchlistService, watchlistService } from './watchlist';
export { HoldingsService, holdingsService } from './holdings';
export { NewsSummaryService, newsSummaryService } from './newsSummary';

// Export all services as a single object for convenience
export const apiServices = {
  chat: chatService,
  message: messageService,
  securities: securitiesService,
  watchlist: watchlistService,
  holdings: holdingsService,
  newsSummary: newsSummaryService,
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
  WatchlistItem,
  WatchlistListResponse,
  WatchlistCreateRequest,
  WatchlistCreateResponse,
  Holding,
  HoldingsResponse,
  PortfolioSummary,
  TreemapData,
  ApiError as ApiErrorType,
  RequestConfig,
  ApiConfig,
  ApiResponse,
  ApiServiceResponse,
} from '@/types/api';
