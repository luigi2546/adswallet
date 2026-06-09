# OAuth Platform Integration Setup

This guide explains how to connect AdWallet Africa to each supported social media platform using real OAuth credentials.

---

## Overview

AdWallet uses OAuth 2.0 to let users link their social media accounts. When credentials are configured, clicking a platform button in **Settings → Connected Accounts** opens the platform's official login screen. After the user approves, AdWallet receives an access token and can fetch real posts for the Boost Content feature.

### Callback URLs

You must register these redirect URIs in each platform's developer console. Replace `YOUR_DOMAIN` with your deployed app domain (visible in the Replit preview URL or your custom domain).

```
https://YOUR_DOMAIN/api/oauth/callback/facebook
https://YOUR_DOMAIN/api/oauth/callback/instagram
https://YOUR_DOMAIN/api/oauth/callback/youtube
https://YOUR_DOMAIN/api/oauth/callback/google
https://YOUR_DOMAIN/api/oauth/callback/tiktok
```

### Environment Variables

Set these in Replit under **Secrets** (not plain env vars — keep them private):

| Secret Key | Platform |
|---|---|
| `META_APP_ID` | Facebook + Instagram |
| `META_APP_SECRET` | Facebook + Instagram |
| `GOOGLE_CLIENT_ID` | YouTube + Google Business |
| `GOOGLE_CLIENT_SECRET` | YouTube + Google Business |
| `TIKTOK_CLIENT_KEY` | TikTok |
| `TIKTOK_CLIENT_SECRET` | TikTok |

---

## Meta (Facebook + Instagram)

Facebook and Instagram share one Meta app.

### 1. Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com) and sign in.
2. Click **My Apps → Create App**.
3. Choose **Business** as the app type, then click **Next**.
4. Fill in the app name (e.g. "AdWallet Africa") and contact email, then click **Create App**.

### 2. Add Facebook Login

1. Inside your app dashboard, click **Add Product** and choose **Facebook Login**.
2. Choose **Web** as the platform.
3. Under **Facebook Login → Settings**, add your callback URLs to **Valid OAuth Redirect URIs**:
   ```
   https://YOUR_DOMAIN/api/oauth/callback/facebook
   https://YOUR_DOMAIN/api/oauth/callback/instagram
   ```
4. Click **Save Changes**.

### 3. Add Required Permissions

Go to **App Review → Permissions and Features** and request:

| Permission | Purpose |
|---|---|
| `pages_show_list` | List user's Facebook Pages |
| `pages_read_engagement` | Read page post engagement |
| `instagram_basic` | Read Instagram business profile |
| `instagram_content_publish` | Publish boosted content |
| `ads_management` | Create and manage ad campaigns |
| `public_profile` | Read basic profile info |

> During development, these permissions work for app admins and testers without review. Submit for App Review before going to production.

### 4. Get Your Credentials

Go to **Settings → Basic**:

- Copy **App ID** → set as `META_APP_ID`
- Click **Show** next to App Secret → set as `META_APP_SECRET`

### 5. Set App Mode

- While testing: keep the app in **Development** mode (only admins/testers can connect).
- When ready for real users: switch to **Live** mode after completing App Review.

---

## Google (YouTube + Google Business)

YouTube and Google Business share one Google OAuth app.

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in.
2. Click the project dropdown → **New Project**.
3. Name it (e.g. "AdWallet Africa") and click **Create**.

### 2. Enable Required APIs

Go to **APIs & Services → Library** and enable:

- **YouTube Data API v3** (for YouTube channel posts)
- **Google My Business API** (for Google Business posts)
- **People API** (for profile information)

### 3. Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**.
2. Choose **External** (for any Google user) and click **Create**.
3. Fill in:
   - App name: `AdWallet Africa`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**.
5. Under **Scopes**, add:
   ```
   openid
   profile
   email
   https://www.googleapis.com/auth/youtube.readonly
   ```
6. Add test users (any Google account) under **Test users** during development.

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Choose **Web application**.
3. Under **Authorised redirect URIs**, add:
   ```
   https://YOUR_DOMAIN/api/oauth/callback/google
   https://YOUR_DOMAIN/api/oauth/callback/youtube
   ```
