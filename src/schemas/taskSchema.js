const { mongoose } = require("mongoose");
const { TASKS_STATUSES, TASKS_PRIORITIES } = require("../enums/taskStatus");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        TASKS_STATUSES.PENDING,
        TASKS_STATUSES.COMPLETED,
        TASKS_STATUSES.INPROGRESS,
        TASKS_STATUSES.BLOCKER,
      ],
      default: TASKS_STATUSES.PENDING,
    },
    priority: {
      type: String,
      enum: [
        TASKS_PRIORITIES.LOW,
        TASKS_PRIORITIES.MEDIUM,
        TASKS_PRIORITIES.HIGH,
        TASKS_PRIORITIES.URGENT,
      ],
      default: TASKS_PRIORITIES.MEDIUM,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
