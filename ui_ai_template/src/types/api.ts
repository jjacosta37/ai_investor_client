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

// Securities Types
export interface Security {
  symbol: string;
  name: string;
  security_type: 'CS' | 'ETF' | 'ADRC';
  exchange: string;
  current_price?: number | null;
  day_change_percent?: number | null;
  market_cap?: number | null;
  logo_url: string;
  is_active: boolean;
}

export interface SecurityFundamentals {
  current_price?: number | null;
  previous_close?: number | null;
  day_change?: number | null;
  day_change_percent?: number | null;
  market_cap?: number | null;
  pe_ratio?: number | null;
  eps?: number | null;
  dividend_yield?: number | null;
  book_value?: number | null;
  debt_to_equity?: number | null;
  roe?: number | null;
  volume?: number | null;
  avg_volume?: number | null;
  week_52_high?: number | null;
  week_52_low?: number | null;
  news_summary?: string;
  news_summary_updated_at?: string | null;
  last_updated: string;
}

export interface SecurityDetail extends Security {
  sic_description: string;
  created_at: string;
  updated_at: string;
  fundamentals?: SecurityFundamentals | null;
}

export interface SecurityListResponse {
  count: number;
  results: Security[];
}

export interface SecurityDetailResponse extends SecurityDetail {}

export interface SecuritySearchParams {
  search?: string;
  type?: 'CS' | 'ETF' | 'ADRC';
  exchange?: string;
  limit?: number;
  offset?: number;
  ordering?: string;
}
