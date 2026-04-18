import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const rawKey = process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY;
const OPENROUTER_API_KEY =
    rawKey &&
        rawKey !== 'your_openrouter_api_key' &&
        !String(rawKey).trim().startsWith('AIza')
        ? String(rawKey).trim()
        : '';

const isConfigured =
    OPENROUTER_API_KEY.length > 0 && OPENROUTER_API_KEY.startsWith('sk-or-');

const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/embeddings';

/**
 * Generate a text embedding vector via OpenRouter.
 * Returns a 1536-dimensional float array.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!isConfigured) {
        throw new Error('OpenRouter API key is not configured for embeddings.');
    }

    const response = await axios.post(
        OPENROUTER_URL,
        {
            model: EMBEDDING_MODEL,
            input: text.trim().slice(0, 8000), // limit to ~8k chars
        },
        {
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
            validateStatus: () => true,
        }
    );

    if (response.status !== 200) {
        const msg =
            response.data?.error?.message ??
            response.data?.message ??
            `HTTP ${response.status}`;
        throw new Error(`Embedding API error: ${msg}`);
    }

    const embedding = response.data?.data?.[0]?.embedding;
    if (!Array.isArray(embedding)) {
        throw new Error('Invalid embedding response: missing data[0].embedding');
    }

    return embedding as number[];
}

/**
 * Compose a rich text string from post fields for embedding.
 */
export function composeEmbeddingText(post: {
    caption?: string;
    location?: string;
    type?: string;
}): string {
    const parts: string[] = [];
    if (post.type) parts.push(post.type);
    if (post.location && post.location !== 'Unknown') parts.push(`at ${post.location}`);
    if (parts.length > 0 && post.caption) parts.push('.');
    if (post.caption) parts.push(post.caption);
    return parts.join(' ').trim() || 'sunrise photo';
}

/**
 * Cosine similarity between two vectors. Returns a value between -1 and 1.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Check whether the embedding service is available.
 */
export function isEmbeddingConfigured(): boolean {
    return isConfigured;
}
