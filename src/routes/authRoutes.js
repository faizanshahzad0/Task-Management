const { Router } = require("express");
const {
  handleSignUp,
  handleSignIn,
  handleLogout,
} = require("../controllers/authControllers");

const router = Router();

router.route("/signup").post(handleSignUp);
router.route("/signin").post(handleSignIn);
router.route("/logout").post(handleLogout);

module.exports = router;
