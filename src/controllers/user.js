const User = require("../models/userModel");
const { accToken, refToken } = require("../services/jwtAuthentication");

const handleGetAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ message: "Users Fetched Successfully", users });
};

const handleGetUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ message: "User Fetched Successfully", user });
};

const handleUpdateUserById = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.firstName !== undefined)
      updateData.firstName = req.body.firstName;
    if (req.body.lastName !== undefined)
      updateData.lastName = req.body.lastName;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.role !== undefined) {
      updateData.role = req.body.role;
    }

    // Update user with proper options
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      status: "success",
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const handleDeleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

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

    res.status(201).json({ message: "User created successfully", newUser });
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

module.exports = {
  handleGetAllUsers,
  handleGetUserById,
  handleDeleteUser,
  handleUpdateUserById,
  handleSignUp,
  handleSignIn,
  handleLogout,
};
