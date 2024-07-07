import http from "http";
import { defineConfig, Plugin } from "vite";
import { setup } from "./socket";

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
