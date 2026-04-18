// src/services/postService.ts
import { request, hasApiBaseUrl, getUploadsBaseUrl, ApiError } from './api';
import { mockFeedData, type Photo } from '../data/mockFeed';

const AUTH_TOKEN_KEY = 'authToken';

function getStoredToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
}

const PAGE_SIZE = 10;

/** Backend post shape (GET /posts). */
interface ApiPost {
  _id: string;
  imageUrl?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  time?: string;
  date?: string;
  caption?: string;
  user?: { _id: string; username?: string; avatar?: string };
  likes?: unknown[];
  commentCount?: number;
  type?: 'sunrise' | 'sunset';
  exif?: { camera?: string; lens?: string; aperture?: string; iso?: string; shutter?: string };
}

function mapApiPostToPhoto(post: ApiPost, currentUserId?: string | null): Photo {
  const user = post.user;
  const rawImageUrl = post.imageUrl ?? '';
  const imageUrl =
    !rawImageUrl
      ? ''
      : rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')
        ? rawImageUrl
        : getUploadsBaseUrl()
          ? getUploadsBaseUrl() + (rawImageUrl.startsWith('/') ? rawImageUrl : '/' + rawImageUrl)
          : rawImageUrl;
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const liked = Boolean(
    currentUserId && likesArray.some((id: unknown) => (id as { toString?: () => string })?.toString?.() === currentUserId)
  );
  return {
    id: post._id,
    imageUrl,
    location: post.location ?? 'Unknown',
    coordinates: post.coordinates ?? { lat: 0, lng: 0 },
    time: post.time ?? '',
    date: post.date ?? '',
    caption: post.caption,
    user: {
      id: user?._id ?? '',
      name: user?.username ?? 'Unknown',
      avatar: user?.avatar ?? '',
    },
    likes: likesArray.length,
    comments: post.commentCount ?? 0,
    liked,
    type: post.type === 'sunset' ? 'sunset' : 'sunrise',
    exif: {
      camera: post.exif?.camera ?? 'Unknown',
      lens: post.exif?.lens ?? '',
      aperture: post.exif?.aperture ?? '',
      iso: post.exif?.iso ?? '',
      shutter: post.exif?.shutter ?? '',
    },
  };
}

/** In-memory store for mock; clone so we can mutate (create/update/delete). */
function getStore(): Photo[] {
  const key = '__sunseeker_feed_store__';
  const g = typeof window !== 'undefined' ? window : globalThis;
  const gAny = g as Record<string, unknown>;
  if (!gAny[key]) {
    gAny[key] = JSON.parse(JSON.stringify(mockFeedData)) as Photo[];
  }
  return gAny[key] as Photo[];
}

export interface FeedPage {
  posts: Photo[];
  hasMore: boolean;
}

export const getFeed = async (page: number, currentUserId?: string | null): Promise<FeedPage> => {
  if (hasApiBaseUrl()) {
    const data = await request<{ posts: ApiPost[]; hasMore: boolean }>(
      `/posts?page=${page}&limit=${PAGE_SIZE}`
    );
    return {
      posts: (data.posts ?? []).map((p) => mapApiPostToPhoto(p, currentUserId)),
      hasMore: data.hasMore ?? false,
    };
  }
  return { posts: [], hasMore: false };
};

export const semanticSearch = async (query: string, currentUserId?: string | null): Promise<Photo[]> => {
  if (!hasApiBaseUrl()) return [];
  const data = await request<{ posts: ApiPost[]; totalCount: number }>(
    `/posts/semantic-search?q=${encodeURIComponent(query)}&limit=20`
  );
  return (data.posts ?? []).map((p) => mapApiPostToPhoto(p, currentUserId));
};

export const getPostsByUserId = async (userId: string, currentUserId?: string | null): Promise<Photo[]> => {
  if (hasApiBaseUrl()) {
    const data = await request<{ posts: ApiPost[]; totalCount?: number; hasMore?: boolean }>(
      `/posts/user/${userId}?page=1&limit=${PAGE_SIZE}`
    );
    return (data.posts ?? []).map((p) => mapApiPostToPhoto(p, currentUserId));
  }
  await new Promise((r) => setTimeout(r, 800));
  const store = getStore();
  return store.filter((p) => p.user.id === userId);
};

export const getPostById = async (postId: string): Promise<Photo | undefined> => {
  await new Promise((r) => setTimeout(r, 500));
  return getStore().find((p) => p.id === postId);
};

export interface CreatePostPayload {
  text: string;
  image: File | string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  date?: string;
  time?: string;
  type?: 'sunrise' | 'sunset';
  userId: string;
  userName: string;
  userAvatar: string;
}

export const createPost = async (payload: CreatePostPayload): Promise<Photo> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    if (!token) throw new Error('Please log in to create a post.');

    const formData = new FormData();
    formData.append('caption', payload.text);
    formData.append('location', payload.location ?? 'Unknown');
    formData.append('date', payload.date ?? new Date().toLocaleDateString());
    formData.append('time', payload.time ?? '00:00');
    formData.append('type', payload.type ?? 'sunrise');
    formData.append('coordinates', JSON.stringify(payload.coordinates ?? { lat: 0, lng: 0 }));
    formData.append('exif', JSON.stringify({ camera: 'Unknown', lens: '', aperture: '', iso: '', shutter: '' }));

    if (typeof payload.image === 'string') {
      throw new Error('File upload required when using the API.');
    }
    formData.append('image', payload.image);

    try {
      const data = await request<ApiPost>('/posts', {
        method: 'POST',
        body: formData,
        token,
      });
      return mapApiPostToPhoto(data, undefined);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create post. Please try again.';
      throw new Error(message);
    }
  }

  await new Promise((r) => setTimeout(r, 800));
  const store = getStore();
  const imageUrl =
    typeof payload.image === 'string'
      ? payload.image
      : URL.createObjectURL(payload.image);
  const newPost: Photo = {
    id: `post-${Date.now()}`,
    imageUrl,
    location: payload.location ?? 'Unknown',
    coordinates: { lat: 0, lng: 0 },
    time: payload.time ?? '00:00',
    date: payload.date ?? new Date().toLocaleDateString(),
    caption: payload.text,
    user: {
      id: payload.userId,
      name: payload.userName,
      avatar: payload.userAvatar,
    },
    likes: 0,
    comments: 0,
    type: payload.type ?? 'sunrise',
    exif: {
      camera: 'Unknown',
      lens: '',
      aperture: '',
      iso: '',
      shutter: '',
    },
  };
  store.unshift(newPost);
  return newPost;
};

