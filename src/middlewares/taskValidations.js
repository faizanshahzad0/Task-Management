const Joi = require("joi");
const { TASKS_STATUSES, TASKS_PRIORITIES } = require("../enums/taskStatus");

const taskValidations = Joi.object({
  title: Joi.string().trim().required().messages({
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),

  description: Joi.string().trim().required().messages({
    "any.required": "Description is required",
    "string.empty": "Description cannot be empty",
  }),

  status: Joi.string()
    .valid(
      TASKS_STATUSES.PENDING,
      TASKS_STATUSES.COMPLETED,
      TASKS_STATUSES.INPROGRESS,
      TASKS_STATUSES.BLOCKER
    )
    .default(TASKS_STATUSES.PENDING),

  priority: Joi.string()
    .valid(
      TASKS_PRIORITIES.LOW,
      TASKS_PRIORITIES.MEDIUM,
      TASKS_PRIORITIES.HIGH,
      TASKS_PRIORITIES.URGENT
    )
    .default(TASKS_PRIORITIES.MEDIUM),

  completedAt: Joi.date().optional(),
  dueDate: Joi.date().optional(),
});

module.exports = { taskValidations };
