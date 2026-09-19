import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import { env } from "./env";

let io: Server | null = null;

export const initIO = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // In a real app we'd authenticate the socket here and join rooms based on userId
    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
};
