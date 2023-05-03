import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user";
import todoRoutes from "./routes/todo";
import postRoutes from "./routes/post";
import commentRoutes from "./routes/comment";
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const MONGODB_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017';
mongoose
	.connect(MONGODB_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error(err));

app.use(express.json());

// Routes
app.use("/", userRoutes);
app.use("/", todoRoutes);
app.use("/", postRoutes);
app.use("/", commentRoutes);

app.listen(3000, () => console.log("Server running on port 3000"))

export default app;
