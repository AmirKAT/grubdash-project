const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// Helper functions and middleware

// Middleware to check if an order exists
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    next({ status: 404, message: `Order id not found: ${orderId}` });
}

// Validation middleware for creating and updating an order
function validateOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    if (!deliverTo || deliverTo === "") {
        return next({ status: 400, message: "Order must include a deliverTo" });
    }

    if (!mobileNumber || mobileNumber === "") {
        return next({ status: 400, message: "Order must include a mobileNumber" });
    }

    if (!dishes) {
        return next({ status: 400, message: "Order must include a dish" });
    }

    if (!Array.isArray(dishes) || dishes.length === 0) {
        return next({ status: 400, message: "Order must include at least one dish" });
    }

    dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
            return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` });
        }
    });

    next();
}

// CRUD functions

// List all orders
function list(req, res) {
    res.json({ data: orders });
}

// Create a new order
function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

// Read an existing order
function read(req, res) {
    res.json({ data: res.locals.order });
}

// Update an existing order
function update(req, res, next) {
    const order = res.locals.order;
    const { orderId } = req.params;
    const { data: { id, deliverTo, mobileNumber, dishes, status } = {} } = req.body;

    // Validation: id in the body must match orderId in the route
    if (id && id !== orderId) {
        return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.` });
    }

    // Additional validations
    if (!deliverTo || deliverTo === "") {
        return next({ status: 400, message: "Order must include a deliverTo" });
    }
    if (!mobileNumber || mobileNumber === "") {
        return next({ status: 400, message: "Order must include a mobileNumber" });
    }
    if (!dishes) {
        return next({ status: 400, message: "Order must include a dish" });
    }
    if (!Array.isArray(dishes) || dishes.length === 0) {
        return next({ status: 400, message: "Order must include at least one dish" });
    }
    dishes.forEach((dish, index) => {
        if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
            return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` });
        }
    });
    if (!status || status === "" || !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)) {
        return next({ status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered" });
    }

    // Update order properties
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    order.status = status;

    res.json({ data: order });
}

// Delete an existing order
function destroy(req, res, next) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);

    if (index === -1) {
        // Order does not exist
        return next({ status: 404, message: `Order id not found: ${orderId}` });
    }

    const order = orders[index];

    if (order.status !== 'pending') {
        // Cannot delete an order unless it is pending
        return next({ status: 400, message: 'An order cannot be deleted unless it is pending.' });
    }

    // Delete the order
    orders.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    list,
    create: [validateOrder, create],
    read: [orderExists, read],
    update: [orderExists, validateOrder, update],
    delete: [orderExists, destroy],
};
