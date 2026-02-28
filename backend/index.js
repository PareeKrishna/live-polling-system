import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import socketHandler from "./socket.js";
import Poll from "./models/Poll.js";
import Response from "./models/Response.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend access
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// Create the Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "*", // You can restrict this to your frontend domain in production
        methods: ["GET", "POST"]
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
    socketHandler(socket, io);
});

// Basic test route
app.get("/", (req, res) => {
    res.send("🎉 Polling server is running!");
});

// GET /api/polls/history
app.get("/api/polls/history", async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        const responses = await Response.find();

        const sessionTotals = {};
        const computedNumbers = new Map();
        for (let i = polls.length - 1; i >= 0; i--) {
            const sid = polls[i].sessionId || 'legacy';
            sessionTotals[sid] = (sessionTotals[sid] || 0) + 1;
            computedNumbers.set(polls[i]._id.toString(), sessionTotals[sid]);
        }

        const history = polls.map((poll) => {
            const pollResponses = responses.filter(
                (r) => r.pollId?.toString() === poll._id.toString()
            );

            const optionCounts = poll.options.map((option) => {
                const count = pollResponses.filter(
                    (r) =>
                        r.selectedOption &&
                        r.selectedOption.toString() === option._id.toString()
                ).length;

                return {
                    _id: option._id,
                    text: option.text,
                    isCorrect: option.isCorrect,
                    count,
                };
            });

            const totalVotes = optionCounts.reduce((acc, opt) => acc + opt.count, 0);

            return {
                _id: poll._id,
                question: poll.text,
                questionNumber: poll.questionNumber || computedNumbers.get(poll._id.toString()),
                options: optionCounts.map((opt) => ({
                    ...opt,
                    percentage: totalVotes ? Math.round((opt.count / totalVotes) * 100) : 0,
                })),
                createdAt: poll.createdAt,
            };
        });

        res.json(history);
    } catch (err) {
        console.error("Error in /api/polls/history:", err);
        res.status(500).json({ error: "Failed to fetch poll history" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
