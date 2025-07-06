import { ApiConfig } from '@/types/api';

// API Configuration
export const apiConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 30000, // 30 seconds
  retries: 3,
};

// API Endpoints
export const endpoints = {
  chats: '/api/chats/',
  chat: (id: string) => `/api/chats/${id}`,
  messages: (chatId: string) => `/api/chats/${chatId}/messages/`,
  clearMessages: (chatId: string) => `/api/chats/${chatId}/messages/`,
} as const;

// Request headers
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

// Auth header
export const getAuthHeaders = (token: string) => ({
  ...getDefaultHeaders(),
  Authorization: `Bearer ${token}`,
});
