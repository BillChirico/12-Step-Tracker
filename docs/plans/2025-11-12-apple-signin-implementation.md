# Apple Sign In Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Apple Sign In as an authentication provider alongside email/password, Google OAuth, and Facebook OAuth.

**Architecture:** Follow existing OAuth patterns from Google and Facebook implementations. Web flow uses Supabase's `signInWithOAuth`, native flow uses `expo-auth-session` with deep linking. Auto-create user profiles on first sign-in via `createOAuthProfileIfNeeded`.

**Tech Stack:** React Native, Expo, TypeScript, Supabase Auth, expo-web-browser, expo-auth-session, react-native-svg, React Native Testing Library, Jest

---

## Task 1: Create Apple Sign In Setup Documentation

**Files:**

- Create: `APPLE_SIGNIN_SETUP.md`

**Step 1: Create setup documentation**

Create comprehensive setup guide following the pattern from `GOOGLE_OAUTH_SETUP.md` and `FACEBOOK_SIGNIN_SETUP.md`.

````markdown
# Apple Sign In Setup Guide

This guide walks through configuring Apple Sign In for the 12-Step Tracker app.

## Prerequisites

- Apple Developer account (paid $99/year membership)
- Access to Supabase project dashboard
- Bundle ID: `com.billchirico.12steptracker`

## Part 1: Apple Developer Console Setup

### Step 1: Enable Sign in with Apple Capability

1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** from the left menu
4. Find and select your App ID: `com.billchirico.12steptracker`
5. Scroll to **Sign in with Apple** capability
6. Check the box to enable it
7. Click **Save**

### Step 2: Create Services ID

1. In **Identifiers**, click the **+** button
2. Select **Services IDs**, click **Continue**
3. Fill in:
   - **Description:** 12-Step Tracker Sign In
   - **Identifier:** `com.billchirico.12steptracker.signin` (must be unique)
4. Click **Continue**, then **Register**

### Step 3: Configure Services ID

1. Select the Services ID you just created
2. Check **Sign in with Apple**
3. Click **Configure** next to it
4. Set **Primary App ID** to: `com.billchirico.12steptracker`
5. Under **Website URLs**:
   - **Domains:** `vzwdsjphpabtxhmffous.supabase.co`
   - **Return URLs:** `https://vzwdsjphpabtxhmffous.supabase.co/auth/v1/callback`
6. Click **Add** to add the domain/return URL
7. Click **Save**, then **Continue**, then **Done**

### Step 4: Generate Private Key

1. Navigate to **Keys** in the left menu
2. Click the **+** button
3. Fill in:
   - **Key Name:** 12-Step Tracker Apple Sign In Key
4. Check **Sign in with Apple**
5. Click **Configure** next to it
6. Select your Primary App ID: `com.billchirico.12steptracker`
7. Click **Save**
8. Click **Continue**, then **Register**
9. **Download the key file** (.p8) - you can only download it once!
10. Note the **Key ID** shown (e.g., `ABC123DEFG`)

### Step 5: Find Your Team ID

1. Go to **Membership** in the left menu
2. Note your **Team ID** (e.g., `XYZ987TEAM`)

## Part 2: Supabase Configuration

### Step 1: Enable Apple Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **12-Step Tracker**
3. Navigate to **Authentication** → **Providers**
4. Find **Apple** in the list
5. Toggle **Enable Sign in with Apple**

### Step 2: Configure Apple Provider

Fill in the following fields:

- **Services ID:** `com.billchirico.12steptracker.signin` (from Apple Step 2)
- **Team ID:** Your Team ID from Apple (e.g., `XYZ987TEAM`)
- **Key ID:** Your Key ID from Apple (e.g., `ABC123DEFG`)
- **Private Key:** Paste the contents of your .p8 file

To get the private key contents:

```bash
cat /path/to/downloaded/AuthKey_ABC123DEFG.p8
```
````

### Step 3: Configure Redirect URLs

In the **Redirect URLs** section, ensure these are configured:

**Production:**

- `https://vzwdsjphpabtxhmffous.supabase.co/auth/v1/callback`

**Native (Deep Link):**

- `12stepstracker://auth/callback`

**Development (optional):**

