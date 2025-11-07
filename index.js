require('dotenv').config();

const express = require("express");
const connectDB = require("./dbConnection");
const indexRoutes = require('./src/routes/indexRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'dev';

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

app.use('/', indexRoutes);

app.use(errorHandler);

if (NODE_ENV === "dev") {
    app.listen(PORT, () => {
        console.log(`Project is running on port:${PORT}`);
    });
}