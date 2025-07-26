# Test Google OAuth Setup

## Quick Test Steps

1. **Start the application**:
   ```bash
   # Terminal 1: Start DynamoDB Local
   docker-compose up -d

   # Terminal 2: Start SST
   npm run dev

   # Terminal 3: Start Frontend
   cd packages/frontend
   npm run dev
   ```

2. **Test OAuth Flow**:
   - Open `http://localhost:3031` (frontend runs on port 3031)
   - Click "Log Hours" to go to `/portal`
   - Try to sign in with Google
   - Should redirect to Google's OAuth consent screen
   - After approval, should redirect back with user info

3. **Check for Common Issues**:

   **Issue**: "400: redirect_uri_mismatch"
   **Solution**: Make sure your localhost URL exactly matches what's in Google Console

   **Issue**: "403: access_blocked"
   **Solution**: Add your email to test users in OAuth consent screen

   **Issue**: "Client ID not found"
   **Solution**: Double-check the client ID in your .env files

## Environment Variable Checklist

- [ ] `GOOGLE_CLIENT_ID` in `.env` (root)
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local` (root)
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `packages/frontend/.env.local`
- [ ] All three should have the same value
- [ ] Value should end with `.apps.googleusercontent.com`

## Admin Setup

To test admin functionality:
1. Update `ADMIN_EMAILS` in `.env` with your Google account email
2. Sign in to `/portal` with that email
3. Visit `/admin` to see the admin dashboard
4. Submit some test hours and then approve/reject them