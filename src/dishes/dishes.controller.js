const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

// List all dishes
function list(req, res) {
  res.json({ data: dishes });
}

// Create a new dish
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// Read a specific dish
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// Update a specific dish
function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  // Update dish properties
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

// Middleware to check if dish exists
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  return next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

// Validation middleware
function validateDish(req, res, next) {
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  // Validate name
  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }

  // Validate description
  if (!description || description === "") {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }

  // Validate image_url
  if (!image_url || image_url === "") {
    return next({
      status: 400,
      message: "Dish must include an image_url",
    });
  }

  // Validate price
  if (price === undefined || price <= 0 || typeof price !== 'number') {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  next();
}

module.exports = {
  list,
  create: [validateDish, create],
  read: [dishExists, read],
  update: [dishExists, validateDish, update],
};