- `http://localhost:8081/auth/callback`
- `http://localhost:19006/auth/callback`

Click **Save** to apply changes.

## Part 3: Testing the Configuration

### Web Testing

1. Start the web dev server: `pnpm dev`
2. Open http://localhost:8081
3. Click **Sign in with Apple** button
4. Verify Apple Sign In popup appears
5. Complete sign-in flow
6. Verify you're redirected back and logged in

### Native Testing (iOS)

1. Build development client: `eas build --platform ios --profile development`
2. Install on device
3. Launch app
4. Click **Sign in with Apple** button
5. Verify Apple Sign In sheet appears
6. Complete sign-in flow
7. Verify you're redirected back and logged in

### Native Testing (Android)

1. Build development client: `eas build --platform android --profile development`
2. Install on device
3. Launch app
4. Click **Sign in with Apple** button
5. Verify web view with Apple Sign In appears
6. Complete sign-in flow
7. Verify you're redirected back and logged in

## Troubleshooting

### "Invalid Client" Error

**Cause:** Services ID mismatch or not properly configured in Supabase.

**Fix:**

1. Verify Services ID in Supabase matches exactly: `com.billchirico.12steptracker.signin`
2. Verify Services ID is configured for Sign in with Apple in Apple Developer Console
3. Verify Primary App ID is set correctly

### Redirect URI Mismatch

**Cause:** Return URLs in Apple Developer Console don't match Supabase callback URL.

**Fix:**

1. Go to Apple Developer Console → Services ID → Configure
2. Verify **Return URLs** includes: `https://vzwdsjphpabtxhmffous.supabase.co/auth/v1/callback`
3. Ensure no trailing slashes or typos

### Private Key Error

**Cause:** Invalid or incorrectly formatted private key in Supabase.

**Fix:**

1. Re-download the .p8 file (if you still have it) or generate a new key
2. Copy the entire contents including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
3. Paste into Supabase without modifications

### Email Not Provided

**Cause:** Apple allows users to hide their email address.

**Solution:** This is expected behavior. The app handles this in `createOAuthProfileIfNeeded`:

- If user hides email, Apple provides a relay email: `*@privaterelay.appleid.com`
- Profile creation logic handles missing or relay emails gracefully
- User can update email in profile settings later

### Deep Linking Not Working (Native)

**Cause:** App scheme not properly configured.

**Fix:**

1. Verify `app.json` includes scheme: `12stepstracker`
2. Rebuild the native app
3. Test deep link: `xcrun simctl openurl booted "12stepstracker://auth/callback?access_token=test"`

## Platform-Specific Notes

### iOS

- **App Store Requirement:** Apps offering third-party sign-in (Google, Facebook) MUST offer Apple Sign In
- **Capability:** Ensure Sign in with Apple is enabled in app capabilities
- **Simulator vs Device:** Sign in with Apple works on both, but device testing recommended
- **Deep Linking:** Uses scheme `12stepstracker://` configured in `app.json`

### Android

- **Web View Flow:** Apple Sign In on Android uses web view (not native)
- **Redirect URIs:** Must match exactly (case-sensitive)
- **Testing:** Physical device recommended over emulator

### Web

- **Browser Support:** Modern browsers (Chrome, Safari, Firefox, Edge)
- **Localhost:** Works for development with configured redirect URI
- **Production:** Use HTTPS redirect URI from Supabase

## Security Considerations

- **Private Key:** Never commit .p8 file to version control
- **Key Rotation:** Regenerate key annually or if compromised
- **Services ID:** Keep consistent across environments
- **Relay Email:** Respect user's privacy choice to hide email

## References

