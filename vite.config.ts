import { defineConfig, Plugin, PluginOption } from "vite";
import { setup } from "./socket";
import http from "http";

const socketio: () => Plugin = () => ({
	name: "socket.io-server",
	configureServer(server) {
		setup(server.httpServer as http.Server);
	},
});

export default defineConfig({
	plugins: [socketio()],
	server: {
		host: true,
	},
});
