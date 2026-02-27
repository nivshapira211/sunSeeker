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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let mongoServer;
let token;
let userId;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    yield mongoose_1.default.connect(uri);
    const res = yield (0, supertest_1.default)(app_1.default)
        .post('/api/auth/register')
        .field('username', 'postuser')
        .field('email', 'post@example.com')
        .field('password', 'password123');
    token = res.body.token;
    userId = res.body.user.id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongoServer.stop();
}));
describe('Post Endpoints', () => {
    it('should create a new post', () => __awaiter(void 0, void 0, void 0, function* () {
        const testImage = path_1.default.join(__dirname, 'test.jpg');
        fs_1.default.writeFileSync(testImage, 'fake data');
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .attach('image', testImage)
            .field('caption', 'Test post')
            .field('type', 'sunrise');
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('caption', 'Test post');
        fs_1.default.unlinkSync(testImage);
    }));
    it('should get all posts', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get('/api/posts');
        expect(res.statusCode).toEqual(200);
        expect(res.body.posts).toBeInstanceOf(Array);
        expect(res.body.posts.length).toBeGreaterThan(0);
    }));
});
