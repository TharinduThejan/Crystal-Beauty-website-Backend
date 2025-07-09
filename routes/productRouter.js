import express from 'express';
import { deleteProduct, getProducts, saveProduct, updateProduct, getProductById } from '../controllers/productController.js';
import { get } from 'mongoose';

const productRouter = express.Router();

productRouter.get('/', getProducts);
productRouter.post('/', saveProduct);
productRouter.delete('/:productId', deleteProduct);
productRouter.put('/:productId', updateProduct);
productRouter.get('/:productId', getProductById);

export default productRouter;