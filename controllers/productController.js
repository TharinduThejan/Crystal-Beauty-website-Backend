import Product from "../models/product.js";
export async function getProducts(request, response) {
    // Product.find()
    //     .then((data) => {
    //         response.json(data);
    //     })
    //     .catch((error) => {
    //         response.status(500).json({ message: 'Error retrieving products', error });
    //     });
    try {
        const products = await Product.find();
        response.json(products);
    } catch (error) {
        response.status(500).json({ message: 'Error retrieving products', error });
    }
}
export function saveProduct(request, response) {
    if (request.user == null) {
        response.status(401).json({
            message: 'Unauthorized'
        });
        return;
    }
    if (request.user.role !== 'admin') {
        response.status(403).json({
            message: 'You need to be an admin'
        });
        return;
    }
    console.log(request.user);
    console.log(request.body);

    const product = new Product({
        name: request.body.name,
        price: request.body.price,
        description: request.body.description
    });

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