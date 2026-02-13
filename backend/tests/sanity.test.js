const request = require('supertest');
require('dotenv').config();
const app = require('../src/app');
const mongoose = require('mongoose');

describe('Sanity Check', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });
});

describe('Dynamic Form Routes', () => {
    // Basic test to ensure routes are registered
    it('GET /api/dynamic-submissions should return 401 without token', async () => {
        const res = await request(app).get('/api/dynamic-submissions');
        expect(res.statusCode).toBe(401);
    });
});
