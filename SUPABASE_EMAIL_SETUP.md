# Supabase Email Configuration Guide

## Overview
This guide will help you customize your Supabase confirmation emails to look professional and avoid spam folders.

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your ColdScale project

## Step 2: Configure Email Templates

1. Navigate to **Authentication** → **Email Templates** in the left sidebar
2. You'll see several email templates that can be customized:
   - Confirm signup
   - Magic Link
   - Change email address
   - Reset password

## Step 3: Customize the "Confirm Signup" Template

Click on **Confirm signup** and replace the default template with this professional version:

### Subject Line:
```
Welcome to ColdScale - Please confirm your email
```

### Email Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ColdScale</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            padding: 40px 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            background: linear-gradient(135deg, #14b8a6 0%, #f59e0b 100%);
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .confirm-button {
            display: inline-block;
            background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 25px 0;
            box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
        }
        .confirm-button:hover {
            background: linear-gradient(135deg, #0f766e 0%, #0e7490 100%);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">CS</div>
            <h1 style="margin: 0; color: #1f2937; font-size: 28px;">Welcome to ColdScale!</h1>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 16px;">Your AI-powered cold email platform</p>
        </div>
        
        <div style="text-align: center;">
            <p style="font-size: 16px; margin-bottom: 10px;">Hi there,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
                Thanks for signing up for ColdScale! To complete your registration and start creating 
                powerful cold email campaigns, please confirm your email address.
            </p>
            
            <a href="{{ .ConfirmationURL }}" class="confirm-button">
                Confirm Email Address
            </a>
            
            <div class="security-note">
                <strong>Security Note:</strong> This link will expire in 24 hours for your protection.
            </div>
            
            <p style="margin-top: 25px; font-size: 14px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #14b8a6; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>
                If you didn't create an account with ColdScale, you can safely ignore this email.
            </p>
            <p style="margin-top: 15px;">
                <strong>ColdScale Team</strong><br>
                The future of cold email automation
            </p>
        </div>
    </div>
</body>
</html>
```

## Step 4: Configure Email Settings

1. Go to **Authentication** → **Settings**
2. Scroll down to **SMTP Settings**
3. Configure your own SMTP server to avoid spam issues:

### Recommended SMTP Providers:
- **SendGrid** (free tier available)
- **Mailgun** (free tier available)  
- **Amazon SES** (very affordable)
- **Postmark** (great deliverability)

### SMTP Configuration Example (SendGrid):
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
```

## Step 5: Configure Sender Information

In the **SMTP Settings** section:

1. **Sender Name**: `ColdScale Team`
2. **Sender Email**: Use a professional email like `noreply@yourdomain.com`
3. **Reply-To**: Use a monitored email like `support@yourdomain.com`

## Step 6: Enable SPF, DKIM, and DMARC

To improve deliverability and avoid spam folders:

1. **SPF Record**: Add to your DNS
   ```
   TXT: v=spf1 include:sendgrid.net ~all
   ```

2. **DKIM**: Configure through your SMTP provider's dashboard

3. **DMARC**: Add to your DNS
   ```
   TXT: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

## Step 7: Test Your Setup

1. Create a test account with a personal email
2. Check if the email lands in inbox (not spam)
3. Verify the email looks professional and branded
4. Test the confirmation link works correctly

## Additional Tips to Avoid Spam

1. **Use a custom domain** instead of the default Supabase sender
2. **Warm up your sending domain** by sending emails gradually
3. **Monitor bounce rates** and remove invalid emails
4. **Include an unsubscribe link** (required by law)
5. **Use a professional email signature**
6. **Avoid spam trigger words** in subject lines
7. **Maintain good sender reputation**

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify SMTP configuration
- Check email provider's bounce/block lists

### Email Looks Unprofessional
- Ensure HTML template is applied correctly
- Test across different email clients
- Use email testing tools like Litmus or Email on Acid

### High Spam Rate
- Review sender reputation
- Check DNS records (SPF, DKIM, DMARC)
- Consider switching SMTP providers
- Reduce sending volume temporarily

---

**Note**: These changes may take a few minutes to propagate. Always test thoroughly before launching to production users. 