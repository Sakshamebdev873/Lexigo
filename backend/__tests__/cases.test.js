"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe('POST /api/cases validation', () => {
    const app = (0, app_1.buildApp)();
    it('rejects missing required fields with 400', async () => {
        const res = await (0, supertest_1.default)(app).post('/api/cases').send({ caseTitle: 'ab' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation failed');
    });
});
