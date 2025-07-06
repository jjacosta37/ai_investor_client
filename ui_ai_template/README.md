# AI Chat Application Template 🤖💬

A modern, full-stack AI chat application template built with Next.js 15, React 19, and designed to integrate seamlessly with a Django REST API backend. This template provides a solid foundation for building sophisticated AI chat applications with real-time messaging, user authentication, and a beautiful, responsive UI.

## ✨ Features

### Frontend Features

- **Modern Tech Stack**: Next.js 15 + React 19 + TypeScript
- **Beautiful UI**: Chakra UI with dark/light mode support
- **Real-time Chat**: Instant messaging with auto-scroll and loading states
- **Firebase Authentication**: Google OAuth integration
- **Type-Safe API**: Fully typed API services with error handling
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Chat Management**: Create, list, and navigate between conversations
- **Message History**: Persistent chat history with pagination support
- **Code Highlighting**: Syntax highlighting for code blocks in messages
- **Markdown Support**: Rich text rendering with markdown support

### Backend Integration

- **Django REST API**: Seamless integration with Django backend
- **Firebase Auth**: JWT token-based authentication
- **RESTful Endpoints**: Standard CRUD operations for chats and messages
- **Error Handling**: Comprehensive error handling and user feedback
- **Request Caching**: Optimized API calls with loading states

## 🏗️ Project Structure

```
ui_ai_template/
├── app/                          # Next.js 13+ App Router
│   ├── api/                      # API routes (if needed)
│   ├── sign-in/                  # Authentication page
│   ├── page.tsx                  # Main chat interface
│   └── layout.tsx                # Root layout
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── chat/                 # Chat-specific components
│   │   ├── sidebar/              # Navigation sidebar
│   │   ├── navbar/               # Top navigation
│   │   ├── MessageBox.tsx        # Message display component
│   │   └── ...                   # Other UI components
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx       # Firebase authentication
│   │   └── ChatContext.tsx       # Chat state management
│   ├── services/                 # API services
│   │   ├── api/                  # HTTP client services
│   │   │   ├── base.ts           # Base API client
│   │   │   ├── chat.ts           # Chat operations
│   │   │   └── message.ts        # Message operations
│   │   └── config/               # API configuration
│   ├── hooks/                    # Custom React hooks
│   │   └── useApi.ts             # API state management
│   ├── types/                    # TypeScript definitions
│   │   └── api.ts                # API response types
│   ├── lib/                      # Utility libraries
│   │   └── firebase.ts           # Firebase configuration
│   └── styles/                   # Global styles
├── public/                       # Static assets
├── docs/                         # Documentation
│   ├── README_API_INTEGRATION.md # API integration guide
│   └── FIREBASE_SETUP.md         # Firebase setup guide
└── package.json                  # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for authentication)
- Django backend server (see integration guide)

### 1. Clone the Template

```bash
# Clone this template to your project directory
cp -r ui_ai_template/ your-new-project/
cd your-new-project/

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Django API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Optional: Custom base path for deployment
NEXT_PUBLIC_BASE_PATH=/your-app-path
```

### 3. Firebase Setup

1. **Create Firebase Project**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Google Authentication
   - Add your domain to authorized domains

2. **Get Configuration**:
   - Go to Project Settings → General → Your apps
   - Add a web app and copy the configuration values
   - Add these values to your `.env.local` file

> 📖 **Detailed Setup**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete instructions

### 4. Django Backend Setup

This template is designed to work with a Django REST API backend. The backend should provide these endpoints:

- `POST /api/chats/` - Create new chat
- `GET /api/chats/` - List user's chats
- `GET /api/chats/{id}/` - Get chat details
- `PUT /api/chats/{id}/` - Update chat
- `DELETE /api/chats/{id}/` - Delete chat
- `POST /api/chats/{id}/messages/` - Send message
- `GET /api/chats/{id}/messages/` - Get chat messages
- `DELETE /api/chats/{id}/messages/` - Clear messages

> 📖 **API Integration**: See [README_API_INTEGRATION.md](./README_API_INTEGRATION.md) for detailed API documentation

### 5. Run the Application

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Lint code
npm run lint
```

Visit `http://localhost:3000` to see your chat application!

## 🔧 Configuration

### API Configuration

The API base URL and endpoints are configured in `src/services/config/api.ts`:

```typescript
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export const endpoints = {
  chats: '/api/chats/',
  chat: (id: string) => `/api/chats/${id}`,
  messages: (chatId: string) => `/api/chats/${chatId}/messages/`,
  clearMessages: (chatId: string) => `/api/chats/${chatId}/messages/`,
} as const;
```

### Theme Customization

The application uses Chakra UI with a custom theme. You can modify colors, fonts, and components in `src/theme/`.

### Component Customization

All components are modular and can be easily customized:

