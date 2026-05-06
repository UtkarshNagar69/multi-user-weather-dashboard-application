import { AuthResponse, DashboardResponse, AIChatResponse, ChatMessage, SmartInsights } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiFetch<{ user: { id: string; email: string } }>('/api/auth/me'),
};

export const dashboardApi = {
  getDashboard: () => apiFetch<DashboardResponse>('/api/dashboard'),

  addCity: (cityName: string) =>
    apiFetch<{ message: string; city: { cityName: string } }>('/api/dashboard/cities', {
      method: 'POST',
      body: JSON.stringify({ cityName }),
    }),

  toggleFavorite: (cityName: string) =>
    apiFetch<{ message: string; isFavorite: boolean }>(
      `/api/dashboard/cities/${encodeURIComponent(cityName)}/favorite`,
      { method: 'PATCH' }
    ),

  removeCity: (cityName: string) =>
    apiFetch<{ message: string }>(
      `/api/dashboard/cities/${encodeURIComponent(cityName)}`,
      { method: 'DELETE' }
    ),
};

export const aiApi = {
  chat: (message: string, history: ChatMessage[]) =>
    apiFetch<AIChatResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  getInsights: () =>
    apiFetch<{ insights: SmartInsights | null }>('/api/ai/insights'),
};

