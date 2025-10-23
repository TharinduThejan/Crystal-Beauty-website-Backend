import express from 'express';
import { deleteProduct, getProducts, saveProduct, updateProduct, getProductById, searchProducts, StripeCheckout } from '../controllers/productController.js';
import { get } from 'mongoose';

const productRouter = express.Router();
productRouter.post('/checkout', StripeCheckout);
productRouter.get('/search/:query', searchProducts);
productRouter.get('/', getProducts);
productRouter.post('/', saveProduct);
productRouter.delete('/:productId', deleteProduct);
productRouter.put('/:productId', updateProduct);
productRouter.get('/:productId', getProductById);

export default productRouter;