require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectDB = require("./dbConnection");
const indexRoutes = require('./src/routes/indexRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'dev';

connectDB(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected db successfully");
  })
  .catch((err) => {
    console.log("Error connecting to db", err);
  });

app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (NODE_ENV === "dev") {
  app.use(cookieParser());
}

// Dashboard route - only available in dev mode
if (NODE_ENV === "dev") {
  app.get("/dashboard", optionalAuth, async (req, res) => {
    try {
      if (req.user) {
        const tasks = await Task.find({ createdBy: req.user._id })
          .populate("createdBy", "-password -refreshToken")
          .sort({ createdAt: -1 });
        res.render("dashboard", { 
          tasks, 
          user: {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role
          }
        });
      } else {
        res.render("dashboard", { tasks: [], user: null });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.render("dashboard", { tasks: [], user: null });
    }
  });
} else {
  app.get("/dashboard", async (req, res) => {
    res.render("dashboard", { tasks: [], user: null });
  });
}

app.get("/", (req, res) => {
  res.render("signin");
});

app.use('/', indexRoutes);

app.use(errorHandler);

if (NODE_ENV === "dev") {
  app.listen(PORT, () => {
    console.log(`Project is running on port:${PORT}`);
  });
}