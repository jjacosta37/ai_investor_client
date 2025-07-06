# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication with Google sign-in for your chat application.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "my-chat-app")
4. Enable Google Analytics if desired
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project dashboard, click on "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Click on "Google" from the providers list
5. Toggle the "Enable" switch
6. Enter your project's public-facing name
7. Choose a support email
8. Click "Save"

## 3. Add Web App to Firebase Project

1. In your Firebase project dashboard, click the web icon (</>) to add a web app
2. Enter an app nickname (e.g., "Chat UI Web")
3. Check "Also set up Firebase Hosting" if desired
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need these values!

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase configuration values in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## 5. Configure Authorized Domains (Important!)

1. In Firebase Console, go to Authentication > Settings > Authorized domains
2. Add your domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourapp.com`)

## 6. Test the Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. You should be redirected to the sign-in page
4. Click "Continue with Google" to test authentication
5. After successful sign-in, you should be redirected to the chat interface

## 7. Security Notes

- **Never commit your `.env.local` file to version control**
- The `.env.example` file is safe to commit as it contains no real credentials
- Your Firebase API key is safe to expose in client-side code (it's meant to be public)
- Firebase Security Rules control access to your data, not the API key

## 8. Optional: Set up Firebase Security Rules

For additional security, you can set up Firestore security rules if you plan to store user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"

- Make sure your domain is added to the Authorized domains list in Firebase Console

### "Firebase: Error (auth/api-key-not-valid)"

- Check that your API key is correct in the `.env.local` file
- Ensure there are no extra spaces or characters

### Authentication not working

- Verify all environment variables are correctly set
- Check the browser console for any error messages
- Ensure your Firebase project has Google authentication enabled

## Getting User Tokens for API Calls

When you're ready to use authentication tokens for API calls, you can get the user's ID token like this:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();

  const makeAuthenticatedRequest = async () => {
    if (user) {
      const token = await user.getIdToken();
      // Use this token in your API requests
      const response = await fetch('/api/my-endpoint', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  };
}
```

Your server can then verify this token using the Firebase Admin SDK to ensure the request is from an authenticated user.
