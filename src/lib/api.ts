export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let isRefreshing = false;

const refreshToken = async () => {
  if (isRefreshing) return null;
  isRefreshing = true;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error();
    return true;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
};

export const fetcher = async (url: string) => {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  let res = await fetch(fullUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed === true) {
      res = await fetch(fullUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else if (refreshed === false) {
      // Refresh failed, redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'An error occurred while fetching the data.');
  }

  return res.json();
};

export const apiRequest = async (url: string, method: string = 'GET', body?: any) => {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  };

  let res = await fetch(fullUrl, options);

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed === true) {
      res = await fetch(fullUrl, options);
    } else if (refreshed === false) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'An error occurred while making the request.');
  }

  return res.json();
};
