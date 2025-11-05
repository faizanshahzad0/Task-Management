const { Router } = require("express");
const {
  handleCreateTask,
  handleUpdateTask,
  handleGetAllTasks,
  handleGetTaskById,
  handleDeleteTask,
} = require("../controllers/taskController");

const router = Router();

router.route("/task").post(handleCreateTask);
router.route("/tasks").get(handleGetAllTasks);

router.route("/task/:id").get(handleGetTaskById).delete(handleDeleteTask).patch(handleUpdateTask);

module.exports = router
