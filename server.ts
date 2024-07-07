import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setup } from "./socket";

const app = express();

const server = http.createServer(app);

setup(server)

app.use(express.static("dist"));

server.listen(3000, () => {
	console.log("listening on *:3000");
});
