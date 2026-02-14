// src/services/postService.ts
import { mockFeedData as mockFeed, type Photo as Post } from '../data/mockFeed';

/**
 * Simulates fetching all posts by a specific user.
 * In a real app, this would make an API call like `GET /api/users/{userId}/posts`.
 */
export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
    console.log(`Fetching posts for userId: ${userId}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find the user's name from any post authored by them in the mock data
    // This is a workaround because we don't have a separate user table in mocks
    const user = mockFeed.find((post: Post) => post.user.id === userId)?.user;

    if (!user) {
        // If the user is not found, return an empty array
        return [];
    }

    // Filter posts by the author's name (since our mock data is structured this way)
    const userPosts = mockFeed.filter((post: Post) => post.user.name === user.name);

    return userPosts;
};

/**
 * Simulates fetching a single post by its ID.
 */
export const getPostById = async (postId: string): Promise<Post | undefined> => {
    console.log(`Fetching post with id: ${postId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFeed.find((post: Post) => post.id === postId);
};
