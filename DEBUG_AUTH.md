# Authentication Debug Guide

## Issue: Cannot login after signup

I've fixed several issues with the authentication flow:

### Changes Made:

1. **AuthContext.tsx** - Enhanced the `signIn` function to:
   - Explicitly fetch the profile after successful sign-in
   - Return user data for better state management

2. **sign-in.tsx** - Updated to:
   - Navigate to home (`/`) after successful sign-in
   - This triggers the splash screen routing logic

3. **index.tsx** - Improved routing logic:
   - Added fallback timer to wait for profile to load
   - Better handling of user vs profile state

### Possible Causes & Solutions:

#### 1. Email Confirmation Required
**Symptom:** User signs up but cannot login immediately

**Check:** In your Supabase dashboard:
- Go to Authentication → Settings
- Look for "Email Confirmations"
- If enabled, users must confirm email before logging in

**Solution:**
- Disable email confirmation for development
- OR check your email for confirmation link after signup

#### 2. Profile Not Created
**Symptom:** User exists in auth.users but not in profiles table

**Check Database:**
```sql
-- Check if profile exists
SELECT * FROM profiles WHERE id = 'your-user-id';

-- Check auth users
SELECT * FROM auth.users LIMIT 5;
```

**Solution:** The signup flow should create a profile automatically. If not, check RLS policies.

#### 3. RLS Policy Blocking
**Symptom:** User can authenticate but cannot read their profile

**Check:** Make sure this policy exists:
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

**Solution:** Run the migration file again if policies are missing.

### Testing Steps:

1. **Clear Browser Data:**
   - Clear cookies and local storage
   - Refresh the page

2. **Test Signup:**
   ```
   Email: test@example.com
   Password: test123456
   Name: Test User
   Type: Customer
   ```

3. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for any errors in Console tab
   - Check Network tab for failed API calls

4. **Test Login:**
   - Use the same credentials
   - Should redirect to customer home screen

### Quick Database Check:

Run this in Supabase SQL Editor:
```sql
-- See all profiles
SELECT id, user_type, full_name, created_at FROM profiles;

-- See auth users (will show if email is confirmed)
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### Manual Fix (if needed):

If you have a user in auth.users but no profile:

```sql
-- Replace 'user-id-here' with actual user ID from auth.users
INSERT INTO profiles (id, user_type, full_name)
VALUES ('user-id-here', 'customer', 'Your Name');
```

### Expected Flow:

1. User signs up → Profile created → Redirected to sign-in
2. User signs in → Session created → Profile loaded → Routed to customer/retailer/admin tabs
3. On page refresh → Session restored → Profile loaded → Routed to correct section

### Still Not Working?

Check these in order:

1. **Supabase Connection:**
   - Verify `.env` has correct SUPABASE_URL and ANON_KEY
   - Check Network tab for 401 or 403 errors

2. **Profile Creation:**
   - Add console.log in AuthContext signUp function
   - Check if profileError is returned

3. **Session Persistence:**
   - Check if session is stored in browser
   - Look in Application → Local Storage → supabase.auth.token

4. **RLS Policies:**
   - Temporarily disable RLS on profiles table to test:
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
   - If this fixes it, the policies need adjustment

### Contact Info:

If you're still stuck, provide:
- Browser console errors
- Network tab screenshot of failed requests
- Output of the database queries above
