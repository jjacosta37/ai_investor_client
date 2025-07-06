# API Service Integration Guide

This guide explains how to use the new API service structure to integrate your Django chat server with the React frontend.

## 🚀 Overview

The API service structure provides a clean, type-safe way to interact with your Django server while automatically handling Firebase authentication, error handling, and loading states.

## 📁 Structure

```
src/
├── services/
│   ├── api/
│   │   ├── base.ts          # Base API client with auth
│   │   ├── chat.ts          # Chat operations
│   │   ├── message.ts       # Message operations
│   │   └── index.ts         # Service exports
│   ├── config/
│   │   └── api.ts           # API configuration
│   └── index.ts             # Main exports
├── types/
│   └── api.ts               # TypeScript types
└── hooks/
    └── useApi.ts            # React hooks
```

## 🔧 Configuration

### 1. Environment Variables

Create a `.env.local` file with your API configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### 2. API Endpoints

The service automatically maps to your Django server endpoints:

- **Create Chat**: `POST /api/chats/`
- **List Chats**: `GET /api/chats/`
- **Get Chat**: `GET /api/chats/{id}/`
- **Update Chat**: `PUT /api/chats/{id}/`
- **Delete Chat**: `DELETE /api/chats/{id}/`
- **Send Message**: `POST /api/chats/{id}/messages/`
- **Get Messages**: `GET /api/chats/{id}/messages/`
- **Clear Messages**: `DELETE /api/chats/{id}/messages/`

## 🎯 Usage Examples

### Basic Usage with Hooks

```typescript
import { useMessageApi } from '@/hooks/useApi';
import { messageService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

function ChatComponent() {
  const { user } = useAuth();
  const messageApi = useMessageApi();

  const sendMessage = async (chatId: string, content: string) => {
    const result = await messageApi.execute(() =>
      messageService.sendMessage(chatId, content, user),
    );

    if (result) {
      console.log('Message sent:', result);
    }
  };

  return (
    <div>
      {messageApi.loading && <p>Sending...</p>}
      {messageApi.error && <p>Error: {messageApi.error}</p>}
      <button onClick={() => sendMessage('chat-id', 'Hello!')}>
        Send Message
      </button>
    </div>
  );
}
```

### Chat Management

```typescript
import { chatService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

function ChatManager() {
  const { user } = useAuth();

  // Create new chat
  const createChat = async () => {
    try {
      const newChat = await chatService.createChat('My New Chat', user);
      console.log('Created chat:', newChat);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // Get all chats (including archived status)
  const loadChats = async () => {
    try {
      const chats = await chatService.getChats(user);
      console.log('Loaded chats:', chats);

      // Filter archived chats if needed
      const activeChats = chats.chats.filter((chat) => !chat.is_archived);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  return (
    <div>
      <button onClick={createChat}>Create Chat</button>
      <button onClick={loadChats}>Load Chats</button>
    </div>
  );
}
```

### Message Operations

```typescript
import { messageService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

function MessageManager() {
  const { user } = useAuth();

  // Send message and get AI response
  const sendMessage = async (chatId: string, content: string) => {
    try {
      const response = await messageService.sendMessage(chatId, content, user);
      console.log('User message:', response.user_message);
      console.log('AI response:', response.assistant_message);

      // Access message metadata if available
      if (response.assistant_message.metadata) {
        console.log('AI metadata:', response.assistant_message.metadata);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Load chat history
  const loadMessages = async (chatId: string) => {
    try {
      const messages = await messageService.getChatMessages(chatId, user);
      console.log('Chat messages:', messages);

      // Handle different message roles
      messages.forEach((message) => {
        switch (message.role) {
          case 'user':
            console.log('User said:', message.content);
            break;
          case 'assistant':
            console.log('AI replied:', message.content);
            break;
          case 'system':
            console.log('System message:', message.content);
            break;
        }
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  return (
    <div>
      <button onClick={() => sendMessage('chat-id', 'Hello!')}>
        Send Message
      </button>
      <button onClick={() => loadMessages('chat-id')}>Load Messages</button>
    </div>
  );
}
```

## 🔒 Authentication

The service automatically handles Firebase authentication:

- **Automatic Token Inclusion**: Firebase ID tokens are automatically included in requests
- **Token Refresh**: Handles token refresh automatically
- **Error Handling**: Manages authentication errors gracefully

## 🛠️ Advanced Features

### Custom Request Configuration

```typescript
const config = {
  timeout: 60000, // 60 seconds
  retries: 5, // Retry 5 times
  headers: {
    'Custom-Header': 'value',
  },
};

const result = await messageService.sendMessage(chatId, content, user, config);
```

### Error Handling