4. Click **Create**.
5. Copy **Client ID** → set as `GOOGLE_CLIENT_ID`
6. Copy **Client Secret** → set as `GOOGLE_CLIENT_SECRET`

### 5. Publishing

- In **Testing** mode, only test users can connect. 
- Submit for **Verification** via OAuth consent screen to allow any Google user.

---

## TikTok for Business

### 1. Create a TikTok Developer App

1. Go to [developers.tiktok.com](https://developers.tiktok.com) and sign in with a TikTok account.
2. Click **Manage Apps → Create an App**.
3. Choose **Web** as the platform.
4. Fill in app name (e.g. "AdWallet Africa"), category, and description.

### 2. Configure Login Kit

1. Inside your app, go to **Products → Login Kit → Add**.
2. Under **Redirect domain**, add your domain:
   ```
   YOUR_DOMAIN
   ```
3. Under **Redirect URI for Login Kit**, add:
   ```
   https://YOUR_DOMAIN/api/oauth/callback/tiktok
   ```

### 3. Request Required Scopes

Go to **Scope** and request:

| Scope | Purpose |
|---|---|
| `user.info.basic` | Read TikTok username and avatar |
| `video.list` | Fetch list of user's videos |

> Scopes require approval from TikTok. Use sandbox mode with test accounts during development.

### 4. Get Your Credentials

Go to your app's **Basic Info**:

- Copy **Client Key** → set as `TIKTOK_CLIENT_KEY`
- Copy **Client Secret** → set as `TIKTOK_CLIENT_SECRET`

### 5. Sandbox vs Production

- In sandbox, only whitelisted test accounts can connect.
- Submit for **Audit** to go live with real users.

---

## Testing the Integration

Once credentials are set in Replit Secrets and your domain is registered in each platform:

1. Restart the API server workflow in Replit.
2. Log in to AdWallet and go to **Settings → Connected Accounts**.
3. Click any platform button — you should be redirected to the platform's official login.
4. After approving, you are redirected back to Settings with a success message.
5. Connected accounts appear in the list and are available in the **Boost Content** wizard.

### Verify via API

```bash
# Get an auth token
TOKEN=$(curl -s -X POST https://YOUR_DOMAIN/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' | jq -r '.token')

# Initiate OAuth (returns the platform login URL)
curl https://YOUR_DOMAIN/api/oauth/connect/facebook \
  -H "Authorization: Bearer $TOKEN"

# Check which platforms are connected
curl https://YOUR_DOMAIN/api/oauth/status \
  -H "Authorization: Bearer $TOKEN"
```

---

## Demo Mode

If any credential starts with `placeholder_`, AdWallet automatically runs in **demo mode** for that platform. Demo mode:

- Skips the real OAuth redirect entirely.
- Creates a realistic fake account (name, handle, follower count) instantly.
- Posts shown in the Boost wizard use generated mock data.
- A `(demo)` label appears in the success toast.

This lets you build and test the full flow before your apps are approved by the platforms.

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `invalid_state` | State token expired or tampered | Retry the connection flow |
| `redirect_uri_mismatch` | Callback URL not registered | Add the exact URL to the platform portal |
| `insufficient_permissions` | Scope not approved | Request the scope in the platform developer console |
| `token expired` | Access token is stale | Re-connect the account from Settings |
| Platform returns `error` param | User cancelled or app misconfigured | Check app status and permissions in the platform portal |

---

## Architecture Reference

```
GET  /api/oauth/connect/:platform   → Returns { url } to redirect the browser to
GET  /api/oauth/callback/:platform  → Receives code, exchanges for token, stores in oauth_tokens table
GET  /api/oauth/status              → Returns connected platform statuses for current user
DELETE /api/oauth/:platform         → Revokes stored token

Token storage: oauth_tokens table (userId + platform, unique index)
Fallback: mock posts used when no valid token exists for a platform
```

Platform credentials are read from environment variables at runtime — no rebuild needed when you rotate keys.
