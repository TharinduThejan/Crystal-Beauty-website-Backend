import Product from "../models/product.js";
import { isAdmin } from "./userController.js";
export async function getProducts(request, response) {
    // Product.find()
    //     .then((data) => {
    //         response.json(data);
    //     })
    //     .catch((error) => {
    //         response.status(500).json({ message: 'Error retrieving products', error });
    //     });
    try {
        if (isAdmin(request)) {
            const products = await Product.find();
            response.json(products);
        } else {
            const products = await Product.find({ isAvailable: true });
            response.json(products);
        }
    } catch (error) {
        response.status(500).json({ message: 'Error retrieving products', error });
    }
}
export function saveProduct(request, response) {
    if (!isAdmin(request)) {
        response.status(403).json({
            message: 'You are not authorized to add products'
        });
        return
    }

    console.log(request.user);
    console.log(request.body);

    const product = new Product(
        request.body
    );

    product.save()
        .then(() => {
            response.json({
                message: 'Product added successfully'
            });
        })
        .catch(() => {
            response.json({
                message: 'Error adding product'
            });
        });
}
export async function deleteProduct(request, response) {
    if (!isAdmin(request)) {
        response.status(403).json({
            message: 'You are not authorized to delete products'
        });
        return
    }
    try {
        await Product.deleteOne({ productId: request.params.productId })
        response.json({
            message: 'Product deleted successfully'
        })
    } catch (error) {
        response.status(500).json({
            message: 'Error deleting product',
            error: error
        });
    }
}