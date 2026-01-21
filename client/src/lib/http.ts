/**
 * HTTP Client Wrapper for DealControl
 * Provides standardized fetch with request ID extraction and error normalization
 */

export interface ErrorEnvelope {
  error: string;
  code?: string;
  requestId: string;
  details?: Record<string, unknown>;
}

export interface HttpResponse<T> {
  data: T | null;
  error: ErrorEnvelope | null;
  requestId: string | null;
  status: number;
  ok: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Extract request ID from response headers
 */
function extractRequestId(headers: Headers): string | null {
  return headers.get('x-request-id');
}

/**
 * Normalize error response to ErrorEnvelope format
 */
function normalizeError(
  error: unknown,
  requestId: string | null,
  status: number
): ErrorEnvelope {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    return {
      error: (error as { error: string }).error,
      code: (error as { code?: string }).code,
      requestId: requestId || 'unknown',
      details: (error as { details?: Record<string, unknown> }).details,
    };
  }

  return {
    error: typeof error === 'string' ? error : `HTTP Error ${status}`,
    requestId: requestId || 'unknown',
  };
}

/**
 * Standard HTTP client with request ID tracking and error normalization
 */
export async function http<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<HttpResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session auth
  };

  try {
    const response = await fetch(url, config);
    const requestId = extractRequestId(response.headers);

    // Log for traceability (no PII)
    console.debug(`[HTTP] ${options.method || 'GET'} ${endpoint} -> ${response.status} [${requestId}]`);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: response.statusText };
      }

      return {
        data: null,
        error: normalizeError(errorBody, requestId, response.status),
        requestId,
        status: response.status,
        ok: false,
      };
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {
        data: null,
        error: null,
        requestId,
        status: response.status,
        ok: true,
      };
    }

    const data = await response.json();
    return {
      data,
      error: null,
      requestId,
      status: response.status,
      ok: true,
    };
  } catch (err) {
    // Network error or other fetch failure
    console.error(`[HTTP] Network error for ${endpoint}:`, err);
    return {
      data: null,
      error: {
        error: err instanceof Error ? err.message : 'Network error',
        code: 'NETWORK_ERROR',
        requestId: 'unknown',
      },
      requestId: null,
      status: 0,
      ok: false,
    };
  }
}

// Convenience methods
export const httpGet = <T>(endpoint: string, options?: RequestInit) =>
  http<T>(endpoint, { ...options, method: 'GET' });

export const httpPost = <T>(endpoint: string, body: unknown, options?: RequestInit) =>
  http<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });

export const httpPut = <T>(endpoint: string, body: unknown, options?: RequestInit) =>
  http<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });

export const httpPatch = <T>(endpoint: string, body: unknown, options?: RequestInit) =>
  http<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });

export const httpDelete = <T>(endpoint: string, options?: RequestInit) =>
  http<T>(endpoint, { ...options, method: 'DELETE' });