```typescript
import { ApiError } from '@/services';

try {
  await messageService.sendMessage(chatId, content, user);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('API Error:', error.originalMessage);
    console.log('Details:', error.details);
  } else {
    console.log('Network Error:', error.message);
  }
}
```

### Silent Operations (No Toast Notifications)

```typescript
import { useApiSilent } from '@/hooks/useApi';

function SilentOperation() {
  const api = useApiSilent();

  const loadData = async () => {
    await api.execute(() => chatService.getChats(user));
  };

  return <button onClick={loadData}>Load Data</button>;
}
```

## 🎨 Integration with Existing Components

### Updating the Chat Page

Replace the placeholder implementation in `app/page.tsx`:

```typescript
// Remove this placeholder code:
// setTimeout(() => {
//   const assistantMessage: Message = {
//     type: 'assistant',
//     content: 'This is a placeholder response...',
//   };
//   setMessages((prev) => [...prev, assistantMessage]);
//   setLoading(false);
// }, 1000);

// Replace with real API call:
const result = await messageApi.execute(() =>
  messageService.sendMessage(chatId, inputCode, user),
);

if (result) {
  setMessages((prev) => [
    ...prev,
    result.user_message,
    result.assistant_message,
  ]);
}
```

## 🔧 Type Safety

All API operations are fully typed to match your Django models:

```typescript
interface Message {
  id: string;
  chat: string; // Chat ID reference
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  message_count: number;
  last_message?: string; // Computed field
  last_message_at?: string; // Computed field
}
```

### Django Model Alignment

The TypeScript interfaces are designed to match your Django models exactly:

**Django Chat Model** → **TypeScript Chat Interface**

- `id: UUIDField` → `id: string`
- `title: CharField` → `title: string`
- `created_at: DateTimeField` → `created_at: string`
- `updated_at: DateTimeField` → `updated_at: string`
- `is_archived: BooleanField` → `is_archived: boolean`
- `message_count` (property) → `message_count: number`

**Django Message Model** → **TypeScript Message Interface**

- `id: UUIDField` → `id: string`
- `chat: ForeignKey` → `chat: string` (ID reference)
- `role: CharField` → `role: 'user' | 'assistant' | 'system'`
- `content: TextField` → `content: string`
- `created_at: DateTimeField` → `created_at: string`
- `metadata: JSONField` → `metadata: Record<string, any>`

## 🚀 Next Steps

1. **Add Environment Variables**: Copy `.env.example` to `.env.local` and fill in your values
2. **Start Your Django Server**: Make sure your Django server is running
3. **Test the Integration**: Use the provided examples to test the API calls
4. **Customize**: Modify the services to match your specific API requirements

## 📱 React Hook Usage Patterns

### Loading States

```typescript
const { data, loading, error, execute } = useMessageApi();

if (loading) return <Spinner />;
if (error) return <Error message={error} />;
```

### Success/Error Handling

```typescript
const chatApi = useChatApi(); // Shows success/error toasts
const messageApi = useMessageApi(); // Shows errors only
const silentApi = useApiSilent(); // No notifications
```

### Handling Different Message Roles

```typescript
const renderMessage = (message: Message) => {
  switch (message.role) {
    case 'user':
      return <UserMessage content={message.content} />;
    case 'assistant':
      return (
        <AssistantMessage
          content={message.content}
          metadata={message.metadata}
        />
      );
    case 'system':
      return <SystemMessage content={message.content} />;
    default:
      return <GenericMessage content={message.content} />;
  }
};
```

## 🔍 Debugging

Enable detailed logging by setting `NODE_ENV=development` in your environment variables. The service will log:

- Request details
- Response data
- Authentication tokens (sanitized)
- Error details

## 📚 API Reference

### Chat Service Methods

- `createChat(title?, user, config?)` - Create new chat
- `getChats(user, config?)` - Get all chats
- `getChatDetails(chatId, user, config?)` - Get chat with messages
- `updateChat(chatId, updates, user, config?)` - Update chat
- `deleteChat(chatId, user, config?)` - Delete/archive chat

### Message Service Methods

- `sendMessage(chatId, content, user, config?)` - Send message
- `getChatMessages(chatId, user, config?)` - Get messages
- `clearChatMessages(chatId, user, config?)` - Clear messages
- `getLatestMessage(chatId, user, config?)` - Get latest message

This API service structure provides a robust, type-safe foundation for your chat application integration. All Firebase authentication is handled automatically, and the service includes comprehensive error handling and retry logic.

## 🎯 Key Features Aligned with Django

- **UUID Primary Keys**: All IDs are properly typed as strings to match Django's UUID fields
- **Role Support**: Full support for user, assistant, and system message roles
- **Metadata Storage**: Proper handling of message metadata as JSON objects
- **Archive Support**: Proper handling of chat archiving functionality
- **Timestamp Handling**: Consistent datetime string formatting from Django serialization
