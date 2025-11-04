const { Router } = require("express");
const {
  handleGetAllUsers,
  handleGetUserById,
  handleUpdateUserById,
  handleDeleteUser,
  handleSignUp,
  handleSignIn,
  handleLogout,
} = require("../controllers/user");
const authenticateToken = require("../middlewares/authenticateToken");
const addNewTokenToResponse = require("../middlewares/addNewTokenToResponse");

const router = Router();

router.route("/signup").post(handleSignUp);
router.route("/signin").post(handleSignIn);
router.route("/logout").post(handleLogout);

router.route("/allUsers").get(authenticateToken, addNewTokenToResponse, handleGetAllUsers);

router
  .route("/:id")
  .get(authenticateToken, addNewTokenToResponse, handleGetUserById)
  .delete(authenticateToken, addNewTokenToResponse, handleDeleteUser)
  .patch(authenticateToken, addNewTokenToResponse, handleUpdateUserById);

module.exports = router;
