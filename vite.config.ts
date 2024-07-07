import { defineConfig, Plugin, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import { Server } from "socket.io";

const socketio: () => Plugin = () => ({
	name: "socket.io-server",
	configureServer(server) {
		const data = [...Array(100)].map(() => Array(100).fill(" "));
		const selections: Record<string, { x: number, y: number }> = {};
		const io = new Server(server.httpServer!, {maxHttpBufferSize: 1e8});

		io.on("connection", socket => {
			socket.emit("text", data);
			socket.on("set", (x: number, y: number, value: string) => {
				console.log(x, y, value)
				if (x < 0 || x >= data.length || y < 0 || y >= data[0].length || value.length !== 1) return;
				data[x][y] = value;
				io.emit("set", x, y, value);
			});
			socket.on("select", (x: number, y: number) => {
				selections[socket.id] = { x, y };
				io.emit("selections", Object.values(selections));
			});
			socket.on("deselect", () => {
				delete selections[socket.id];
				io.emit("selections", Object.values(selections));
			});
			socket.on("disconnect", () => {
				delete selections[socket.id];
				io.emit("selections", Object.values(selections));
			});
			socket.on("requestData", () => {
				socket.emit("text", data);
				socket.emit("selections", Object.values(selections));
			})
		});
	},
});

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), socketio()],
});
