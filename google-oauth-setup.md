# Google OAuth Setup - Updated Ports

## Port Configuration
- **API (SST)**: `http://localhost:3030`
- **Frontend (Next.js)**: `http://localhost:3031`
- **Grafana**: `http://localhost:3000` (no conflict!)

## Google Cloud Console Setup

### 1. OAuth 2.0 Client ID Configuration

In **APIs & Services** → **Credentials** → **OAuth 2.0 Client IDs**:

**Authorized JavaScript origins**:
```
http://localhost:3030
http://localhost:3031
https://your-production-domain.com
```

**Authorized redirect URIs**:
```
http://localhost:3030
http://localhost:3031
https://your-production-domain.com
```

### 2. OAuth Consent Screen

- **User Type**: External ✅
- **App Name**: Paint It Forward
- **Test Users**: Add your Gmail address
- **Scopes**: email, profile, openid

### 3. Environment Variables

```bash
# .env (root)
GOOGLE_CLIENT_ID=351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com
ADMIN_EMAILS=your_email@gmail.com

# .env.local (root) 
NEXT_PUBLIC_GOOGLE_CLIENT_ID=351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:3030

# packages/frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:3030
```

## Development Workflow

```bash
# Terminal 1: DynamoDB Local
docker-compose up -d

# Terminal 2: SST API Server (port 3030)
npm run dev

# Terminal 3: Next.js Frontend (port 3031)
cd packages/frontend
npm run dev
```

**Access URLs**:
- Frontend: `http://localhost:3031`
- API: `http://localhost:3030` (used by frontend)
- Grafana: `http://localhost:3000` (no conflict)

## Testing OAuth

1. Visit `http://localhost:3031`
2. Click "Log Hours" → `/portal`
3. Click Google Sign-In button
4. Should redirect to Google OAuth consent
5. After approval, redirects back to your app

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Ensure Google Console has `http://localhost:3031` |
| `popup_blocked` | Allow popups for localhost:3031 |
| API not found | Check that SST dev server is running on port 3030 |
| CORS errors | Verify `NEXT_PUBLIC_API_URL=http://localhost:3030` |