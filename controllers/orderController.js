
import Order from "../models/order.js";
import Product from "../models/product.js";



export async function createOrder(request, response) {
    //get user information
    if (request.user == null) {
        response.status(400).json({
            message: "Please login and try again"
        })
        return;
    }

    const orderInfo = request.body;
    if (orderInfo.name == null) {
        orderInfo.name = request.user.firstName + " " + request.user.lastName;
    }

    let orderId = "CBC00001"

    const lastOrder = await Order.find().sort({ date: -1 }).limit(1);

    if (lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].orderId; //CBC00551
        const lastOrderNumberString = lastOrderId.replace("CBC", ""); //00551 
        const lastOrderNumber = parseInt(lastOrderNumberString); //551
        const newOrderNumber = lastOrderNumber + 1; //552
        const newOrderNumberString = String(newOrderNumber).padStart(5, "0"); //00552
        orderId = "CBC" + newOrderNumberString; //CBC00552
    }
    try {
        let total = 0;
        let labeledTotal = 0;
        const products = [];

        for (let i = 0; i < orderInfo.products.length; i++) {
            const item = await Product.findOne({ productId: orderInfo.products[i].productId });
            if (item == null) {
                response.status(400).json({
                    message: "Product with product Id " + orderInfo.products[i].productId + " not found"
                });
                return;
            }
            if (item.isAvailable == false) {
                response.status(400).json({
                    message: "Product with product Id " + orderInfo.products[i].productId + " is not available now"
                });
                return;
            }
            products[i] = {
                productInfo: {
                    productId: item.productId,
                    name: item.name,
                    altNames: item.altNames,
                    description: item.description,
                    images: item.images,
                    labeledPrice: item.labeledPrice,
                    price: item.price,
                },
                qty: orderInfo.products[i].qty
            };
            total += (item.price || 0) * orderInfo.products[i].qty;
            labeledTotal += item.labeledPrice * orderInfo.products[i].qty;
        }
        const order = new Order({
            orderId: orderId,
            email: request.user.email,
            name: orderInfo.name,
            phone: orderInfo.phone,
            address: orderInfo.address,
            total: 0,
            labeledTotal: labeledTotal,
            products: products,
            total: total
        });
        const createdOrder = await order.save();
        response.status(201).json({
            message: "Order created successfully",
            order: createdOrder
        });
    } catch (err) {
        response.status(500).json({
            message: "Error creating order",
            error: err
        });
        return;
    }
    //add current user name if not provided
    //order Id genarate

    //create order object

}
export async function getOrders(request, response) {
    if (request.user == null) {
        response.status(400).json({
            message: "Please login and try again"
        })
        return;
    }
    try {
        if (request.user.isAdmin) {
            const orders = await Order.find().sort({ date: -1 });
            response.status(200).json({
                message: "Orders fetched successfully",
                orders: orders
            });
            return;
        }
        else {
            const orders = await Order.find({ email: request.user.email }).sort({ date: -1 });
            response.status(200).json({
                message: "Orders fetched successfully",
                orders: orders
            });
            return;
        }
    }
    catch (err) {
        response.status(500).json({
            message: "Error fetching orders",
            error: err
        });
        return;
    }
}