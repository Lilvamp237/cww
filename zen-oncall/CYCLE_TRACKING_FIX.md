# Cycle Tracking & Settings Fix Summary

## Issues Fixed

### 1. **Settings Page - Save Preferences Error**
**Problem:** The `savePreferences` function was spreading the entire preferences object including `id` field, which caused database conflicts.

**Solution:** Explicitly list only valid database columns when upserting:
- `user_id`, `feature_*` toggles, `theme`, `default_view`, `calendar_start_day`, `profile_visibility`
- Added better error messages showing actual error details
- Added proper user authentication checks

### 2. **Cycle Tracking Toggle Not Syncing**
**Problem:** The cycle tracking toggle in Settings page and Cycle page weren't synced properly.

**Solution:** 
- Settings page now updates BOTH `user_preferences.feature_cycle_tracking` AND `cycle_tracking.tracking_enabled`
- Cycle page fetches from BOTH tables to ensure consistency
- Toggle on cycle page updates both tables simultaneously

### 3. **Better Error Handling**
**Added:**
- Error messages now show the actual error from Supabase: `Failed to save preferences: {error.message}`
- Better console logging with descriptive labels
- User authentication checks before saving

## Testing Steps

1. **Refresh your browser** (Ctrl+Shift+R) to clear cache
2. **Open Browser Console** (F12) to see any errors
3. **Go to Settings** page
4. **Toggle Cycle Tracking** ON
5. **Click "Save Preferences"**
   - ✅ Should see green toast: "Preferences saved successfully!"
   - ❌ If error, you'll see: "Failed to save preferences: [actual error message]"
6. **Go to Cycle page** (`/cycle`)
   - Toggle should be ON
   - Should see form fields for cycle settings
7. **Toggle off/on from cycle page** - should work smoothly

## Common Issues & Solutions

### Issue: "Row level security policy violation"
**Cause:** RLS policies not allowing user to insert/update their preferences
**Solution:** Run this SQL in Supabase:
```sql
-- Allow users to insert/update their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cycle tracking" ON cycle_tracking
    FOR ALL USING (auth.uid() = user_id);
```

### Issue: "duplicate key value violates unique constraint"
**Cause:** Trying to insert when record already exists
**Solution:** The code now uses `upsert()` which handles this automatically

### Issue: "You must be logged in to save preferences"
**Cause:** User not authenticated
**Solution:** 
1. Check you're logged in
2. Check Supabase environment variables in `.env.local`
3. Verify auth session hasn't expired

## Files Modified

1. `src/app/(dashboard)/settings/page.tsx`
   - Fixed `savePreferences()` function
   - Fixed `saveNotificationPreferences()` function
   - Added error message display
   - Added cycle tracking sync

2. `src/app/(dashboard)/cycle/page.tsx`
   - Fixed `handleEnableTracking()` function
   - Fixed `fetchCycleTracking()` function
   - Now syncs with user_preferences table
   - Removed unused Calendar import

## Next Steps

If you still see errors:
1. **Copy the exact error message** from the toast or console
2. **Check the Browser Console** (F12) for detailed error logs
3. **Verify Supabase connection** - check `.env.local` has correct credentials
4. **Check RLS policies** - run the SQL above in Supabase SQL Editor

The error message will now tell you exactly what went wrong! 🎯
