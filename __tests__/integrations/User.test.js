import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import faker from 'faker';

import app from '../../src/app';
import authConfig from '../../src/config/auth';

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

  it('should encrypt password when new user is created', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const compareHash = await bcrypt.compare('123456', user.password_hash);

    expect(compareHash).toBe(true);
  });

  it('should update user data', async () => {
    const user = await factory.attrs('User');

    const createResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = createResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const newName = faker.name.findName();
    const updatedUser = { ...createResponse.body, name: newName };

    const updateResponse = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(createResponse.body.name).not.toBe(updateResponse.body.name);
    expect(updateResponse.body.name).toBe(newName);
  });

  it('should update user data and password', async () => {
    const user = await factory.attrs('User');

    const createResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = createResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const newName = faker.name.findName();
    const newPasword = faker.internet.password();
    const updatedUser = {
      ...createResponse.body,
      name: newName,
      oldPassword: user.password,
      password: newPasword,
      confirmPassword: newPasword,
    };

    const updateResponse = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(createResponse.body.name).not.toBe(updateResponse.body.name);
    expect(updateResponse.body.name).toBe(newName);
  });

  it('should update user email', async () => {
    const user = await factory.attrs('User');

    const createResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = createResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const newEmail = faker.internet.email();
    const updatedUser = {
      ...createResponse.body,
      email: newEmail,
    };

    const updateResponse = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(createResponse.body.email).not.toBe(updateResponse.body.email);
    expect(updateResponse.body.email).toBe(newEmail);
  });

  it('should not update user with invalid data', async () => {
    const user = await factory.attrs('User');

    const createResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = createResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const updatedUser = {
      ...createResponse.body,
      oldPassword: '123',
    };

    const updateResponse = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.error).toBe('Validation failed.');
  });

  it('should not be able to update email to an email already in use', async () => {
    const user = await factory.attrs('User');
    const genericUser = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await request(app)
      .post('/users')
      .send(genericUser);

    const createResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = createResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const updatedUser = {
      ...createResponse.body,
      email: genericUser.email,
    };

    const updateResponse = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.error).toBe('User already exists.');
  });

  it('should not update if old password does not match', async () => {
    const user = await factory.attrs('User');

    const createResponse = await request(app)
      .post('/users')
      .send(user);

    const { id } = createResponse.body;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const newPasword = faker.internet.password();
    const updatedUser = {
      ...createResponse.body,
      oldPassword: faker.internet.password(),
      password: newPasword,
      confirmPassword: newPasword,
    };

    const updateResponse = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(updateResponse.status).toBe(401);
    expect(updateResponse.body.error).toBe('Password does not match.');
  });
});
