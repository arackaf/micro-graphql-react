import express from "express";

const app = express();

app.get("/", (req, response) => response.sendfile("./demo/index.htm"));
app.use("/dist/", express.static(__dirname + "/dist/"));

app.listen(3000);
