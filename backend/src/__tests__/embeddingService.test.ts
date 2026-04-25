process.env.OPENROUTER_API_KEY = 'sk-or-testkey';

import axios from 'axios';

jest.mock('axios');

// Import after setting env vars
const embeddingService = require('../services/embeddingService');

describe('embeddingService', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('utility functions', () => {
        it('composeEmbeddingText should compose correctly with all fields', () => {
            const result = embeddingService.composeEmbeddingText({
                caption: 'Beautiful view',
                location: 'Paris',
                type: 'sunset'
            });
            expect(result).toBe('sunset at Paris . Beautiful view');
        });

        it('composeEmbeddingText should handle missing fields', () => {
            const result = embeddingService.composeEmbeddingText({});
            expect(result).toBe('sunrise photo');
        });

        it('composeEmbeddingText should handle only type', () => {
            const result = embeddingService.composeEmbeddingText({ type: 'sunrise' });
            expect(result).toBe('sunrise');
        });

        it('cosineSimilarity should return 1 for identical vectors', () => {
            const result = embeddingService.cosineSimilarity([1, 0], [1, 0]);
            expect(result).toBe(1);
        });

        it('cosineSimilarity should return 0 for orthogonal vectors', () => {
            const result = embeddingService.cosineSimilarity([1, 0], [0, 1]);
            expect(result).toBe(0);
        });

        it('cosineSimilarity should return 0 if lengths mismatch', () => {
            const result = embeddingService.cosineSimilarity([1], [1, 0]);
            expect(result).toBe(0);
        });
    });

    describe('when API key is configured', () => {
        it('generateEmbedding should return vector', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { data: [{ embedding: [0.1, 0.2, 0.3] }] }
            });

            const result = await embeddingService.generateEmbedding('test');
            expect(result).toEqual([0.1, 0.2, 0.3]);
        });

        it('generateEmbedding should throw on non-200 status', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 500,
                data: { error: { message: 'Server error' } }
            });

            await expect(embeddingService.generateEmbedding('test')).rejects.toThrow('Embedding API error: Server error');
        });

        it('generateEmbedding should throw on missing embedding array', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { data: [{}] }
            });

            await expect(embeddingService.generateEmbedding('test')).rejects.toThrow('Invalid embedding response: missing data[0].embedding');
        });

        it('isEmbeddingConfigured should return true', () => {
            expect(embeddingService.isEmbeddingConfigured()).toBe(true);
        });
    });
});
