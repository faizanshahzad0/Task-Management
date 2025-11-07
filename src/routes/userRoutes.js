const { Router } = require("express");
const {
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleDeleteUser,
} = require("../controllers/userControllers");

const authenticateToken = require("../middlewares/authenticateToken");
const addNewTokenToResponse = require("../middlewares/addNewTokenToResponse");

const router = Router();

router.route("/users").get(authenticateToken, addNewTokenToResponse, handleGetAllUsers);

router
  .route("/user/:id")
  .get(authenticateToken, addNewTokenToResponse, handleGetUserById)
  .delete(authenticateToken, addNewTokenToResponse, handleDeleteUser)
  .patch(authenticateToken, addNewTokenToResponse, handleUpdateUserById);

module.exports = router;
