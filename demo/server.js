const express = require("express");
const path = require("path");

const app = express();

app.get("/", (req, response) => response.sendFile(path.join(__dirname, "./dist/index.html")));
app.use("/dist/", express.static(__dirname + "/dist/"));

app.listen(process.env.PORT || 8080);
