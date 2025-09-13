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
  previous_close?: number | null;
  day_change?: number | null;
  day_change_percent?: number | null;
  market_cap?: number | null;
  pe_ratio?: number | null;
  eps?: number | null;
  dividend_yield?: number | null;
  volume?: number | null;
  avg_volume?: number | null;
  year_high?: number | null;
  year_low?: number | null;
  book_value?: number | null;
  debt_to_equity?: number | null;
  roe?: number | null;
  news_summary?: string | null;
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

// News and Analysis Types
export interface OverallSentiment {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  rationale: string;
  confidence_level?: 'High' | 'Medium' | 'Low' | null;
}

export interface SecurityNewsSummary {
  executive_summary: string;
  summary: string;
  positive_catalysts: string;
  risk_factors: string;
  overall_sentiment: OverallSentiment;
  key_metrics: Record<string, any>;
  disclaimer: string;
  updated_at: string;
}

export interface NewsItem {
  headline: string;
  date: string;
  source: string;
  url: string;
  favicon?: string;
  impact_level: 'High' | 'Medium' | 'Low';
  summary: string;
}

export interface UpcomingEvent {
  event: string;
  date: string;
  category:
    | 'Earnings'
    | 'Corporate_Actions'
    | 'Regulatory'
    | 'Strategic'
    | 'Industry'
    | 'Economic';
  importance: 'High' | 'Medium' | 'Low';
}

export interface KeyHighlight {
  highlight: string;
  order: number;
}

// Watchlist Types
export interface WatchlistItem {
  id: number;
  security: Security;
  added_at: string;
  security_news_summary?: SecurityNewsSummary | null;
  latest_news?: NewsItem[];
  key_highlights?: KeyHighlight[];
  upcoming_events?: UpcomingEvent[];
}

export interface WatchlistListResponse {
  count: number;
  results: WatchlistItem[];
}

export interface WatchlistCreateRequest {
  security_symbol: string;
}

export interface WatchlistCreateResponse extends WatchlistItem {
  has_news_summary: boolean;
  needs_news_fetch: boolean;
}

// Holdings Types
export interface BrokerDetail {
  holding_id: string;
  broker: string;
  quantity: number;
  average_cost: number;
  total_cost: number;
  current_value?: number | null;
  unrealized_gain_loss?: number | null;
  unrealized_gain_loss_percent?: number | null;
  first_purchase_date: string;
  last_updated: string;
  notes: string;
}

export interface Holding {
  id: string;
  security: Security;
  quantity: number;
  average_cost: number;
  total_cost: number;
  current_value: number;
  unrealized_gain_loss: number;
  unrealized_gain_loss_percent: number;
  portfolio_weight_percent: number;
  first_purchase_date: string;
  last_updated: string;
  notes: string;
  broker_details?: BrokerDetail[]; // Optional for aggregated holdings
}

export interface PortfolioSummary {
  total_portfolio_value: number;
  total_cost: number;
  total_unrealized_gain_loss: number;
  total_unrealized_gain_loss_percent: number;
}

export interface HoldingsResponse {
  count: number;
  total_portfolio_value: number;
  total_cost: number;
  total_unrealized_gain_loss: number;
  total_unrealized_gain_loss_percent: number;
  results: Holding[];
}

// Treemap Data Types (for chart visualization)
export interface TreemapData {
  name: string;
  value: number;
  symbol: string;
  percentage: number;
  gainLoss: number;
  gainLossPercent: number;
  color?: string;
}

// Manual Holdings Types
export interface SimpleHolding {
  id: string;
  security: Security;
  quantity: number;
  average_cost: number;
  total_cost: number;
  current_value?: number | null;
  unrealized_gain_loss?: number | null;
  unrealized_gain_loss_percent?: number | null;
  broker: string;
  source: 'user_manual' | 'plaid';
  first_purchase_date: string;
  notes: string;
  created_at: string;
  last_updated: string;
}

export interface SimpleHoldingsResponse {
  count: number;
  results: SimpleHolding[];
}

export interface ManualHoldingFormData {
  symbol: string;
  quantity: number | '';
  average_cost: number | '';
  first_purchase_date: string;
}

export interface CreateHoldingRequest {
  security_symbol: string;
  quantity: number;
  average_cost: number;
  first_purchase_date: string;
  broker?: string;
  notes?: string;
}

export interface CreateHoldingResponse {
  id: string;
  security: {
    symbol: string;
    name: string;
    security_type: string;
  };
  quantity: number;
  average_cost: number;
  total_cost: number;
  broker: string;
  first_purchase_date: string;
  notes: string;
  source: string;
  created_at: string;
}

// News Summary Async Fetching Types
export interface NewsSummaryTaskResponse {
  task_id: string;
  status: 'queued';
  symbol: string;
  message: string;
  estimated_completion_time: string;
  polling_url: string;
  force_update: boolean;
}

export interface NewsSummaryStatusResponse {
  task_id: string;
  status: 'processing' | 'completed' | 'failed';
  symbol: string;
  message: string;
  result?: any; // Full news summary data when completed
  estimated_remaining?: string;
  started_at?: string | null;
  stopped_at?: string | null;
}
