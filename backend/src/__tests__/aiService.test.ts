process.env.OPENROUTER_API_KEY = 'sk-or-testkey';

import axios from 'axios';
import fs from 'fs/promises';

jest.mock('axios');
jest.mock('fs/promises');

// Import after setting env vars
const aiService = require('../services/aiService');

describe('aiService', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const mockedFs = fs as jest.Mocked<typeof fs>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('when API key is configured', () => {
        it('detectSunriseSunset should return sunrise', async () => {
            mockedFs.readFile.mockResolvedValueOnce(Buffer.from('test'));
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [{ message: { content: 'sunrise' } }] }
            });

            const result = await aiService.detectSunriseSunset('test.jpg');
            expect(result.type).toBe('sunrise');
            expect(result.description).toBe('sunrise');
            expect(mockedAxios.post).toHaveBeenCalled();
        });

        it('detectSunriseSunset should return sunset', async () => {
            mockedFs.readFile.mockResolvedValueOnce(Buffer.from('test'));
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [{ message: { content: 'This is a beautiful sunset.' } }] }
            });

            const result = await aiService.detectSunriseSunset('test.jpg');
            expect(result.type).toBe('sunset');
        });

        it('detectSunriseSunset should handle API errors', async () => {
            mockedFs.readFile.mockResolvedValueOnce(Buffer.from('test'));
            mockedAxios.post.mockResolvedValueOnce({
                status: 500,
                data: { error: { message: 'Internal Server Error' } }
            });

            const result = await aiService.detectSunriseSunset('test.jpg');
            expect(result.type).toBe('unknown');
        });

        it('detectSunriseSunset should catch network errors', async () => {
            mockedFs.readFile.mockResolvedValueOnce(Buffer.from('test'));
            mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

            const result = await aiService.detectSunriseSunset('test.jpg');
            expect(result.type).toBe('unknown');
            expect(result.description).toBe('AI detection failed.');
        });

        it('getRecommendations should return recommendations', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [{ message: { content: 'Here are some tips...' } }] }
            });

            const result = await aiService.getRecommendations('sunset');
            expect(result).toBe('Here are some tips...');
        });

        it('getRecommendations should handle error', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Error'));
            const result = await aiService.getRecommendations('sunset');
            expect(result).toBe('Unable to fetch recommendations at this time.');
        });

        it('getCaptionSuggestion should return a caption', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [{ message: { content: 'Beautiful sunset!' } }] }
            });

            const result = await aiService.getCaptionSuggestion({ type: 'sunset' });
            expect(result).toBe('Beautiful sunset!');
        });

        it('getCaptionSuggestion should handle rate limit', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('429 Too Many Requests'));

            const result = await aiService.getCaptionSuggestion({ type: 'sunset', location: 'Paris' });
            expect(result).toBe('AI suggestion is unavailable right now (rate limit or quota). Try again in a minute or write your own caption.');
        });

        it('getCaptionSuggestion should handle general error', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Unknown Error'));
            const result = await aiService.getCaptionSuggestion({ type: 'sunset' });
            expect(result).toBe('AI suggestion is unavailable right now (rate limit or quota). Try again in a minute or write your own caption.');
        });

        it('getCaptionSuggestionFromImage should return a caption', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [{ message: { content: 'Amazing photo.' } }] }
            });

            const result = await aiService.getCaptionSuggestionFromImage(Buffer.from('test'), 'image/jpeg', { location: 'London' });
            expect(result).toBe('Amazing photo.');
        });

        it('getCaptionSuggestionFromImage should catch error', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('500 Server Error'));

            const result = await aiService.getCaptionSuggestionFromImage(Buffer.from('test'), 'image/jpeg', {});
            expect(result).toBe('AI suggestion is unavailable right now (rate limit or quota). Try again in a minute or write your own caption.');
        });

        it('getCaptionSuggestionFromImage should catch general error', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Unknown Error'));
            const result = await aiService.getCaptionSuggestionFromImage(Buffer.from('test'), 'image/jpeg', {});
            expect(result).toBe('AI suggestion is unavailable right now (rate limit or quota). Try again in a minute or write your own caption.');
        });

        it('getAssistantReply should return a reply', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [{ message: { content: 'I can help with that.' } }] }
            });

            const result = await aiService.getAssistantReply([{ role: 'user', text: 'hello' }]);
            expect(result).toBe('I can help with that.');
        });

        it('getAssistantReply should handle error', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Rate limit'));

            const result = await aiService.getAssistantReply([{ role: 'user', text: 'hello' }]);
            expect(result).toBe('AI is temporarily unavailable. Please try again in a moment.');
        });

        it('getAssistantReply should handle general error', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Unknown Error'));
            const result = await aiService.getAssistantReply([{ role: 'user', text: 'hello' }]);
            expect(result).toBe('AI is temporarily unavailable. Please try again in a moment.');
        });

        it('openRouterChat should handle array content', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [{ message: { content: [{ text: 'Array text reply' }] } }] }
            });
            const result = await aiService.getRecommendations('test array');
            expect(result).toBe('Array text reply');
        });

        it('openRouterChat should handle missing choices[0].message.content', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200,
                data: { choices: [] }
            });
            const result = await aiService.getRecommendations('test missing');
            expect(result).toBe('Unable to fetch recommendations at this time.');
        });

        it('openRouterChat should handle non-200 with error message', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 400,
                data: { message: 'Bad Request Message' }
            });
            const result = await aiService.getRecommendations('test 400');
            expect(result).toBe('Unable to fetch recommendations at this time.');
        });
    });
});
