"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const aiService_1 = require("../services/aiService");
// Mock AI Service
jest.mock('../services/aiService', () => ({
    getRecommendations: jest.fn(),
    detectSunriseSunset: jest.fn(),
}));
let mongoServer;
let token;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    yield mongoose_1.default.connect(uri);
    // Register a user to get a token
    const res = yield (0, supertest_1.default)(app_1.default)
        .post('/api/auth/register')
        .field('username', 'recuser')
        .field('email', 'rec@example.com')
        .field('password', 'password123');
    token = res.body.token;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongoServer.stop();
}));
describe('Recommendation Endpoints', () => {
    it('should return a recommendation for a valid query', () => __awaiter(void 0, void 0, void 0, function* () {
        aiService_1.getRecommendations.mockResolvedValue('Go to the beach.');
        const res = yield (0, supertest_1.default)(app_1.default)
            .get('/api/recommendations?q=sunset')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('recommendation', 'Go to the beach.');
    }));
    it('should return 400 if query is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .get('/api/recommendations')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(400);
    }));
    it('should return 401 if unauthorized', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .get('/api/recommendations?q=sunset');
        expect(res.statusCode).toEqual(401);
    }));
});
