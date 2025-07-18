# Fixing Supabase Email Confirmation Redirect

## The Problem
When users click the confirmation link in the Supabase email, they're being redirected to `localhost` instead of your production site.

## Solution: Update Redirect URLs in Supabase Dashboard

### Step 1: Access Your Supabase Project Settings

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your ColdScale project
4. Click on **Settings** in the left sidebar
5. Click on **Authentication** under Settings

### Step 2: Update Site URL

In the **General** section:

1. Find **Site URL** field
2. Change from: `http://localhost:3000` 
3. Change to: `https://coldscale-platform.vercel.app` (or your actual domain)
4. Click **Save**

### Step 3: Update Redirect URLs

In the **URL Configuration** section:

1. Find **Redirect URLs** field
2. Remove any localhost entries like:
   - `http://localhost:3000`
   - `http://localhost:3000/**`
   
3. Add your production URLs:
   - `https://coldscale-platform.vercel.app`
   - `https://coldscale-platform.vercel.app/**`
   - `https://coldscale-platform.vercel.app/login`
   - `https://coldscale-platform.vercel.app/app`

4. If you have a custom domain, also add:
   - `https://yourdomain.com`
   - `https://yourdomain.com/**`

5. Click **Save**

### Step 4: Test the Fix

1. Create a new test account with a different email address
2. Check if the confirmation email now redirects to your production site
3. Verify the user can successfully sign in after confirmation

## Important Notes

- **Changes take effect immediately** - no need to redeploy your app
- **Keep both HTTP and HTTPS** if you're still testing (but prioritize HTTPS for production)
- **Use wildcards** (`**`) to allow all subpaths on your domain
- **Test thoroughly** after making changes

## Example Complete Configuration

### Site URL:
```
https://coldscale-platform.vercel.app
```

### Redirect URLs:
```
https://coldscale-platform.vercel.app,
https://coldscale-platform.vercel.app/**,
https://coldscale-platform.vercel.app/login,
https://coldscale-platform.vercel.app/app
```

## For Custom Domains

If you plan to use a custom domain later:

1. Add the custom domain to Vercel first
2. Then add it to Supabase redirect URLs:
   ```
   https://yourdomain.com,
   https://yourdomain.com/**
   ```

## Troubleshooting

### Still redirecting to localhost?
- Clear your browser cache
- Check if you have multiple Supabase projects
- Verify you're editing the correct project

### Users can't sign in after confirmation?
- Check that `/login` is in your redirect URLs
- Verify your app routing is working correctly
- Test with an incognito/private browser window

### Confirmation link shows an error?
- Check that your Site URL matches exactly
- Ensure HTTPS is used (not HTTP)
- Verify the link hasn't expired (24-hour default)

---

**After making these changes, new users will be redirected to your production site when confirming their email address!** 