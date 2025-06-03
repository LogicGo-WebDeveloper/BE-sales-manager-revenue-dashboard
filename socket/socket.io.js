import { Server } from "socket.io";
import { socketConfig } from "./socket.config.js";
import enumConfig from "../config/enum.config.js";

// Basic set-up of socket.io
const initializeSocket = (server) => {
  const io = new Server(server, socketConfig);

  io.on("connection", (socket) => {
    console.log(`⚡ New user connected: ${socket.id}`);

    socket.on(enumConfig.socketEventEnums.SEND_MESSAGE, (data) => {
      console.log("📩 Message received:", data);
      io.emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;
