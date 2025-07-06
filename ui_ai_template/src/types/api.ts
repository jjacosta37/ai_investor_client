// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Chat Types
export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  message_count: number;
  last_message_preview?: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
  } | null;
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

export interface ChatDetailResponse extends Chat {
  messages: Message[];
}

// Message Types
export interface Message {
  id: string;
  chat: string; // This will be the chat ID in API responses
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface SendMessageRequest {
  content: string;
}

export interface SendMessageResponse {
  user_message: Message;
  ai_message: Message;
}

// API Error Types
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

// Request/Response Interceptor Types
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface ApiServiceResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  loading: boolean;
}
