require('dotenv').config();

const express = require("express");
const connectDB = require("./dbConnection");
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

connectDB(process.env.MONGODB_URL).then(() => {
    console.log('Connected db successfully');
}).catch((err) => {
    console.log('Error connecting to db', err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.send("Project is Running successfully");
});

app.use('/', userRoutes);
app.use('/', authRoutes);

app.listen(PORT, () => {
    console.log(`Project is running on port:${PORT}`);
});
