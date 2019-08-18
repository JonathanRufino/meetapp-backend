import request from 'supertest';
import faker from 'faker';

import app from '../../src/app';

import truncate from '../utils/truncate';
import factory from '../factories';

describe('Session', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('it should authenticate user', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      });

    expect(response.body).toHaveProperty('token');
  });

  it('it should not authenticate user with invalid credentials', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.name,
        password: user.password,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed.');
  });

  it('it should not authenticate user if not exists', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('User not found.');
  });

  it('it should not authenticate if password does not match', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: faker.internet.password(),
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Password does not match.');
  });
});
