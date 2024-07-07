import express from "express";
import fs from "fs";
import http from "http";
import { setup } from "./socket";

if (!fs.existsSync(new URL("./dist", import.meta.url))) throw new Error("Bundle is not built yet.");
if (!fs.existsSync(new URL("./data", import.meta.url))) fs.mkdirSync(new URL("./data", import.meta.url));

const app = express();

const server = http.createServer(app);

setup(server)

app.use(express.static("dist"));

server.listen(3000, () => {
	console.log("listening on *:3000");
});