- `MessageBox.tsx` - Message display and formatting
- `ChatInterface.tsx` - Main chat interface
- `Sidebar` - Navigation and chat list
- `Navbar` - Top navigation and user menu

## 🎯 Usage Examples

### Basic Chat Integration

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import { useMessageApi } from '@/hooks/useApi';
import { messageService } from '@/services';

function MyChatComponent() {
  const { user } = useAuth();
  const { selectedChatId, createNewChat } = useChatContext();
  const messageApi = useMessageApi();

  const sendMessage = async (content: string) => {
    if (!selectedChatId) {
      await createNewChat();
    }

    const result = await messageApi.execute(() =>
      messageService.sendMessage(selectedChatId!, content, user),
    );

    if (result) {
      console.log('Message sent:', result);
    }
  };

  return (
    <div>
      {messageApi.loading && <div>Sending...</div>}
      {messageApi.error && <div>Error: {messageApi.error}</div>}
      <button onClick={() => sendMessage('Hello!')}>Send Message</button>
    </div>
  );
}
```

### Custom API Integration

```tsx
import { BaseApiService } from '@/services/api/base';
import { useAuth } from '@/contexts/AuthContext';

// Create your own API service
class CustomService extends BaseApiService {
  async getCustomData(user: User | null) {
    return this.get<any>('/api/custom-endpoint/', user);
  }
}

const customService = new CustomService();

// Use in component
function MyComponent() {
  const { user } = useAuth();

  const loadData = async () => {
    const data = await customService.getCustomData(user);
    console.log(data);
  };

  return <button onClick={loadData}>Load Data</button>;
}
```

## 📚 Key Components

### Authentication Context

- **Purpose**: Manages Firebase authentication state
- **Features**: Google OAuth, user state management, auto-login
- **Usage**: Wrap your app with `AuthProvider` and use `useAuth()` hook

### Chat Context

- **Purpose**: Manages chat state and operations
- **Features**: Chat selection, creation, listing, current chat tracking
- **Usage**: Use `useChatContext()` hook to access chat functionality

### API Services

- **Purpose**: Type-safe API communication with Django backend
- **Features**: Automatic authentication, error handling, request/response typing
- **Usage**: Import services from `@/services` and use with custom hooks

### Custom Hooks

- **`useApi`**: Provides loading states and error handling for API calls
- **`useMessageApi`**: Specialized hook for message operations
- **`useChatApi`**: Specialized hook for chat operations

## 🔐 Authentication Flow

1. **Initial Load**: Check if user is authenticated
2. **Sign In**: Redirect to sign-in page if not authenticated
3. **Google OAuth**: Use Firebase Google provider
4. **Token Management**: Automatically attach JWT tokens to API requests
5. **Protected Routes**: Automatically redirect unauthenticated users

## 🔗 Django Integration

This template is designed to work seamlessly with Django backends:

### Expected Django Models

```python
# See django_models.py for complete model definitions
class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=[...])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)
```

### Authentication Integration

The template automatically sends Firebase JWT tokens in the `Authorization` header:

```
Authorization: Bearer <firebase-jwt-token>
```

Your Django backend should verify these tokens using the Firebase Admin SDK.

## 🚀 Deployment

### Environment Variables for Production

```env
# Production Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=prod_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=prod_app_id

# Production API URL
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com

# Optional: Custom base path
NEXT_PUBLIC_BASE_PATH=/chat-app
```

### Build and Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to your preferred platform
# (Vercel, Netlify, AWS, etc.)
```

## 📖 Documentation

- **[API Integration Guide](./README_API_INTEGRATION.md)**: Detailed API usage examples
- **[Firebase Setup Guide](./FIREBASE_SETUP.md)**: Complete Firebase configuration
- **[Postman Collection](../django_chat_api_postman_collection.json)**: API testing collection

## 🛠️ Customization

### Adding New Features

1. **New API Endpoints**: Add to `src/services/config/api.ts`
2. **New Components**: Create in `src/components/`
3. **New Contexts**: Add to `src/contexts/`
4. **New Types**: Define in `src/types/`

### Styling Customization

- **Theme**: Modify `src/theme/` for global theme changes
- **Components**: Update individual component styles
- **Colors**: Customize brand colors in theme configuration

### Advanced Features

- **Real-time Updates**: Add WebSocket support for live messaging
- **File Uploads**: Integrate file upload functionality
- **Voice Messages**: Add voice recording and playback
- **Rich Media**: Support for images, videos, and documents

## 📄 License

This template is provided under the [MIT License](./LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions and support:

- Review the documentation in the `docs/` directory
- Check the API integration guide for backend setup
- Review the Firebase setup guide for authentication issues

---

**Happy Coding!** 🚀 This template provides a solid foundation for building modern AI chat applications. Customize it to fit your specific needs and build something amazing!
