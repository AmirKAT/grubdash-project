const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

// Define routes
router.route("/")
  .get(controller.list)
  .post(controller.create);

router.route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

// Export the router
module.exports = router;
