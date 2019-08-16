import request from 'supertest';

import app from '../../src/app';
import truncate from '../utils/truncate';

describe('User', () => {
  // Find out why jest is not being finished
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to register', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      });

    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with invalid data', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: '',
        email: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed.');
  });

  it('should not be able to register duplicated user', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      });

    const response = await request(app)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User already exists.');
  });
});
