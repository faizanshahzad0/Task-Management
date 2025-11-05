const Task = require("../models/taskModel");
const { Searcher } = require("fast-fuzzy");
const { taskValidations } = require("../middlewares/taskValidations");

const handleCreateTask = async (req, res) => {
  try {
    const { error, value } = taskValidations.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({
        status: "failed",
        message: "Validation error",
        errors: messages,
      });
    }

    const newTask = await Task.create(value);

    return res.status(201).json({
      status: "success",
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("Error creating task:", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const handleUpdateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = taskValidations
      .fork(Object.keys(taskValidations.describe().keys), (schema) =>
        schema.optional()
      )
      .validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    if (error) {
      const messages = error.details.map((err) => err.message);
      return res.status(400).json({
        status: "failed",
        message: "Validation error",
        errors: messages,
      });
    }

    const task = await Task.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const handleGetAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search?.trim() || "";
    const statusFilter = req.query.status?.trim() || "";
    const priorityFilter = req.query.priority?.trim() || "";
    const dueDateFilter = req.query.dueDate?.trim() || "";

    const filter = {};

    if (statusFilter) {
      filter.status = statusFilter;
    }

    if (priorityFilter) {
      filter.priority = priorityFilter;
    }

    if (dueDateFilter) {
      const startOfDay = new Date(dueDateFilter);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dueDateFilter);
      endOfDay.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // 🧩 If there’s no search, use filters directly
    if (!searchQuery) {
      const tasks = await Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalTasks = await Task.countDocuments(filter);
      const totalPages = Math.ceil(totalTasks / limit);

      return res.status(200).json({
        message: "Tasks fetched successfully",
        tasks,
        pagination: { currentPage: page, totalPages, totalTasks },
      });
    }

    // If there is a search term, first get filtered tasks from DB
    const dbFiltered = await Task.find({
      ...filter,
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ],
    });

    const searcher = new Searcher(dbFiltered, {
      keySelector: (task) =>
        `${String(task.title || "")} ${String(task.description || "")}`,
      threshold: 0.5,
    });

    const results = searcher.search(searchQuery);

    if (!results.length) {
      return res.status(200).json({
        message: `No results found for search: "${searchQuery}"`,
        tasks: [],
        pagination: { currentPage: page, totalPages: 0, totalTasks: 0 },
      });
    }

    const totalTasks = results.length;
    const totalPages = Math.ceil(totalTasks / limit);
    const paginated = results.slice(skip, skip + limit);

    return res.status(200).json({
      message: `Tasks matched successfully for search: "${searchQuery}"`,
      tasks: paginated,
      pagination: { currentPage: page, totalPages, totalTasks },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(400).json({
      message: "Tasks fetch failed",
      error: error.message || error,
    });
  }
};

const handleGetTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    return res
      .status(200)
      .json({ status: "success", message: "Task fetched successfully", task });
  } catch (error) {
    return res
      .status(400)
      .json({ status: "failed", message: "Task fetched failed", error });
  }
};

const handleDeleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ status: "success", message: "Task deleted successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ status: "failed", message: "Task deletion failed", error });
  }
};

module.exports = {
  handleCreateTask,
  handleUpdateTask,
  handleGetAllTasks,
  handleGetTaskById,
  handleDeleteTask,
};
