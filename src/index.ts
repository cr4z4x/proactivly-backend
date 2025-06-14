import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongo } from "./lib/mogoose";
import authRoutes from "./routes/auth.routes";
import formRoutes from "./routes/forms.routes"; // ✅ Register form routes
import { registerFormFillingHandlers } from "./socket/formFillingHandler";
import redisClient from "./redis/redisClient"; // ✅ Optional: ensure Redis connects

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/forms", formRoutes); // ✅ Now serves form creation endpoint

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  path: "/formanswer", // Custom WebSocket endpoint
  cors: {
    origin: "*", // ⚠️ Restrict this in production
    methods: ["GET", "POST"],
  },
});

// MongoDB connection
connectMongo();

// Redis connection check
if (!redisClient.isOpen) {
  redisClient
    .connect()
    .then(() => console.log("✅ Redis connected"))
    .catch((err) => {
      console.error("❌ Redis connection failed", err);
      process.exit(1); // optional fail-fast
    });
}

// Register real-time handlers
registerFormFillingHandlers(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
