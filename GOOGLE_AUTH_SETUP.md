# Google Authentication Setup Guide

## Overview
Google Sign-In has been implemented using Firebase Authentication. Users can now sign in with their Google account in addition to email/password authentication.

## Installation Required

### Frontend
You need to install the Firebase SDK:

```bash
npm install firebase
```

## Firebase Console Configuration

### 1. Enable Google Sign-In Provider
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **dissasterconnect**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Enable it and configure:
   - **Project support email**: Choose your email
   - Click **Save**

### 2. Add Authorized Domains
In the Firebase Console under Authentication → Settings → Authorized domains:
- Add your production domain (e.g., `disasterconnect.vercel.app`)
- `localhost` should already be there for development

## Files Modified

### Frontend
1. **`src/firebase.js`** - Added Firebase Auth and Google provider initialization
2. **`src/lib/api.ts`** - Added `googleLogin()` method
3. **`src/lib/auth.tsx`** - Added `loginWithGoogle()` function
4. **`src/pages/auth/LoginPage.tsx`** - Added Google Sign-In button

### Backend
1. **`src/controllers/authController.js`** - Added `googleLogin()` endpoint
2. **`src/routes/auth.js`** - Added `/api/auth/google` route

## How It Works

### Authentication Flow
1. User clicks "Sign in with Google" button
2. Firebase opens Google Sign-In popup
3. User selects/authenticates with Google account
4. Firebase returns an ID token
5. Frontend sends ID token to backend at `/api/auth/google`
6. Backend verifies token with Firebase Admin SDK
7. Backend creates/retrieves user from Firestore
8. Backend returns JWT token for session management
9. User is redirected to their dashboard based on role

### User Data Storage
When a user signs in with Google:
- If user exists (by email): They are logged in
- If new user: A new user document is created in Firestore with:
  - `email`: From Google account
  - `name`: From Google profile
  - `role`: Default "citizen" (or specified during signup)
  - `firebaseUid`: Google user ID
  - `authProvider`: "google"
  - `createdAt`: Timestamp

## Testing

### Development
1. Install Firebase package:
   ```bash
   npm install firebase
   ```

2. Start your frontend:
   ```bash
   npm run dev
   ```

3. Navigate to login page
4. Click "Sign in with Google"
5. Select a Google account
6. You should be redirected to the dashboard

### Production
Make sure to:
1. Enable Google Sign-In in Firebase Console
2. Add your production domain to authorized domains
3. Deploy both frontend and backend

## API Endpoint

### POST `/api/auth/google`
**Request Body:**
```json
{
  "idToken": "firebase-id-token-here",
  "role": "citizen" // optional, defaults to "citizen"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@gmail.com",
      "name": "User Name",
      "role": "citizen"
    }
  }
}
```

## Security Notes

1. **ID Token Verification**: Backend verifies Firebase ID tokens using Firebase Admin SDK
2. **JWT Tokens**: After verification, backend issues its own JWT for session management
3. **No Password Storage**: Google-authenticated users don't have passwords in your database
4. **Email Uniqueness**: Users are matched by email - same email can't have both password and Google auth

## Troubleshooting

### "Cannot find module 'firebase/auth'" Error
Run: `npm install firebase`

### Google Sign-In Popup Blocked
- Check browser popup blocker settings
- Ensure you're testing on `localhost` or an authorized domain

### "Invalid Google token" Error
- Check that Google Sign-In is enabled in Firebase Console
- Verify Firebase project configuration in `src/firebase.js`
- Ensure backend has correct Firebase Admin credentials

### User Not Created
- Check Firestore security rules
- Verify Firebase Admin SDK is properly initialized
- Check backend logs for errors

## Next Steps

Consider adding:
1. Role selection during Google Sign-In (for new users)
2. Account linking (merge Google and email/password accounts)
3. Additional OAuth providers (Facebook, GitHub, etc.)
4. Profile picture from Google account
