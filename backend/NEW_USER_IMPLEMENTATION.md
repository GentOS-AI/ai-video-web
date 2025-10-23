# New User Implementation Guide

## Overview
This document describes how to implement the `is_new_user` flag functionality in the backend API.

## Requirements
1. When a new user generates their first video (successfully completes generation), set `is_new_user = False`
2. The frontend will display "Try for Free" button text when `is_new_user = True`
3. Backend should check `is_new_user` status when calling script generation API

## Database Schema

### User Model (`backend/app/models/user.py`)
✅ COMPLETED - Field already added:
```python
is_new_user = Column(Boolean, default=True)
```

✅ COMPLETED - Migration script executed:
- Script: `backend/scripts/add_is_new_user_field.py`
- Result: All existing users have been updated based on their video count

## Frontend Changes

### 1. User Interface (`lib/api/services.ts`)
✅ COMPLETED:
```typescript
export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar_url: string | null;
  credits: number;
  created_at: string;
  is_new_user: boolean;  // ← Added
  subscription_plan: 'free' | 'basic' | 'premium';
  subscription_status: 'active' | 'cancelled' | 'expired';
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}
```

### 2. Generate Button Text (`components/HeroSection.tsx`)
✅ COMPLETED:
```tsx
<span className="hidden sm:inline">
  {user?.is_new_user
    ? 'Try for Free'
    : (generationModes.find(m => m.id === selectedMode)?.buttonLabel || 'Generate')
  }
</span>
```

## Backend Implementation

### ✅ COMPLETED: Video Generation Completion Handler

**File modified**: `backend/app/tasks/video_generation.py` (lines 129-136)

**Implementation**:
```python
# 🎉 Update is_new_user flag on first successful video generation
from app.models.user import User
user = db.query(User).filter(User.id == video.user_id).first()
if user and user.is_new_user:
    user.is_new_user = False
    db.commit()
    print(f"✅ [Task {task_id}] User {user.id} ({user.email}) is no longer a new user")
    logger.publish(9, "🎉 First video completed! Welcome to AIVideo.DIY!")
```

**Location**: After video generation completes successfully and before returning the success result.

**Behavior**:
1. When a video generation task completes with status "completed"
2. The system checks if the user's `is_new_user` flag is `True`
3. If yes, sets it to `False` and commits the change
4. Logs the event and publishes a congratulations message via SSE
5. All subsequent video generations will not trigger this update (already `False`)

## Testing Steps

### 1. Create a New Test User
```bash
# Register a new user via Google OAuth
# Check database: user.is_new_user should be True
```

### 2. Test Frontend Button Text
```bash
# Frontend should show "Try for Free" button
# Check browser console for user object
```

### 3. Generate First Video
```bash
# Click "Try for Free" button
# Complete video generation
# Check database: user.is_new_user should now be False
```

### 4. Verify Button Text Changes
```bash
# Refresh page or check Auth context
# Button should now show "All-In-One Generate" instead of "Try for Free"
```

## Database Query Examples

### Check Current Status
```sql
SELECT id, email, is_new_user, created_at
FROM users
WHERE email = 'test@example.com';
```

### Manually Update for Testing
```sql
-- Reset user to new user state
UPDATE users SET is_new_user = 1 WHERE email = 'test@example.com';

-- Mark user as existing user
UPDATE users SET is_new_user = 0 WHERE email = 'test@example.com';
```

### Count New vs Existing Users
```sql
SELECT
  is_new_user,
  COUNT(*) as count
FROM users
GROUP BY is_new_user;
```

## Future Considerations

1. **Analytics**: Track conversion rate from new users to active users
2. **First Video Rewards**: Consider giving bonus credits for first successful generation
3. **Onboarding Flow**: Could add special UI for new users
4. **A/B Testing**: Test different button texts for new users

## Deployment Checklist

- [x] Database migration completed
- [x] Frontend User interface updated
- [x] Generate button text conditional logic added
- [x] Backend API updated to set is_new_user = False on first video
- [ ] Tested with new user account
- [ ] Verified button text changes after first generation
- [ ] Production deployment

## Notes

- The `is_new_user` flag is purely for UX purposes (button text)
- No subscription or credit logic changes needed
- Existing users were migrated based on video count (users with videos → is_new_user = False)
- New registrations will automatically have is_new_user = True (default value)
