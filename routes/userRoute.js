import express from 'express';
import { createUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/users', createUser);

export default userRouter;