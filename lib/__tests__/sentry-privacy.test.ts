import { privacyBeforeSend, privacyBeforeBreadcrumb } from '../sentry-privacy';
import * as Sentry from '@sentry/react-native';

describe('privacyBeforeSend', () => {
  it('should strip message content from request data', () => {
    const event: Sentry.Event = {
      request: {
        data: {
          message: 'Sensitive recovery message',
          content: 'Task description',
          user_id: '123',
        },
      },
    };

    const scrubbed = privacyBeforeSend(event);

    expect(scrubbed?.request?.data?.message).toBe('[Filtered]');
    expect(scrubbed?.request?.data?.content).toBe('[Filtered]');
    expect(scrubbed?.request?.data?.user_id).toBe('123');
  });

  it('should redact email addresses from error messages', () => {
    const event: Sentry.Event = {
      message: 'Error for user test@example.com',
    };

    const scrubbed = privacyBeforeSend(event);

    expect(scrubbed?.message).toBe('Error for user [email]');
  });

  it('should preserve user ID but remove personal info', () => {
    const event: Sentry.Event = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        ip_address: '192.168.1.1',
      },
    };

    const scrubbed = privacyBeforeSend(event);

    expect(scrubbed?.user?.id).toBe('user-123');
    expect(scrubbed?.user?.email).toBeUndefined();
    expect(scrubbed?.user?.username).toBeUndefined();
    expect(scrubbed?.user?.ip_address).toBeUndefined();
  });

  it('should sanitize exception values', () => {
    const event: Sentry.Event = {
      exception: {
        values: [
          {
            type: 'Error',
            value: 'Failed to save message: "Help me stay sober"',
          },
        ],
      },
    };

    const scrubbed = privacyBeforeSend(event);

    expect(scrubbed?.exception?.values?.[0].value).not.toContain('Help me');
  });
});

describe('privacyBeforeBreadcrumb', () => {
  it('should filter Supabase query breadcrumbs', () => {
    const breadcrumb: Sentry.Breadcrumb = {
      category: 'http',
      data: {
        url: 'https://project.supabase.co/rest/v1/messages?select=*',
        method: 'GET',
        status_code: 200,
      },
    };

    const filtered = privacyBeforeBreadcrumb(breadcrumb);

    expect(filtered?.data?.table).toBe('messages');
    expect(filtered?.data?.method).toBe('GET');
    expect(filtered?.data?.status_code).toBe(200);
    expect(filtered?.data?.url).toBeUndefined();
  });

  it('should remove route params from navigation breadcrumbs', () => {
    const breadcrumb: Sentry.Breadcrumb = {
      category: 'navigation',
      data: {
        from: '/(tabs)/index',
        to: '/(tabs)/messages?user_id=123&message_id=456',
      },
    };

    const filtered = privacyBeforeBreadcrumb(breadcrumb);

    expect(filtered?.data?.to).toBe('/(tabs)/messages');
    expect(filtered?.data?.from).toBe('/(tabs)/index');
  });
});
