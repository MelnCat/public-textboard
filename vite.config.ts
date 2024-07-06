import { defineConfig, Plugin, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import { Server } from "socket.io";

const socketio: () => Plugin = () => ({
	name: "socket.io-server",
	configureServer(server) {
		const io = new Server();

		io.on("connection", socket => {
			console.log("client connected");

			socket.on("disconnect", () => {
				console.log("client disconnected");
			});
		});
	},
});

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), socketio()],
});