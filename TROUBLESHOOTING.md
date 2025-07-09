# Gmail MCP Server - Troubleshooting Guide

## OAuth 403: access_denied Error

### The Problem
You're seeing: `Error 403: access_denied` or "ClinicApp has not completed the Google verification process. The app is currently being tested and can only be accessed by developer-approved testers."

### The Solution

#### Step 1: Add Yourself as a Test User
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to OAuth consent screen**:
   - Click on "APIs & Services" in the left sidebar
   - Click on "OAuth consent screen"
3. **Add test user**:
   - Scroll down to the "Test users" section
   - Click "ADD USERS"
   - Enter your Gmail address (the one you want to send emails from)
   - Click "Save"

#### Step 2: Verify OAuth Consent Screen Configuration
1. **Check User Type**:
   - Ensure "External" is selected (unless you have Google Workspace)
   - If "Internal" is selected and you don't have Workspace, change to "External"

2. **Fill Required Fields**:
   - App name: "Gmail MCP Server" (or any name you prefer)
   - User support email: Your email address
   - Developer contact information: Your email address

#### Step 3: Clear Browser Data and Retry
1. **Clear browser cache**:
   - Clear cookies and cache for `accounts.google.com`
   - Or use an incognito/private browsing window

2. **Retry authentication**:
   ```bash
   npm run setup
   ```

### Visual Guide

```
Google Cloud Console
└── APIs & Services
    └── OAuth consent screen
        ├── User Type: External ✓
        ├── App Information
        │   ├── App name: Gmail MCP Server
        │   ├── User support email: your-email@gmail.com
        │   └── Developer contact: your-email@gmail.com
        └── Test users
            └── your-email@gmail.com ← ADD THIS!
```

## Alternative Solutions

### Option 1: Use a Different Google Account
If you have multiple Google accounts:
1. Create the OAuth app with one account
2. Add a different Gmail account as a test user
3. Authenticate with the test user account

### Option 2: App Passwords (Gmail SMTP)
If OAuth continues to fail, you can modify the server to use Gmail's SMTP with App Passwords:

1. **Enable 2FA** on your Google account
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. **Use SMTP instead** (requires code modification)

### Option 3: Production Verification (Long-term)
For unrestricted use:
1. Complete OAuth consent screen fully
2. Add privacy policy and terms of service URLs
3. Submit for Google verification (1-4 weeks)
4. Once verified, any user can authorize

## Common Errors and Fixes

### Error: "redirect_uri_mismatch"
**Solution**: 
- In Google Cloud Console → Credentials → OAuth 2.0 Client IDs
- Add `urn:ietf:wg:oauth:2.0:oob` to authorized redirect URIs

### Error: "invalid_client"
**Solution**:
- Re-download credentials.json from Google Cloud Console
- Ensure the file is valid JSON

### Error: "Gmail API has not been used"
**Solution**:
- Go to APIs & Services → Library
- Search for "Gmail API" and enable it

### Error: "insufficient authentication scopes"
**Solution**:
- Delete token.json
- Run `npm run setup` to re-authenticate with correct scopes

## Quick Verification Checklist

- [ ] Gmail API is enabled in Google Cloud Console
- [ ] OAuth consent screen is configured with "External" user type
- [ ] Your Gmail address is added to "Test users"
- [ ] credentials.json is in the project root directory
- [ ] Browser cache is cleared or using incognito mode

## Still Having Issues?

1. **Check the project logs** when running `npm run setup`
2. **Verify your Google Cloud project** has the Gmail API enabled
3. **Try with a fresh Google Cloud project** if issues persist
4. **Use a different browser** or incognito mode

---

**💡 Pro Tip**: The OAuth verification process is only needed once. After successful authentication, the token.json file allows the server to work seamlessly.
