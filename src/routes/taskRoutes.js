const { Router } = require("express");
const {
  handleCreateTask,
  handleUpdateTask,
  handleGetAllTasks,
  handleGetTaskById,
  handleDeleteTask,
} = require("../controllers/taskController");

const authenticateToken = require("../middlewares/authenticateToken");
const addNewTokenToResponse = require("../middlewares/addNewTokenToResponse");

const router = Router();

router
  .route("/create/task")
  .post(authenticateToken, addNewTokenToResponse, handleCreateTask);
router
  .route("/tasks")
  .get(authenticateToken, addNewTokenToResponse, handleGetAllTasks);

router
  .route("/task/:id")
  .get(authenticateToken, addNewTokenToResponse, handleGetTaskById)
  .delete(authenticateToken, addNewTokenToResponse, handleDeleteTask)
  .patch(authenticateToken, addNewTokenToResponse, handleUpdateTask);

module.exports = router;
