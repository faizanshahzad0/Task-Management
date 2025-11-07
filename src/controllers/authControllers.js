const User = require("../schemas/userSchema");
const { accToken, refToken } = require("../services/jwtAuthentication");

const handleSignUp = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      const error = new Error("Missing required fields");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      throw error;
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
    next(error);
  }
};


const handleSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.isPasswordMatch(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

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
    next(error);
  }
};


const handleLogout = async (req, res, next) => {
  try {
    const refreshToken = req.header('x-auth-token') || req.header('refresh-token');

    if (!refreshToken) {
      const error = new Error("Refresh token required");
      error.statusCode = 401;
      throw error;
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
    next(error);
  }
};


module.exports = { handleSignUp, handleSignIn, handleLogout }