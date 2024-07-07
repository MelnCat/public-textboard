import { defineConfig, Plugin, PluginOption } from "vite";
import { Server } from "socket.io";
import { createHash } from "crypto";
import fs from "fs";
import { join } from "path";
import msgpackParser from "socket.io-msgpack-parser";

const socketio: () => Plugin = () => ({
	name: "socket.io-server",
	configureServer(server) {
		const data = fs.existsSync(join(__dirname, "./data/data.json"))
			? JSON.parse(fs.readFileSync(join(__dirname, "./data/data.json"), "utf8"))
			: [...Array(100)].map(() => Array(100).fill(" "));
		const selections: Record<string, { x: number; y: number; color: string }> = {};
		const io = new Server(server.httpServer!, { parser: msgpackParser });
		process.on("exit", () => {
			fs.writeFileSync(join(__dirname, "./data/data.json"), JSON.stringify(data));
		});

		setInterval(() => {
			fs.writeFileSync(join(__dirname, "./data/data.json"), JSON.stringify(data));
		}, 1000 * 60 * 15);

		io.on("connection", socket => {
			io.emit("online", io.engine.clientsCount);
			socket.emit("text", data);
			socket.emit("selections", Object.values(selections));
			socket.on("set", (x: number, y: number, value: string) => {
				if (x < 0 || x >= data.length || y < 0 || y >= data[0].length || value.length !== 1) return;
				data[x][y] = value;
				socket.broadcast.emit("set", x, y, value);
			});
			socket.on("select", async (x: number, y: number) => {
				selections[socket.id] = { x, y, color: `#${createHash("sha256").update(socket.id).digest("hex").slice(0, 6)}` };
				for (const s of await io.fetchSockets()) {
					if (s.id === socket.id) continue;
					s.emit(
						"selections",
						Object.entries(selections)
							.filter(x => x[0] !== s.id)
							.map(x => x[1])
					);
				}
			});
			socket.on("deselect", async () => {
				delete selections[socket.id];
				for (const s of await io.fetchSockets()) {
					if (s.id === socket.id) continue;
					s.emit(
						"selections",
						Object.entries(selections)
							.filter(x => x[0] !== s.id)
							.map(x => x[1])
					);
				}
			});
			socket.on("disconnect", () => {
				delete selections[socket.id];
				io.emit("selections", Object.values(selections));
				io.emit("online", io.engine.clientsCount);
			});
		});
	},
});

export default defineConfig({
	plugins: [socketio()],
});
