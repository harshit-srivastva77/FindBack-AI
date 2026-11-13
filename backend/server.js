
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FindBack AI Backend is running!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FindBack AI API is working!",
  });
});

app.use("/api/items", itemRoutes);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully!");

    app.listen(PORT, () => {
      console.log(`FindBack AI server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
}

startServer();
