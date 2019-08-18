import request from 'supertest';

import app from '../../src/app';

import truncate from '../utils/truncate';
import factory from '../factories';

describe('User', () => {
  // Find out why jest is not being finished
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

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
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User already exists.');
  });
});
