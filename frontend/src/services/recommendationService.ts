import { request, hasApiBaseUrl } from './api';

const AUTH_TOKEN_KEY = 'authToken';

function getStoredToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
}

/**
 * Fetch AI-generated caption suggestion for a post.
 * If image is provided, uses AI vision to suggest a caption based on the photo; otherwise uses location/type only.
 */
export const getCaptionSuggestion = async (params?: {
  location?: string;
  type?: 'sunrise' | 'sunset';
  image?: File | null;
}): Promise<string> => {
  if (!hasApiBaseUrl()) {
    return 'Golden hour magic.';
  }

  const token = getStoredToken();
  const path = '/recommendations/caption';

  let data: { suggestion: string };
  if (params?.image) {
    const formData = new FormData();
    formData.append('image', params.image);
    if (params.location?.trim()) formData.append('location', params.location.trim());
    if (params.type) formData.append('type', params.type);
    data = await request<{ suggestion: string }>(path, { method: 'POST', body: formData, token, headers: {} });
  } else {
    const searchParams = new URLSearchParams();
    if (params?.location?.trim()) searchParams.set('location', params.location.trim());
    if (params?.type) searchParams.set('type', params.type);
    const query = searchParams.toString();
    data = await request<{ suggestion: string }>(`${path}${query ? `?${query}` : ''}`, { token });
  }
  return data.suggestion ?? '';
};

/**
 * Send conversation to assistant; returns the AI reply. Strictly for sunrise/sunset recommendations.
 */
export const sendAssistantMessage = async (
  messages: Array<{ role: 'user' | 'assistant'; text: string }>
): Promise<string> => {
  if (!hasApiBaseUrl()) {
    return "I can only help with sunrise and sunset recommendations. Ask me for a spot or best time to see the sun.";
  }

  const token = getStoredToken();
  const data = await request<{ reply: string }>('/recommendations/chat', {
    method: 'POST',
    body: { messages },
    token,
  });
  return data.reply ?? '';
};
