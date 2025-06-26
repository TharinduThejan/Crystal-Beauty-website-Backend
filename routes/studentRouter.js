import express from 'express';
import { getStudent, saveStudent } from '../controllers/studentController.js';

const studentRouter = express.Router();
studentRouter.get('/', getStudent);
studentRouter.post('/', saveStudent);
export default studentRouter;