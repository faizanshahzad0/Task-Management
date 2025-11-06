const User = require("../schemas/userSchema");
const { accToken, refToken } = require("../services/jwtAuthentication");

const handleSignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


const handleSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.isPasswordMatch(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const accessToken = accToken(user);
    const refreshToken = refToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


const handleLogout = async (req, res) => {
  try {
    const refreshToken = req.header('x-auth-token') || req.header('refresh-token');

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.status(200).json({ 
      message: "User logged out successfully",
      note: "Refresh token has been invalidated. Please login again to get new tokens."
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


module.exports = { handleSignUp, handleSignIn, handleLogout }