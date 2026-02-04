# DISABLED: Welcome Email Edge Function

**Disabled on:** 2025-01-09

**Reason:** This Edge Function was causing duplicate welcome emails. App-level sending in App.js is now used instead.

**To restore:**
1. Rename this directory back to `send-welcome-email`
2. Deploy to Supabase: `supabase functions deploy send-welcome-email`
3. Make sure to disable app-level welcome emails in App.js to prevent duplicates

**Original functionality:**
- Called by database trigger `send_welcome_email_for_oauth`
- Made HTTP requests to `/api/send-welcome-email` 
- Was one of 3 sources causing duplicate emails