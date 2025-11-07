const User = require("../schemas/userSchema");

const handleGetAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password -refreshToken");
    res.status(200).json({ message: "Users Fetched Successfully", users });
  } catch (error) {
    next(error);
  }
};

const handleGetUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refreshToken");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "User Fetched Successfully", user });
  } catch (error) {
    next(error);
  }
};

const handleUpdateUserById = async (req, res, next) => {
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
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
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
    next(error);
  }
};

const handleDeleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return res.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllUsers,
  handleGetUserById,
  handleDeleteUser,
  handleUpdateUserById
};
