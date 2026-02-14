// src/services/postService.ts
import { mockFeedData, type Photo } from '../data/mockFeed';

const PAGE_SIZE = 10;

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

export const getFeed = async (page: number): Promise<FeedPage> => {
  await new Promise((r) => setTimeout(r, 600));
  const store = getStore();
  const start = (page - 1) * PAGE_SIZE;
  const posts = store.slice(start, start + PAGE_SIZE);
  return {
    posts,
    hasMore: start + posts.length < store.length,
  };
};

export const getPostsByUserId = async (userId: string): Promise<Photo[]> => {
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
  date?: string;
  time?: string;
  type?: 'sunrise' | 'sunset';
  userId: string;
  userName: string;
  userAvatar: string;
}

export const createPost = async (payload: CreatePostPayload): Promise<Photo> => {
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
  await new Promise((r) => setTimeout(r, 500));
  const store = getStore();
  const idx = store.findIndex((p) => p.id === postId);
  if (idx === -1) throw new Error('Post not found');
  store[idx] = { ...store[idx], ...payload };
  return store[idx];
};

export const deletePost = async (postId: string): Promise<void> => {
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

export const getComments = async (postId: string): Promise<Comment[]> => {
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
