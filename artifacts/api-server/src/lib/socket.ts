import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import { env } from "./env";

let io: Server | null = null;

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export const initIO = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // If auth token provided in handshake, authenticate and join automatically
    const token = socket.handshake.auth?.token;
    if (token) {
      jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (!err && decoded?.id) {
          socket.join(decoded.id);
          console.log(`Socket ${socket.id} authenticated and joined room ${decoded.id}`);
        }
      });
    }

    socket.on("join", (roomId: string) => {
      if (roomId) {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      }
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
