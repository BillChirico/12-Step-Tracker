import * as Sentry from '@sentry/react-native';

/**
 * Sensitive fields that should be scrubbed from all events
 */
const SENSITIVE_FIELDS = [
  'message',
  'content',
  'description',
  'reflection',
  'sobriety_date',
  'relapse_date',
  'notes',
  'email',
  'phone',
  'name',
  'password',
  'token',
  'access_token',
  'refresh_token',
];

/**
 * Email regex for redaction
 */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * BeforeSend hook to scrub sensitive data from events
 */
export function privacyBeforeSend(event: Sentry.Event): Sentry.Event | null {
  // Strip sensitive request data
  if (event.request?.data) {
    event.request.data = sanitizeObject(event.request.data);
  }

  // Redact email addresses from error messages
  if (event.message) {
    event.message = event.message.replace(EMAIL_REGEX, '[email]');
  }

  // Sanitize exception values
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map(exception => ({
      ...exception,
      value: exception.value ? sanitizeString(exception.value) : exception.value,
    }));
  }

  // Remove sensitive user data, keep only ID
  if (event.user) {
    event.user = {
      id: event.user.id,
    };
  }

  return event;
}

/**
 * BeforeBreadcrumb hook to filter sensitive breadcrumbs
 */
export function privacyBeforeBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
  // Filter Supabase query breadcrumbs
  if (breadcrumb.category === 'http' && breadcrumb.data?.url?.includes('supabase')) {
    const table = extractTableName(breadcrumb.data.url);
    return {
      ...breadcrumb,
      data: {
        method: breadcrumb.data.method,
        table,
        status_code: breadcrumb.data.status_code,
      },
    };
  }

  // Filter navigation breadcrumbs with sensitive params
  if (breadcrumb.category === 'navigation' && breadcrumb.data) {
    return {
      ...breadcrumb,
      data: {
        from: breadcrumb.data.from,
        to: stripQueryParams(breadcrumb.data.to),
      },
    };
  }

  return breadcrumb;
}

/**
 * Recursively sanitize object by replacing sensitive fields with '[Filtered]'
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      sanitized[key] = '[Filtered]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize string by redacting emails and quoted content
 */
function sanitizeString(str: string): string {
  // Redact email addresses
  let sanitized = str.replace(EMAIL_REGEX, '[email]');

  // Redact quoted strings that might contain user content (10+ chars to avoid filtering short technical strings)
  sanitized = sanitized.replace(/"[^"]{10,}"/g, '"[Filtered]"');

  return sanitized;
}

/**
 * Extract table name from Supabase URL
 */
function extractTableName(url: string): string {
  const match = url.match(/\/rest\/v1\/([^?]+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Strip query parameters from URL or route
 */
function stripQueryParams(urlOrRoute: string): string {
  if (!urlOrRoute) return urlOrRoute;
  return urlOrRoute.split('?')[0];
}
