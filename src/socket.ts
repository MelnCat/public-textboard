import { io } from "socket.io-client";
import msgpackParser from "socket.io-msgpack-parser";

export const socket = io({ parser: msgpackParser });