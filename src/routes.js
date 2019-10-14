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
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);

routes.get('/organizing', OrganizingController.index);

routes.get('/subscriptions', SubscriptionController.index);
routes.delete('/subscriptions/:id', SubscriptionController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
