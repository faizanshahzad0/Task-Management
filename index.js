const express = require("express")

const app = express()
const PORT = 8000

app.use(express.json());
app.use(express.urlencoded({ extended: false }))


app.get("/", (req, res) => {
    res.send("Project is Running successfully");
});

app.listen(PORT, () => {
    console.log(`Project is running on port:${PORT}`)
})