export interface UpdatePostPayload {
  caption?: string;
  image?: File;
  imageUrl?: string;
  location?: string;
  date?: string;
  time?: string;
  type?: 'sunrise' | 'sunset';
}

export const updatePost = async (
  postId: string,
  payload: UpdatePostPayload
): Promise<Photo> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    if (!token) throw new Error('Please log in to edit posts.');
    const formData = new FormData();
    formData.append('caption', payload.caption ?? '');
    if (payload.image) {
      formData.append('image', payload.image);
    }
    try {
      const data = await request<ApiPost>(`/posts/${postId}`, {
        method: 'PUT',
        body: formData,
        token,
      });
      return mapApiPostToPhoto(data, undefined);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update post. Please try again.';
      throw new Error(message);
    }
  }
  await new Promise((r) => setTimeout(r, 500));
  const store = getStore();
  const idx = store.findIndex((p) => p.id === postId);
  if (idx === -1) throw new Error('Post not found');
  const updated = { ...store[idx], ...payload };
  if (payload.image) {
    updated.imageUrl = URL.createObjectURL(payload.image);
  }
  store[idx] = updated;
  return store[idx];
};

export const deletePost = async (postId: string): Promise<void> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    if (!token) throw new Error('Please log in to delete posts.');
    await request(`/posts/${postId}`, {
      method: 'DELETE',
      token,
    });
    return;
  }
  await new Promise((r) => setTimeout(r, 400));
  const store = getStore();
  const idx = store.findIndex((p) => p.id === postId);
  if (idx === -1) throw new Error('Post not found');
  store.splice(idx, 1);
};

/** In-memory liked set for mock (postId -> true if liked by "current user") */
const likedSet = new Set<string>();

export interface ToggleLikeResult {
  likes: number;
  liked: boolean;
}

export const toggleLike = async (postId: string): Promise<ToggleLikeResult> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    if (!token) throw new Error('Please log in to like posts.');
    const data = await request<{ likes: number; liked: boolean }>(`/posts/${postId}/like`, {
      method: 'POST',
      token,
    });
    return { likes: data.likes, liked: data.liked };
  }
  await new Promise((r) => setTimeout(r, 300));
  const store = getStore();
  const post = store.find((p) => p.id === postId);
  if (!post) throw new Error('Post not found');
  const wasLiked = likedSet.has(postId);
  if (wasLiked) {
    likedSet.delete(postId);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    likedSet.add(postId);
    post.likes += 1;
  }
  return { likes: post.likes, liked: !wasLiked };
};

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

const commentsByPost = new Map<string, Comment[]>();

function getCommentsStore(postId: string): Comment[] {
  if (!commentsByPost.has(postId)) {
    commentsByPost.set(postId, []);
  }
  return commentsByPost.get(postId)!;
}

/** Backend comment shape (GET /posts/:id/comments). */
interface ApiComment {
  _id: string;
  postId: string;
  userId: { _id: string; username?: string; avatar?: string };
  text: string;
  createdAt?: string;
}

function mapApiCommentToComment(c: ApiComment): Comment {
  const userId = typeof c.userId === 'object' && c.userId !== null ? c.userId : { _id: '', username: '', avatar: '' };
  return {
    id: c._id,
    postId: c.postId,
    userId: userId._id,
    userName: userId.username ?? 'Unknown',
    userAvatar: userId.avatar,
    text: c.text,
    createdAt: c.createdAt ?? new Date().toISOString(),
  };
}

export const getComments = async (postId: string): Promise<Comment[]> => {
  if (hasApiBaseUrl()) {
    const list = await request<ApiComment[]>(`/posts/${postId}/comments`);
    return (list ?? []).map(mapApiCommentToComment);
  }
  await new Promise((r) => setTimeout(r, 400));
  return [...getCommentsStore(postId)];
};

export const addComment = async (
  postId: string,
  text: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<Comment> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    if (!token) throw new Error('Please log in to comment.');
    const data = await request<ApiComment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: { text },
      token,
    });
    return mapApiCommentToComment(data);
  }
  await new Promise((r) => setTimeout(r, 400));
  const list = getCommentsStore(postId);
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    postId,
    userId,
    userName,
    userAvatar,
    text,
    createdAt: new Date().toISOString(),
  };
  list.push(comment);
  const post = getStore().find((p) => p.id === postId);
  if (post) post.comments = list.length;
  return comment;
};

export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  if (hasApiBaseUrl()) {
    const token = getStoredToken();
    if (!token) throw new Error('Please log in to delete comments.');
    await request(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      token,
    });
    return;
  }
  await new Promise((r) => setTimeout(r, 300));
  const list = getCommentsStore(postId);
  const idx = list.findIndex((c) => c.id === commentId);
  if (idx !== -1) {
    list.splice(idx, 1);
    const post = getStore().find((p) => p.id === postId);
    if (post) post.comments = list.length;
  }
};
