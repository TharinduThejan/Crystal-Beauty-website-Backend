import Product from "../models/product.js";
export function getProducts(request, response) {
    Product.find()
        .then((data) => {
            response.json(data);
        })
        .catch((error) => {
            response.status(500).json({ message: 'Error retrieving products', error });
        });
}
export function saveProduct(request, response) {
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