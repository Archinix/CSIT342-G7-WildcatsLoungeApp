# SendGrid Email Integration Setup Guide

This guide explains how we've set up SendGrid for password reset emails in your Wildcats Lounge application.

## Overview

**Why SendGrid Web API (not SMTP)?**
- Render containers block outbound SMTP connections (security measure)
- SendGrid REST API uses HTTP (not blocked by Render)
- More reliable and scalable for modern applications

## Step 1: Get Your SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Click **Settings** → **API Keys** in the left sidebar
3. Click **Create API Key** (blue button)
4. **Name**: Enter `wildcats-lounge-prod` (or similar)
5. **Access Level**: Select **Restricted Access**
6. Scroll down to **Mail Send** and set to **Full Access**
7. Click **Create & View**
8. **Copy and save your API key** - You'll need it in the next step

⚠️ **IMPORTANT**: Save this key securely. You cannot view it again after closing this page.

## Step 2: Set Up Environment Variables

### For Local Development:

Create/update a `.env` file in the backend root directory (`WildcatsLoungeBackend/abatayo/`):

```properties
SENDGRID_API_KEY=SG.your_actual_api_key_here
MAIL_FROM_ADDRESS=noreply@wildcatslounge.com
FRONTEND_URL=http://localhost:5173
```

Or run Maven with system properties:
```bash
cd WildcatsLoungeBackend/abatayo
mvn spring-boot:run \
  -Dsendgrid.api-key=SG.your_api_key \
  -Dapp.mail.from-address=noreply@wildcatslounge.com \
  -Dapp.frontend.url=http://localhost:5173
```

### For Render Production:

1. Go to your Render Dashboard: https://dashboard.render.com
2. Select your Backend service (`csit342-g7-wildcatsloungeapp`)
3. Go to **Environment** tab
4. Add these environment variables:
   - **Key**: `SENDGRID_API_KEY` → **Value**: `SG.your_actual_api_key_here`
   - **Key**: `MAIL_FROM_ADDRESS` → **Value**: `noreply@wildcatslounge.com`
   - **Key**: `FRONTEND_URL` → **Value**: `https://csit-342-g7-wildcats-lounge-app.vercel.app`

5. Click **Save Changes**
6. Render will automatically redeploy your backend

## Step 3: Verify Configuration in Code

The backend is already configured with:

**application.properties**:
```properties
sendgrid.api-key=${SENDGRID_API_KEY:your-api-key-here}
app.mail.from-address=${MAIL_FROM_ADDRESS:noreply@wildcatslounge.com}
app.frontend.url=${FRONTEND_URL:http://localhost:5173}
```

**SendGridEmailService.java**: Handles REST API calls to SendGrid
- Location: `WildcatsLoungeBackend/abatayo/src/main/java/com/sysintegg7/abatayo/wildcatslounge/auth/SendGridEmailService.java`
- Sends emails via `https://api.sendgrid.com/v3/mail/send`
- Includes proper error handling and logging

**PasswordResetService.java**: Uses SendGridEmailService
- Location: `WildcatsLoungeBackend/abatayo/src/main/java/com/sysintegg7/abatayo/wildcatslounge/auth/PasswordResetService.java`
- Generates password reset tokens
- Sends async emails (non-blocking)

**AppConfig.java**: Provides RestTemplate bean
- Location: `WildcatsLoungeBackend/abatayo/src/main/java/com/sysintegg7/abatayo/wildcatslounge/config/AppConfig.java`

## Step 4: Test Password Reset Flow

### Local Testing:

1. Start your backend:
   ```bash
   cd WildcatsLoungeBackend/abatayo
   mvn spring-boot:run
   ```

2. Start your frontend:
   ```bash
   cd WildcatsLoungeFrontend
   npm run dev
   ```

3. Go to Login page → Click "Forgot Password"
4. Enter a valid email address
5. Check backend logs for:
   - ✅ "Attempting to send password reset email to: user@example.com"
   - ✅ "Email sent successfully to: user@example.com"
   - ❌ If you see errors, check your API key and network connectivity

### API Testing with cURL:

```bash
# Test password reset endpoint
curl -X POST http://localhost:8080/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Expected response:
# {"message":"Password reset link sent to your email"}
```

Check logs:
```bash
tail -f target/*.log | grep "password reset"
```

## Step 5: Verify Email Sending

### Check SendGrid Activity Log:

