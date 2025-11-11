# Enter Key Submission UX Enhancement

**Date:** 2025-11-11
**Status:** Design Complete, Ready for Implementation

## Overview

Add Enter key submission support across all forms in the app using React Native's built-in keyboard handling for improved UX.

## Goals

- Enable Enter key to submit forms on web and native platforms
- Implement smart field navigation (Enter moves to next field, submits on last)
- Maintain platform conventions (native keyboard "Next"/"Done" buttons)
- Preserve standard multiline text field behavior

## Scope

### Forms to Update

1. **Login** (app/login.tsx) - 2 fields: email → password
2. **Signup** (app/signup.tsx) - 5 fields: first name → last initial → email → password → confirm password
3. **Onboarding** (app/onboarding.tsx) - 2 fields
4. **Tasks** (app/(tabs)/tasks.tsx) - Invite code field only (skip multiline completion notes)
5. **Profile** (app/(tabs)/profile.tsx) - Invite code + name edit fields

### Exclusions

- **Multiline text fields** (e.g., task completion notes) - Keep standard behavior (Enter = new line)

## Technical Approach

### Core Implementation Pattern

Use React Native's built-in props:

- `returnKeyType`: Controls keyboard button ("next" or "done")
- `onSubmitEditing`: Handler when return key is pressed
- `blurOnSubmit`: Controls keyboard dismissal behavior

### Example Implementation

```typescript
// Create refs for each field
const emailRef = useRef<TextInput>(null);
const passwordRef = useRef<TextInput>(null);

// Email field (intermediate)
<TextInput
  ref={emailRef}
  returnKeyType="next"
  onSubmitEditing={() => passwordRef.current?.focus()}
  blurOnSubmit={false}
  // ... existing props
/>

// Password field (last field)
<TextInput
  ref={passwordRef}
  returnKeyType="done"
  onSubmitEditing={handleLogin}
  blurOnSubmit={true}
  // ... existing props
/>
```

## Form-Specific Details

### 1. Login Form

- **Email field**: `returnKeyType="next"`, focuses password
- **Password field**: `returnKeyType="done"`, calls `handleLogin`

### 2. Signup Form

- **Navigation chain**: firstName → lastInitial → email → password → confirmPassword
- **First 4 fields**: `returnKeyType="next"`, focus next field
- **Confirm password**: `returnKeyType="done"`, calls `handleSignup`

### 3. Onboarding Form

- Examine actual field structure
- Apply same pattern: intermediate fields use "next", last field uses "done"

### 4. Tasks Form

- **Invite code field only**: `returnKeyType="done"`, submits
- **Completion notes**: NO CHANGE (multiline field, Enter = new line)

### 5. Profile Form

- **Invite code field**: `returnKeyType="done"`, calls `joinWithInviteCode`
- **Name edit fields**: Apply navigation pattern based on field structure

## Error Handling & Edge Cases

### Validation

- All existing validation logic remains unchanged
- Enter key triggers same validation as button clicks
- Invalid forms show same error messages

### Loading States

- Existing `editable={!loading}` props prevent Enter during submission
- No additional guards needed

### Edge Cases

1. **Disabled inputs**: Already handled by `editable` prop
2. **Google OAuth loading**: Inputs disabled via `editable={!loading && !googleLoading}`
3. **Rapid Enter presses**: Loading state prevents duplicate submissions
4. **Tab navigation**: Users can still tab between fields (web)

### Multiline Fields

- Keep `returnKeyType="default"` (or omit the prop)
- Enter creates new line (standard behavior)
- Submit via existing button only

## Benefits

- **Improved UX**: Familiar keyboard shortcuts across all forms
- **Platform-native**: Leverages React Native's built-in features
- **Minimal code**: No custom platform checks needed
- **Backward compatible**: Existing buttons still work

## Testing Plan

1. **Web**: Test Enter key on all forms
2. **iOS**: Test "Next"/"Done" keyboard buttons
3. **Android**: Test "Next"/"Done" keyboard buttons
4. **Validation**: Verify error messages still appear correctly
5. **Loading states**: Verify no double-submissions during loading

## Implementation Order

1. Login form (simplest, 2 fields)
2. Signup form (most complex, 5 fields)
3. Onboarding form
4. Profile invite code
5. Profile name edit
6. Tasks invite code (if applicable)
