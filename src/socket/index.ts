import { Server } from "socket.io";
import http from "http";
import { registerFormFillingHandlers } from "./formFillingHandler";

export function setupSocket(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  registerFormFillingHandlers(io);
}