1. Go to SendGrid Dashboard → **Mail** → **Activity**
2. Look for emails sent to your test address
3. Click on an email to see:
   - Delivery status
   - Bounce or delivery confirmation
   - Email details

### Common Issues:

| Issue | Solution |
|-------|----------|
| "401 Unauthorized" | API key is invalid or expired. Get a new one from SendGrid. |
| "400 Bad Request" | Email format invalid or from address not verified. Use valid email. |
| "Connection timeout" | Backend can't reach SendGrid. Check internet/firewall. |
| "Email not received" | Check spam folder. May need to verify sender domain. |

## Step 6: Add Sender Email to SendGrid (Optional but Recommended)

To use a custom sender email instead of `noreply@wildcatslounge.com`:

1. SendGrid Dashboard → **Settings** → **Sender Authentication**
2. Click **Verify a Domain** or **Verify a Single Sender**
3. Follow SendGrid's verification steps
4. Update `MAIL_FROM_ADDRESS` environment variable with verified email

## Step 7: Monitor in Production

### Check Render Logs:

```bash
# View live logs from Render backend
curl https://api.render.com/v1/services/{service-id}/logs \
  -H "Authorization: Bearer {render-api-key}"
```

Or use Render Dashboard:
1. Go to your Backend service
2. Click **Logs** tab
3. Search for "password reset" or "SendGrid"

### SendGrid Stats:

SendGrid Dashboard → **Mail** → **Statistics**
- Total emails sent
- Delivery rate
- Bounce rate
- Spam reports

## Step 8: Backend Implementation Details

### Email Flow:

```
User clicks "Forgot Password"
    ↓
POST /auth/forgot-password with email
    ↓
PasswordResetService.sendPasswordResetEmail()
    - Generates unique reset token
    - Saves token with 30-min expiration
    - Creates reset link: https://frontend-url/reset-password?token=ABC123...
    ↓
sendEmail() (@Async - non-blocking)
    ↓
SendGridEmailService.sendEmail()
    - Builds JSON payload
    - POST to https://api.sendgrid.com/v3/mail/send
    - Logs success/failure
    ↓
User receives email with reset link
```

### Code Highlights:

**PasswordResetService - Token Generation:**
```java
public boolean sendPasswordResetEmail(String email) {
    Optional<RegisterEntity> userOpt = registerRepository.findByEmail(email);
    if (userOpt.isEmpty()) {
        // Security: Don't reveal if email exists
        return true;
    }
    
    RegisterEntity user = userOpt.get();
    String token = UUID.randomUUID().toString();
    long expirationTime = System.currentTimeMillis() + (tokenExpirationMinutes * 60 * 1000);
    
    PasswordResetToken resetToken = new PasswordResetToken(token, user, expirationTime);
    tokenRepository.save(resetToken);
    
    String resetLink = frontendUrl + "/reset-password?token=" + token;
    sendEmail(user.getEmail(), user.getFirstName(), resetLink);
    return true;
}
```

**SendGridEmailService - REST API Call:**
```java
private String buildSendGridRequest(String toEmail, String subject, String htmlContent) {
    return """
        {
          "personalizations": [{
            "to": [{"email": "%s"}],
            "subject": "%s"
          }],
          "from": {"email": "%s", "name": "Wildcats Lounge"},
          "content": [{"type": "text/html", "value": "%s"}]
        }
        """.formatted(escapeJson(toEmail), escapeJson(subject), 
                     escapeJson(fromEmail), escapeJson(htmlContent));
}
```

## Troubleshooting Checklist

- [ ] SendGrid API key is valid (starts with `SG.`)
- [ ] API key saved in Render environment variables
- [ ] `SENDGRID_API_KEY` environment variable set locally (if testing locally)
- [ ] Backend recompiled after environment changes: `mvn compile`
- [ ] Backend redeployed on Render after environment variable changes
- [ ] Email address format is valid
- [ ] No typos in email addresses
- [ ] SendGrid activity log shows email delivery attempt
- [ ] Check spam folder if email not in inbox
- [ ] Backend logs show "Email sent successfully" (not "Failed to send")

## Support

For SendGrid issues:
- SendGrid Documentation: https://docs.sendgrid.com/
- SendGrid Support: https://support.sendgrid.com

For local issues:
- Check backend `mvn` output for errors
- Check browser console for frontend errors
- Check Render logs for production issues
