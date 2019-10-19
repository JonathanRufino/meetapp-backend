import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SubscriptionController from './app/controllers/SubscriptionController';
import OrganizingController from './app/controllers/OrganizingController';

import authMiddleware from './app/middlewares/auth';
import polyglotMiddleware from './app/middlewares/polyglot';

import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.use(polyglotMiddleware);

/**
 * @swagger
 *
 * /users:
 *  post:
 *    name: Create User
 *    summary: Creates a new user
 *    tags:
 *      - Users
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: body
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *            password:
 *              type: string
 *              format: password
 *    responses:
 *      '201':
 *        description: User created
 *      '400':
 *        description: Invalid data
 *      '409':
 *        description: User already exists
 */
routes.post('/users', UserController.store);

/**
 * @swagger
 *
 * /sessions:
 *  post:
 *    name: Login
 *    summary: Authenticates user
 *    tags:
 *      - Auth
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: body
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            email:
 *              type: string
 *              format: email
 *            password:
 *              type: string
 *    responses:
 *      200:
 *        description: User authenticated
 *      400:
 *        description: Invalid data
 *      401:
 *        description: Wrong password
 *      404:
 *        description: User not found
 */
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

/**
 * @swagger
 *
 * /users:
 *  put:
 *    name: Update User
 *    summary: Updates an existing user
 *    tags:
 *      - Users
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: body
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *            oldPassword:
 *              type: string
 *            password:
 *              type: string
 *            confirmPassword:
 *              type: string
 *    responses:
 *      200:
 *        description: User updated
 *      400:
 *        description: Invalid data
 *      401:
 *        description: Password doesn't match
 *      409:
 *        description: Email already in use by another user
 */
routes.put('/users', UserController.update);

/**
 * @swagger
 *
 * /meetups:
 *  get:
 *    name: List Meetups
 *    summary: List all available meetups
 *    tags:
 *      - Meetups
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: OK
 */
routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);

routes.get('/organizing', OrganizingController.index);

routes.get('/subscriptions', SubscriptionController.index);
routes.delete('/subscriptions/:id', SubscriptionController.delete);

/**
 * @swagger
 *
 * /files:
 *  post:
 *    name: Image
 *    summary: Uploads an image
 *    tags:
 *      - Files
 *    produces:
 *      - application/json
 *    consumes:
 *      - multipart/form-data
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: formData
 *        name: file
 *        type: file
 *    responses:
 *      201:
 *        description: File uploaded
 */
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