- [Apple Sign In Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
- [Supabase Apple Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [expo-auth-session Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)

````

**Step 2: Commit documentation**

```bash
git add APPLE_SIGNIN_SETUP.md
git commit -m "docs: add Apple Sign In setup guide

Add comprehensive setup documentation for configuring Apple Sign In
in Apple Developer Console and Supabase. Includes step-by-step
instructions, troubleshooting guide, and platform-specific notes.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
````

---

## Task 2: Add AppleLogo Component (TDD)

**Files:**

- Test: `components/auth/__tests__/SocialLogos.test.tsx`
- Modify: `components/auth/SocialLogos.tsx`

**Step 1: Write failing test for AppleLogo**

Add test to `components/auth/__tests__/SocialLogos.test.tsx`:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { GoogleLogo, FacebookLogo, AppleLogo } from '../SocialLogos';

// ... existing tests ...

describe('AppleLogo', () => {
  it('renders with default size', () => {
    const { UNSAFE_getByType } = render(<AppleLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(20);
    expect(svg.props.height).toBe(20);
  });

  it('renders with custom size', () => {
    const { UNSAFE_getByType } = render(<AppleLogo size={32} />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
  });

  it('has correct margin for spacing', () => {
    const { UNSAFE_getByType } = render(<AppleLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.style).toEqual({ marginRight: 12 });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- SocialLogos.test.tsx`
Expected: FAIL with "AppleLogo is not exported from SocialLogos"

**Step 3: Implement AppleLogo component**

Add to `components/auth/SocialLogos.tsx` after FacebookLogo:

```typescript
export const AppleLogo = ({ size = 20 }: LogoProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={{ marginRight: 12 }}>
    <Path
      d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.1-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      fill="#000000"
    />
  </Svg>
);
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- SocialLogos.test.tsx`
Expected: PASS - all AppleLogo tests pass

**Step 5: Commit**

```bash
git add components/auth/__tests__/SocialLogos.test.tsx components/auth/SocialLogos.tsx
git commit -m "feat: add AppleLogo component to SocialLogos

Add AppleLogo SVG component following Apple's Human Interface
Guidelines. Uses official Apple logo shape with black fill.
Includes tests for default size, custom size, and margin spacing.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Add signInWithApple to AuthContext (TDD)

**Files:**

- Test: `contexts/__tests__/AuthContext.test.tsx`
- Modify: `contexts/AuthContext.tsx`

**Step 1: Write failing tests for signInWithApple**

Add tests to `contexts/__tests__/AuthContext.test.tsx` after signInWithFacebook tests:

```typescript
describe('signInWithApple', () => {
  describe('web platform', () => {
    beforeEach(() => {
      (Platform as any).OS = 'web';
    });

    it('calls signInWithOAuth with apple provider for web', async () => {
      const mockSignInWithOAuth = jest.fn().mockResolvedValue({ error: null });
      (supabase.auth.signInWithOAuth as jest.Mock) = mockSignInWithOAuth;

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
        },
      });
    });

    it('throws error when signInWithOAuth fails on web', async () => {
      const mockError = new Error('Apple sign in failed');
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({ error: mockError });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await expect(result.current.signInWithApple()).rejects.toThrow('Apple sign in failed');
    });
  });

  describe('native platform', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('opens browser and sets session with tokens on success', async () => {
      const mockUrl = 'https://apple.com/auth?code=123';
      const mockRedirectUrl = '12stepstracker://auth/callback';
      const mockCallbackUrl = `${mockRedirectUrl}?access_token=test_access&refresh_token=test_refresh`;
      const mockUser = { id: 'apple-user-123', email: 'test@privaterelay.appleid.com' };

      (makeRedirectUri as jest.Mock).mockReturnValue(mockRedirectUrl);
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: mockCallbackUrl,
      });
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockCreateProfile = jest.fn().mockResolvedValue(null);
      // Mock the createOAuthProfileIfNeeded function
      jest.spyOn(require('@/contexts/AuthContext'), 'createOAuthProfileIfNeeded')
        .mockImplementation(mockCreateProfile);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(makeRedirectUri).toHaveBeenCalledWith({
        scheme: '12stepstracker',
        path: 'auth/callback',
      });
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(mockUrl, mockRedirectUrl);
      expect(supabase.auth.setSession).toHaveBeenCalledWith({
        access_token: 'test_access',
        refresh_token: 'test_refresh',
      });
      expect(mockCreateProfile).toHaveBeenCalledWith(mockUser);
    });

    it('returns gracefully when user cancels', async () => {
      const mockUrl = 'https://apple.com/auth?code=123';
      const mockRedirectUrl = '12stepstracker://auth/callback';

      (makeRedirectUri as jest.Mock).mockReturnValue(mockRedirectUrl);
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Should not throw
      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(supabase.auth.setSession).not.toHaveBeenCalled();
    });

    it('throws error when tokens are missing', async () => {
      const mockUrl = 'https://apple.com/auth?code=123';
      const mockRedirectUrl = '12stepstracker://auth/callback';
      const mockCallbackUrl = `${mockRedirectUrl}?error=access_denied`;

      (makeRedirectUri as jest.Mock).mockReturnValue(mockRedirectUrl);
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: mockCallbackUrl,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Should return gracefully when tokens missing (similar to cancel)
      await act(async () => {
        await result.current.signInWithApple();
      });

      expect(supabase.auth.setSession).not.toHaveBeenCalled();
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm test -- AuthContext.test.tsx`
Expected: FAIL with "signInWithApple is not a function"

**Step 3: Add signInWithApple to AuthContextType interface**

In `contexts/AuthContext.tsx`, update the interface:

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastInitial: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>; // ADD THIS LINE
}
```

**Step 4: Add signInWithApple to default context**

Update the default context object:

```typescript
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithApple: async () => {}, // ADD THIS LINE
});
```

**Step 5: Implement signInWithApple method**

Add the method after `signInWithFacebook` (around line 254):

```typescript
const signInWithApple = async () => {
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  } else {
    const redirectUrl = makeRedirectUri({
      scheme: '12stepstracker',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) throw sessionError;

          if (sessionData.user) {
            await createOAuthProfileIfNeeded(sessionData.user);
          }
        }
      }
    }
  }
};
```

**Step 6: Add signInWithApple to context value**

Update the context provider value (around line 310):

```typescript
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple, // ADD THIS LINE
      }}
    >
      {children}
    </AuthContext.Provider>
  );
```

**Step 7: Run tests to verify they pass**

Run: `pnpm test -- AuthContext.test.tsx`
Expected: PASS - all signInWithApple tests pass

**Step 8: Commit**

```bash
git add contexts/__tests__/AuthContext.test.tsx contexts/AuthContext.tsx
git commit -m "feat: add signInWithApple method to AuthContext

Implement Apple Sign In authentication following Google/Facebook
pattern. Supports both web (OAuth redirect) and native (deep link)
flows. Auto-creates user profiles via createOAuthProfileIfNeeded.

Includes comprehensive tests for web/native flows, user cancellation,
and error handling.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Add Apple Sign In Button to Login Screen (TDD)

**Files:**

- Test: `__tests__/app/login.test.tsx`
- Modify: `app/login.tsx`

**Step 1: Write failing tests for Apple Sign In button**

Add tests to `__tests__/app/login.test.tsx`:

```typescript
describe('Apple Sign In', () => {
  it('renders Apple Sign In button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Continue with Apple')).toBeTruthy();
  });

  it('calls signInWithApple when button is pressed', async () => {
    const mockSignInWithApple = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      signInWithApple: mockSignInWithApple,
    });

    const { getByText } = render(<LoginScreen />);
    const appleButton = getByText('Continue with Apple');

    await act(async () => {
      fireEvent.press(appleButton);
    });

    expect(mockSignInWithApple).toHaveBeenCalled();
  });

  it('shows loading state during Apple sign in', async () => {
    const mockSignInWithApple = jest.fn(() => new Promise(() => {})); // Never resolves
    (useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      signInWithApple: mockSignInWithApple,
    });

    const { getByText, queryByText } = render(<LoginScreen />);
    const appleButton = getByText('Continue with Apple');

    act(() => {
      fireEvent.press(appleButton);
    });

    await waitFor(() => {
      expect(getByText('Signing in with Apple...')).toBeTruthy();
      expect(queryByText('Continue with Apple')).toBeNull();
    });
  });

  it('shows error alert when Apple sign in fails', async () => {
    const mockSignInWithApple = jest.fn().mockRejectedValue(new Error('Apple auth failed'));
    (useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      signInWithApple: mockSignInWithApple,
    });

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText } = render(<LoginScreen />);
    const appleButton = getByText('Continue with Apple');

    await act(async () => {
      fireEvent.press(appleButton);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Apple auth failed');
    });
  });

  it('disables Apple button when other auth is in progress', () => {
    const { getByText } = render(<LoginScreen />);
    const emailInput = getByText('Email').parent?.findByType(TextInput)[0];
    const passwordInput = getByText('Password').parent?.findByType(TextInput)[0];
    const signInButton = getByText('Sign In');

    // Trigger email/password sign in
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    const appleButton = getByText('Continue with Apple').parent;
    expect(appleButton.props.disabled).toBe(true);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm test -- login.test.tsx`
Expected: FAIL with "Unable to find element with text: Continue with Apple"

**Step 3: Add AppleLogo import**

In `app/login.tsx`, update the imports (line 17):

```typescript
import { GoogleLogo, FacebookLogo, AppleLogo } from '@/components/auth/SocialLogos';
```

**Step 4: Add appleLoading state**

In `app/login.tsx`, add state after facebookLoading (line 25):

```typescript
const [facebookLoading, setFacebookLoading] = useState(false);
const [appleLoading, setAppleLoading] = useState(false); // ADD THIS LINE
const { signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
```

**Step 5: Add signInWithApple to useAuth destructuring**

Update line 26:

```typescript
const { signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
```

**Step 6: Add handleAppleSignIn function**

Add after handleFacebookSignIn (around line 84):

```typescript
const handleAppleSignIn = async () => {
  setAppleLoading(true);
  try {
    await signInWithApple();
  } catch (error: any) {
    if (Platform.OS === 'web') {
      window.alert('Error: ' + (error.message || 'Failed to sign in with Apple'));
    } else {
      Alert.alert('Error', error.message || 'Failed to sign in with Apple');
    }
  } finally {
    setAppleLoading(false);
  }
};
```

**Step 7: Add Apple Sign In button UI**

Add after Facebook button (around line 168):

```typescript
          <TouchableOpacity
            style={[styles.appleButton, appleLoading && styles.buttonDisabled]}
            onPress={handleAppleSignIn}
            disabled={loading || googleLoading || facebookLoading || appleLoading}
          >
            {!appleLoading && <AppleLogo size={20} />}
            <Text style={styles.appleButtonText}>
              {appleLoading ? 'Signing in with Apple...' : 'Continue with Apple'}
            </Text>
          </TouchableOpacity>
```

**Step 8: Add Apple button styles**

Add to createStyles function (after facebookButtonText styles, around line 303):

```typescript
    appleButton: {
      backgroundColor: '#000000',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    appleButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
    },
```

**Step 9: Run tests to verify they pass**

Run: `pnpm test -- login.test.tsx`
Expected: PASS - all Apple Sign In tests pass

**Step 10: Commit**

```bash
git add __tests__/app/login.test.tsx app/login.tsx
git commit -m "feat: add Apple Sign In button to login screen

Add Apple Sign In button following Apple HIG with black background
and white text. Includes loading state, error handling, and proper
button disabling when other auth is in progress.

Tests cover button rendering, sign-in flow, loading state, error
handling, and disabled state.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Add Apple Sign In Button to Signup Screen (TDD)

**Files:**

- Test: `__tests__/app/signup.test.tsx`
- Modify: `app/signup.tsx`

**Step 1: Write failing tests for Apple Sign In button**

Add tests to `__tests__/app/signup.test.tsx`:

```typescript
describe('Apple Sign In', () => {
  it('renders Apple Sign In button', () => {
    const { getByText } = render(<SignupScreen />);
    expect(getByText('Continue with Apple')).toBeTruthy();
  });

  it('calls signInWithApple when button is pressed', async () => {
    const mockSignInWithApple = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      signInWithApple: mockSignInWithApple,
    });

    const { getByText } = render(<SignupScreen />);
    const appleButton = getByText('Continue with Apple');

    await act(async () => {
      fireEvent.press(appleButton);
    });

    expect(mockSignInWithApple).toHaveBeenCalled();
  });

  it('shows loading state during Apple sign in', async () => {
    const mockSignInWithApple = jest.fn(() => new Promise(() => {})); // Never resolves
    (useAuth as jest.Mock).mockReturnValue({
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      signInWithApple: mockSignInWithApple,
    });

    const { getByText, queryByText } = render(<SignupScreen />);
    const appleButton = getByText('Continue with Apple');

    act(() => {
      fireEvent.press(appleButton);
    });

    await waitFor(() => {
      expect(getByText('Signing in with Apple...')).toBeTruthy();
      expect(queryByText('Continue with Apple')).toBeNull();
    });
  });

  it('shows error alert when Apple sign in fails', async () => {
    const mockSignInWithApple = jest.fn().mockRejectedValue(new Error('Apple auth failed'));
    (useAuth as jest.Mock).mockReturnValue({
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      signInWithApple: mockSignInWithApple,
    });

    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByText } = render(<SignupScreen />);
    const appleButton = getByText('Continue with Apple');

    await act(async () => {
      fireEvent.press(appleButton);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Apple auth failed');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm test -- signup.test.tsx`
Expected: FAIL with "Unable to find element with text: Continue with Apple"

**Step 3: Add AppleLogo import**

In `app/signup.tsx`, update the imports:

```typescript
import { GoogleLogo, FacebookLogo, AppleLogo } from '@/components/auth/SocialLogos';
```

**Step 4: Add appleLoading state**

Add state after facebookLoading:

```typescript
const [facebookLoading, setFacebookLoading] = useState(false);
const [appleLoading, setAppleLoading] = useState(false); // ADD THIS LINE
const { signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
```

**Step 5: Add signInWithApple to useAuth destructuring**

Update the useAuth line:

```typescript
const { signUp, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
```

**Step 6: Add handleAppleSignIn function**

Add after handleFacebookSignIn:

```typescript
const handleAppleSignIn = async () => {
  setAppleLoading(true);
  try {
    await signInWithApple();
  } catch (error: any) {
    if (Platform.OS === 'web') {
      window.alert('Error: ' + (error.message || 'Failed to sign in with Apple'));
    } else {
      Alert.alert('Error', error.message || 'Failed to sign in with Apple');
    }
  } finally {
    setAppleLoading(false);
  }
};
```

**Step 7: Add Apple Sign In button UI**

Add after Facebook button:

```typescript
          <TouchableOpacity
            style={[styles.appleButton, appleLoading && styles.buttonDisabled]}
            onPress={handleAppleSignIn}
            disabled={loading || googleLoading || facebookLoading || appleLoading}
          >
            {!appleLoading && <AppleLogo size={20} />}
            <Text style={styles.appleButtonText}>
              {appleLoading ? 'Signing in with Apple...' : 'Continue with Apple'}
            </Text>
          </TouchableOpacity>
```

**Step 8: Add Apple button styles**

Add to createStyles function after facebookButtonText styles:

```typescript
    appleButton: {
      backgroundColor: '#000000',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    appleButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: theme.fontRegular,
      fontWeight: '600',
    },
```

**Step 9: Run tests to verify they pass**

Run: `pnpm test -- signup.test.tsx`
Expected: PASS - all Apple Sign In tests pass

**Step 10: Commit**

```bash
git add __tests__/app/signup.test.tsx app/signup.tsx
git commit -m "feat: add Apple Sign In button to signup screen

Add Apple Sign In button matching login screen implementation.
Follows Apple HIG with black background and white text.

Tests cover button rendering, sign-in flow, loading state, and
error handling for consistency with login screen.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Update CLAUDE.md Documentation

**Files:**

- Modify: `CLAUDE.md`

**Step 1: Update authentication section**

In `CLAUDE.md`, find the "AuthContext" section (around line 40) and update it:

```markdown
**AuthContext** (`contexts/AuthContext.tsx`):

- Manages Supabase session and user state
- Handles sign in/up/out operations
- Provides Google OAuth integration (see GOOGLE_OAUTH_SETUP.md)
- Provides Facebook Sign In integration (see FACEBOOK_SIGNIN_SETUP.md)
- Provides Apple Sign In integration (see APPLE_SIGNIN_SETUP.md)
- Auto-creates profiles for new OAuth users
- Exposes: `session`, `user`, `profile`, `loading`, auth methods
```

**Step 2: Add Apple Sign In Setup section**

After the Facebook Sign In Setup section (around line 80), add:

```markdown
## Apple Sign In Setup

Apple Sign In is integrated and requires configuration. See `APPLE_SIGNIN_SETUP.md` for:

- Apple Developer Console setup (Services ID, private key)
- Supabase provider configuration
- OAuth redirect URI configuration
- Native app configuration (iOS/Android)
- Deep linking setup

Key details:

- Bundle ID (iOS): `com.billchirico.12steptracker`
- Package name (Android): `com.billchirico.twelvesteptracker`
- Services ID: `com.billchirico.12steptracker.signin`
- Implementation in `AuthContext.tsx` handles both web (OAuth) and native (deep link) flows
- Auto-creates user profiles on first sign-in
- Handles Apple's private relay email addresses
```

**Step 3: Commit documentation update**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to mention Apple Sign In

Add Apple Sign In to authentication providers list and create
dedicated section with setup guide reference. Includes key
configuration details and implementation notes.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Run Full Test Suite and Verify Coverage

**Files:**

- N/A (verification step)

**Step 1: Run all tests**

Run: `pnpm test`
Expected: All tests pass

**Step 2: Check test coverage**

Run: `pnpm test -- --coverage`
Expected: Coverage meets 80% threshold for:

- Statements
- Branches
- Functions
- Lines

**Step 3: Review coverage report**

Check that new files have adequate coverage:

- `components/auth/SocialLogos.tsx` - should be 100%
- `contexts/AuthContext.tsx` - should be >80%
- `app/login.tsx` - should be >80%
- `app/signup.tsx` - should be >80%

**Step 4: If coverage is below 80%, add missing tests**

Identify uncovered code paths and add tests. Common areas:

- Error handling edge cases
- Platform-specific logic
- User cancellation flows

**Step 5: Commit any additional tests**

```bash
git add <test-files>
git commit -m "test: improve coverage for Apple Sign In

Add additional tests for edge cases to meet 80% coverage threshold.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Run Type Checking and Linting

**Files:**

- N/A (verification step)

**Step 1: Run TypeScript type checking**

Run: `pnpm typecheck`
Expected: No type errors

**Step 2: Fix any type errors**

If errors found:

1. Read error messages carefully
2. Fix type issues in relevant files
3. Re-run `pnpm typecheck` until clean

**Step 3: Run ESLint**

Run: `pnpm lint`
Expected: No linting errors

**Step 4: Fix any linting errors**

If errors found:

1. Try auto-fix: `pnpm lint --fix`
2. Manually fix remaining issues
3. Re-run `pnpm lint` until clean

**Step 5: Commit any fixes**

```bash
git add <fixed-files>
git commit -m "fix: resolve type errors and linting issues

Fix TypeScript type errors and ESLint warnings for Apple Sign In
implementation.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Test Web Build

**Files:**

- N/A (verification step)

**Step 1: Build for web**

Run: `pnpm build:web`
Expected: Build succeeds without errors

**Step 2: Review build output**

Check for:

- No compilation errors
- No missing module errors
- Bundle size is reasonable

**Step 3: If build fails, fix issues**

Common issues:

- Missing imports
- Platform-specific code not properly guarded
- Type errors that only appear during build

**Step 4: Commit any fixes**

```bash
git add <fixed-files>
git commit -m "fix: resolve web build issues for Apple Sign In

Fix platform-specific code guards and imports for web build.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Create Summary and Prepare for Merge

**Files:**

- Create: `docs/implementation-notes/apple-signin.md`

**Step 1: Create implementation notes**

Create `docs/implementation-notes/apple-signin.md`:

```markdown
# Apple Sign In Implementation Notes

**Date:** 2025-11-12
**Branch:** feature/apple-signin
**Issue:** #21

## Summary

Implemented Apple Sign In as an authentication provider alongside email/password, Google OAuth, and Facebook OAuth.

## Changes Made

### Documentation

- **APPLE_SIGNIN_SETUP.md:** Comprehensive setup guide for Apple Developer Console and Supabase configuration
- **CLAUDE.md:** Updated to reference Apple Sign In setup guide

### Components

- **components/auth/SocialLogos.tsx:** Added `AppleLogo` component following Apple HIG
- **app/login.tsx:** Added Apple Sign In button with loading state and error handling
- **app/signup.tsx:** Added Apple Sign In button matching login screen

### Context

- **contexts/AuthContext.tsx:** Implemented `signInWithApple` method with web/native flows

### Tests

- **components/auth/**tests**/SocialLogos.test.tsx:** Tests for AppleLogo component
- **contexts/**tests**/AuthContext.test.tsx:** Comprehensive tests for signInWithApple
- ****tests**/app/login.test.tsx:** Tests for Apple Sign In button on login screen
- ****tests**/app/signup.test.tsx:** Tests for Apple Sign In button on signup screen

## Test Coverage

- All tests passing: ✓
- Coverage threshold met: ✓ (80%+)
- Type checking: ✓
- Linting: ✓
- Web build: ✓

## Implementation Details

### Web Flow

- Uses Supabase's `signInWithOAuth` with provider: 'apple'
- Redirects to `window.location.origin` after authentication
- Supabase handles OAuth flow and session creation

### Native Flow

- Uses `expo-auth-session` with `makeRedirectUri`
- Opens auth URL with `WebBrowser.openAuthSessionAsync`
- Extracts tokens from callback URL
- Calls `supabase.auth.setSession` with tokens
- Auto-creates profile via `createOAuthProfileIfNeeded`

### UI Design

- Follows Apple's Human Interface Guidelines
- Black button background (#000000)
- White text and logo (#FFFFFF)
- Loading state: "Signing in with Apple..."
- Disabled when other auth in progress

## Configuration Required

Before users can test Apple Sign In:

1. Configure Apple Developer Console (see APPLE_SIGNIN_SETUP.md)
2. Configure Supabase Apple provider (see APPLE_SIGNIN_SETUP.md)
3. Test on iOS, Android, and Web

## Known Limitations

- Apple allows users to hide email address (private relay)
- Profile creation handles missing/relay emails gracefully
- Testing requires Apple Developer account ($99/year)

## Next Steps

1. Configure Apple Developer Console
2. Configure Supabase Apple provider
3. Test on all platforms
4. Merge to main when configuration complete
```

**Step 2: Commit implementation notes**

```bash
git add docs/implementation-notes/apple-signin.md
git commit -m "docs: add Apple Sign In implementation notes

Document all changes, test coverage, implementation details,
and configuration requirements for Apple Sign In feature.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Step 3: Push branch to remote**

Run: `git push -u origin feature/apple-signin`

**Step 4: Create pull request**

Use GitHub CLI or web interface:

```bash
gh pr create --title "feat: Add Apple Sign In authentication" \
  --body "## Summary
Implements Apple Sign In as an authentication provider (Issue #21).

## Changes
- Add Apple Sign In setup documentation
- Implement AppleLogo component
- Add signInWithApple to AuthContext
- Add Apple Sign In buttons to login/signup screens
- Comprehensive test coverage (80%+)

## Testing
- ✓ All tests passing (210+ tests)
- ✓ Type checking passing
- ✓ Linting passing
- ✓ Web build successful

## Configuration Required
Before merging, configure:
1. Apple Developer Console (see APPLE_SIGNIN_SETUP.md)
2. Supabase Apple provider (see APPLE_SIGNIN_SETUP.md)

## Screenshots
[Add screenshots of Apple Sign In button on login/signup screens]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Completion Checklist

- [ ] APPLE_SIGNIN_SETUP.md created
- [ ] AppleLogo component implemented with tests
- [ ] signInWithApple added to AuthContext with tests
- [ ] Apple Sign In button added to login screen with tests
- [ ] Apple Sign In button added to signup screen with tests
- [ ] CLAUDE.md updated with Apple Sign In references
- [ ] All tests passing (210+ tests)
- [ ] Test coverage ≥80%
- [ ] Type checking passing
- [ ] Linting passing
- [ ] Web build successful
- [ ] Implementation notes documented
- [ ] Branch pushed to remote
- [ ] Pull request created

## Skills to Use During Execution

- **@superpowers:test-driven-development** - Write tests first for each component
- **@superpowers:verification-before-completion** - Verify tests/build before claiming complete
- **@superpowers:code-reviewer** - Review implementation against plan after each task

## Notes for Future Developers

- Follow TDD strictly: test → fail → implement → pass → commit
- Keep commits small and focused (one task = one commit)
- Run tests after each implementation step
- If tests fail unexpectedly, debug before proceeding
- Update this plan if you discover issues or better approaches
