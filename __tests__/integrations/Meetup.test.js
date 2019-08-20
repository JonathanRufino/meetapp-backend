import request from 'supertest';
import jwt from 'jsonwebtoken';
import path from 'path';
import faker from 'faker';

import app from '../../src/app';
import authConfig from '../../src/config/auth';

import truncate from '../utils/truncate';
import factory from '../factories';

describe('Meetup', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should create a meetup', async () => {
    const user = await factory.attrs('User');

    const userResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = userResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const file = path.resolve(__dirname, '..', 'upload.png');

    const fileResponse = await request(app)
      .post('/files')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', file);

    const meetup = await factory.attrs('Meetup', {
      banner_id: fileResponse.body.id,
    });

    const response = await request(app)
      .post('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send(meetup);

    expect(response.body).toHaveProperty('id');
  });

  it('should not create a meetup with an inexistent banner id', async () => {
    const user = await factory.attrs('User');

    const userResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = userResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const meetup = await factory.attrs('Meetup', {
      banner_id: faker.random.number(),
    });

    const response = await request(app)
      .post('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send(meetup);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid banner.');
  });

  it('should not create a meetup with invalid data', async () => {
    const user = await factory.attrs('User');

    const userResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = userResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const response = await request(app)
      .post('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed.');
  });

  it('should not create a meetup with past date', async () => {
    const user = await factory.attrs('User');

    const userResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = userResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const file = path.resolve(__dirname, '..', 'upload.png');

    const fileResponse = await request(app)
      .post('/files')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', file);

    const meetup = await factory.attrs('Meetup', {
      banner_id: fileResponse.body.id,
      date: faker.date.past(),
    });

    const response = await request(app)
      .post('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send(meetup);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Past dates are not allowed.');
  });

  it('should list all meetups', async () => {
    const user = await factory.attrs('User');

    const userResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = userResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const response = await request(app)
      .get('/meetups')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.body).toEqual(expect.arrayContaining([]));
  });

  it('should list only meetups after a given date', async () => {
    const user = await factory.attrs('User');

    const userResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = userResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const date = faker.date.soon;

    const response = await request(app)
      .get(`/meetups?date=${date}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.length).toBe(0);
  });
});
