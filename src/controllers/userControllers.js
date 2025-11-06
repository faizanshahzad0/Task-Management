const User = require("../schemas/userSchema");

const handleGetAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password -refreshToken");
  res.status(200).json({ message: "Users Fetched Successfully", users });
};

const handleGetUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -refreshToken");
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

module.exports = {
  handleGetAllUsers,
  handleGetUserById,
  handleDeleteUser,
  handleUpdateUserById
};
