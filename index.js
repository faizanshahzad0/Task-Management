require('dotenv').config();

const express = require("express");
const path = require('path');

const connectDB = require("./dbConnection");
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV;

connectDB(process.env.MONGODB_URL).then(() => {
    console.log('Connected db successfully');
}).catch((err) => {
    console.log('Error connecting to db', err);
});

app.set('view engine', 'ejs');
app.set('views', path.resolve('./src/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
    try {
        const users = await User.find({}).select("-password -refreshToken");
        res.render("dashboard", { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.render("dashboard", { users: [] });
    }
});

app.use('/', userRoutes);
app.use('/', authRoutes);
app.use('/', taskRoutes);

if (NODE_ENV === "dev") {
    app.listen(PORT, () => {
        console.log(`Project is running on port:${PORT}`);
    });
}