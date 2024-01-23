const express = require("express");
const ordersController = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

const router = express.Router();

// Define the routes and attach them to the controllers
router
  .route("/")
  .get(ordersController.list)
  .post(ordersController.create)
  .all(methodNotAllowed);

router
  .route("/:orderId")
  .get(ordersController.read)
  .put(ordersController.update)
  .delete(ordersController.delete)
  .all(methodNotAllowed);

module.exports = router;
