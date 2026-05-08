const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const refreshToken = async () => {
  const refresh = localStorage.getItem("clientflow_refresh");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh?refresh_token=${refresh}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    localStorage.setItem("clientflow_token", data.access_token);
    localStorage.setItem("clientflow_refresh", data.refresh_token);
    return data.access_token;
  } catch {
    localStorage.removeItem("clientflow_token");
    localStorage.removeItem("clientflow_refresh");
    window.location.href = "/login";
    return null;
  }
};

export const fetcher = async (url: string) => {
  let token = localStorage.getItem("clientflow_token");
  let res = await fetch(`${API_URL}${url}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      res = await fetch(`${API_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    }
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'An error occurred while fetching the data.');
  }

  return res.json();
};

export const apiRequest = async (url: string, method: string = 'GET', body?: any) => {
  let token = localStorage.getItem("clientflow_token");
  let res = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      res = await fetch(`${API_URL}${url}`, {
        method,
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'An error occurred while making the request.');
  }

  return res.json();
};
