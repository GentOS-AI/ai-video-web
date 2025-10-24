# Google OAuth Configuration Guide

## Google Cloud Console Settings ✅ CONFIRMED

Project ID: `video4ads`
Client ID: `308948240387-jpe60s3ok4nkj0qm1q76kkl1ugtfrsik.apps.googleusercontent.com`
Client Secret: `GOCSPX-***` (Stored in .env files, not committed to git)

### Current Configuration in Google Cloud Console

Navigate to: https://console.cloud.google.com/apis/credentials

#### 1. Authorized JavaScript Origins ✅

**Configured:**
```
https://video4ads.com
http://localhost:8080
```

#### 2. Authorized Redirect URIs ✅

**Configured:**
```
https://video4ads.com/auth/callback
http://localhost:8080/auth/callback
```

**Note:** The path `/auth/callback` is the unified callback endpoint that:
- Is locale-independent (no `/en/`, `/zh/` prefix)
- Automatically detects user's preferred language
- Redirects to appropriate localized homepage after authentication

### Current Application Configuration

#### Frontend (.env / .env.production)
```env
GOOGLE_CLIENT_ID=308948240387-jpe60s3ok4nkj0qm1q76kkl1ugtfrsik.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-***
NEXT_PUBLIC_GOOGLE_CLIENT_ID=308948240387-jpe60s3ok4nkj0qm1q76kkl1ugtfrsik.apps.googleusercontent.com
```

#### Backend (backend/.env)

**Local Development:**
```env
GOOGLE_CLIENT_ID=308948240387-jpe60s3ok4nkj0qm1q76kkl1ugtfrsik.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-***
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback
```

**Production:**
```env
GOOGLE_CLIENT_ID=308948240387-jpe60s3ok4nkj0qm1q76kkl1ugtfrsik.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-***
GOOGLE_REDIRECT_URI=https://video4ads.com/auth/callback
```

## OAuth Flow Diagram

```
User clicks "Login with Google"
        ↓
Browser redirects to Google OAuth Consent Screen
  URL: https://accounts.google.com/o/oauth2/v2/auth
  Params:
    - client_id: 308948240387-jpe60s3ok4nkj0qm1q76kkl1ugtfrsik...
    - redirect_uri: https://video4ads.com/auth/callback
    - scope: openid email profile
    - response_type: code
        ↓
User grants permission
        ↓
Google redirects back to application
  URL: https://video4ads.com/auth/callback?code=4/0Aed...
        ↓
Frontend /auth/callback route handler:
  1. Detects user's preferred locale (cookie or browser language)
  2. Extracts authorization code from URL
  3. Calls backend API: POST /api/v1/auth/google
     Body: { code, redirect_uri }
        ↓
Backend exchanges code for tokens with Google
  URL: https://oauth2.googleapis.com/token
  Params:
    - code: 4/0Aed...
    - client_id: 308948240387-jpe60s3ok4nkj0qm1q76kkl1ugtfrsik...
    - client_secret: GOCSPX-*** (from .env)
    - redirect_uri: https://video4ads.com/auth/callback
    - grant_type: authorization_code
        ↓
Backend receives tokens and user info
  Response: { access_token, refresh_token, id_token }
        ↓
Backend creates/updates user in database
        ↓
Backend returns JWT tokens to frontend
  Response: { access_token, refresh_token, user }
        ↓
Frontend stores tokens in localStorage
        ↓
Frontend redirects to localized homepage
  Examples:
    - /en?login=success (English)
    - /zh?login=success (Simplified Chinese)
    - /zh-TW?login=success (Traditional Chinese)
```

## Testing OAuth Flow

### Local Development Testing

1. **Start both frontend and backend:**
   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Click "Login with Google" button**

3. **Expected Flow:**
   - Redirects to Google consent screen
   - After consent, returns to `http://localhost:3000/auth/callback?code=...`
   - Automatically logs in and redirects to `http://localhost:3000/en?login=success`

### Production Testing

1. **Visit:** https://video4ads.com

2. **Click "Login with Google"**

3. **Expected Flow:**
   - Redirects to Google consent screen
   - After consent, returns to `https://video4ads.com/auth/callback?code=...`
   - Automatically logs in and redirects to `https://video4ads.com/en?login=success`

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect_uri sent to Google doesn't match any authorized redirect URIs in Google Cloud Console.

**Solution:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Click on the OAuth 2.0 Client ID
3. Add the exact redirect_uri to "Authorized redirect URIs"
4. Save changes
5. Wait 5 minutes for changes to propagate

### Error: "invalid_client"

**Cause:** Client ID or Client Secret is incorrect.

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in .env files
2. Ensure they match the credentials in Google Cloud Console
3. Restart both frontend and backend servers

### Error: "access_denied"

**Cause:** User denied permission or OAuth consent screen is not configured.

**Solution:**
1. Check OAuth consent screen configuration in Google Cloud Console
2. Ensure app is published (or user is added as test user)
3. Verify scopes requested are authorized

### Login succeeds but user data not saved

**Cause:** Backend API not receiving/processing the authentication properly.

**Solution:**
1. Check backend logs for errors
2. Verify database connection
3. Ensure backend endpoint `/api/v1/auth/google` is working
4. Test backend directly with curl:
   ```bash
   curl -X POST https://video4ads.com/api/v1/auth/google \
     -H "Content-Type: application/json" \
     -d '{"code":"test_code","redirect_uri":"https://video4ads.com/auth/callback"}'
   ```

## Security Notes

1. **Never commit secrets to git**
   - `.env` files are in `.gitignore`
   - Use environment variables in production

2. **Rotate credentials regularly**
   - Change client secret every 90 days
   - Update in both Google Cloud Console and .env files

3. **Use HTTPS in production**
   - HTTP is only allowed for localhost development
   - Production must use HTTPS for OAuth security

4. **Validate tokens on backend**
   - Always verify Google ID tokens on the backend
   - Don't trust tokens from frontend without validation

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
