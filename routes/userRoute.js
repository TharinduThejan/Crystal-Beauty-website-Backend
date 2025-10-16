import express from 'express';
import { createUser, loginUser, loginwithGoogle, resetPassword, sendOTP } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post('/register', createUser);
userRouter.post('/login', loginUser);
userRouter.post('/login/google', loginwithGoogle);
userRouter.post('/send-otp', sendOTP);
userRouter.post('/reset-password', resetPassword);

export default userRouter;