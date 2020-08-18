const express = require("express");

const app = express();

app.get("/", (req, response) => response.sendfile("./demo/dist/index.html"));
app.use("/dist/", express.static(__dirname + "/dist/"));

app.listen(process.env.PORT || 8080);
