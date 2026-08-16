export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  [key: string]: any;
}

export class ApiError extends Error {
  code: string;
  status: number;
  data?: any;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: options.credentials || 'include',
    });

    let resJson: any = {};
    try {
      resJson = await response.json();
    } catch {
      resJson = {};
    }

    if (!response.ok) {
      const errorMsg =
        resJson?.error?.message ||
        resJson?.error ||
        resJson?.message ||
        getDefaultErrorMessage(response.status);

      const errorCode = resJson?.error?.code || getErrorCode(response.status);
      throw new ApiError(errorMsg, errorCode, response.status, resJson);
    }

    return {
      success: true,
      data: resJson.data !== undefined ? resJson.data : resJson,
      ...resJson,
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || 'Network connection failed. Please check your internet.',
      'NETWORK_ERROR',
      0
    );
  }
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Bad request. Please check your submitted details.';
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return 'Access forbidden. You do not have permission.';
    case 404:
      return 'Requested resource could not be found.';
    case 429:
      return 'Too many requests. Please slow down and try again.';
    case 500:
    default:
      return 'Internal server error. Please try again later.';
  }
}

function getErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 429:
      return 'RATE_LIMITED';
    default:
      return 'SERVER_ERROR';
  }
}

export const api = {
  get: <T = any>(url: string, headers?: HeadersInit) =>
    request<T>(url, { method: 'GET', headers }),

  post: <T = any>(url: string, body?: any, headers?: HeadersInit) =>
    request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      headers,
    }),

  put: <T = any>(url: string, body?: any, headers?: HeadersInit) =>
    request<T>(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      headers,
    }),

  patch: <T = any>(url: string, body?: any, headers?: HeadersInit) =>
    request<T>(url, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      headers,
    }),

  delete: <T = any>(url: string, headers?: HeadersInit) =>
    request<T>(url, { method: 'DELETE', headers }),
};

export default api;
