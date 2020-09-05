const express = require("express");
const path = require("path");

const app = express();


app.get("/", (req, response) => response.sendFile(path.join(__dirname, "../docs/index.html")));
app.get("/demo", (req, response) => response.sendFile(path.join(__dirname, "./dist/index.html")));
app.get("/docs", (req, response) => response.sendFile(path.join(__dirname, "../docs/index.html")));
app.get("/docup.min.css", (req, response) => response.sendFile(path.join(__dirname, "../docs/docup.min.css")));
app.get("/overrides.css", (req, response) => response.sendFile(path.join(__dirname, "../docs/overrides.css")));
app.get("/docup.min.js", (req, response) => response.sendFile(path.join(__dirname, "../docs/docup.min.js")));
app.get("/README.md", (req, response) => response.sendFile(path.join(__dirname, "../docs//README.md")));
app.get("/docs.md", (req, response) => response.sendFile(path.join(__dirname, "../docs//README.md")));

app.use("/dist/", express.static(__dirname + "/dist/"));

app.listen(process.env.PORT || 8080);
