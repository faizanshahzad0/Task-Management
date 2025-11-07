const { Router } = require("express");
const {
  handleSignUp,
  handleSignIn,
  handleLogout,
} = require("../controllers/authControllers");

const router = Router();

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.route("/signup").post(handleSignUp);
router.route("/signin").post(handleSignIn);
router.route("/logout").post(handleLogout);
router.get("/logout", handleLogout); // GET route for easy logout from browser

module.exports = router;
