import { request, response } from "express";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";
import dotenv from 'dotenv';
import Stripe from 'stripe';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
export async function updateProduct(request, response) {
    if (!isAdmin(request)) {
        response.status(403).json({
            message: 'You are not authorized to update products'
        });
        return
    }
    const productId = request.params.productId;
    const updateData = request.body;

    try {
        await Product.updateOne(
            { productId: productId },
            updateData);
        response.json({
            message: 'Product updated successfully'
        });
    } catch (error) {
        response.status(500).json({
            message: 'Internal server error',
            error: error
        });
    }

}
export async function getProductById(request, response) {
    const productId = request.params.productId;

    try {
        const product = await Product.findOne(
            { productId: productId }
        )
        // If product is not found, return null
        if (product == null) {
            response.status(404).json({
                message: 'Product not found'
            })
            return
        }
        // If product is found, return the product-> is Available=true
        if (product.isAvailable) {
            response.json(product);

            // If the product is available=true, not admin, return the product
        } else {
            if (!isAdmin(request)) {
                response.status(404).json({
                    message: 'Product not found'
                })
                return
            }
            // If the product is not available,isAdmin=true, return the product
            else {
                response.json(product);
            }

        }

    } catch (error) {
        response.status(500).json({
            message: 'Error retrieving product',
            error: error
        });
    }

}
export async function searchProducts(request, response) {
    const searchquery = request.params.query;
    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: searchquery, $options: 'i' } },
                { altNames: { $elemMatch: { $regex: searchquery, $options: 'i' } } },
            ],
            isAvailable: true
        })
        response.json(products);
    } catch (error) {
        response.status(500).json({
            message: 'Error searching products',
            error: error
        });
    }
}
// export async function StripeCheckout(req, res) {
//     const stripeInstance = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
//     const { products } = req.body;
//     const lineItems = products.map((product) => ({
//         price_data: {
//             currency: 'USD',
//             product_data: {
//                 name: product.name,
//                 images: [Array.isArray(product.images) ? product.images[0] : product.images],
//             },
//             unit_amount: Math.round(product.price * 100),
//         },
//         quantity: product.qty,
//     }));
//     const session = await stripeInstance.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: lineItems,
//         mode: 'payment',
//         success_url: 'http://localhost:5173/checkout/success',
//         cancel_url: 'http://localhost:5173/checkout/cancel',
//     });
//     res.json({
//         id: session.id
//     });

// // }

export const StripeCheckout = async (req, res) => {
    try {
        console.log("Stripe Checkout called");
        const { products } = req.body;

        // Validate
        if (!products || products.length === 0) {
            return res.status(400).json({ error: "No products provided" });
        }

        // ✅ Use USD for testing (LKR not supported)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: products.map((item) => ({
                price_data: {
                    currency: "usd", // use USD for Stripe testing
                    product_data: {
                        name: item.name,
                        images: [item.images],
                    },
                    unit_amount: Math.max(item.price * 100, 50), // min 50 cents
                },
                quantity: item.qty,
            })),
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel",
        });

        console.log("✅ Stripe session created successfully");
        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("❌ Stripe error:", error);
        res.status(500).json({ error: error.message });
    }
};
