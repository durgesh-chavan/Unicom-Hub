import express from "express";
import dotenv from "dotenv";
import connectDB, { User, MessageAttempt } from "./db.js";
import authRoutes from "./routes/auth.js";
import messagingRoutes from "./routes/messages.js";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(cors("*")); // This will allow all origins to access your API

// Routes
app.use("/auth", authRoutes); // Assuming authRoutes is correctly defined
app.use("/messaging", messagingRoutes); // Assuming messagingRoutes is correctly defined
 
app.get("/dashboard/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get overall message statistics
    const overallStats = await MessageAttempt.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: '$totalAttempts' },
          totalSuccess: { $sum: '$successCount' },
          totalFailure: { $sum: '$failureCount' }
        }
      }
    ]);

    // Get stats by message type
    const messageTypeStats = await MessageAttempt.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$messageType',
          attempts: { $sum: '$totalAttempts' },
          success: { $sum: '$successCount' },
          failure: { $sum: '$failureCount' }
        }
      }
    ]);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStats = await MessageAttempt.aggregate([
      {
        $match: {
          userId: userObjectId,
          timestamp: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$messageType',
          attempts: { $sum: '$totalAttempts' },
          success: { $sum: '$successCount' },
          failure: { $sum: '$failureCount' }
        }
      }
    ]);

    // Get recent attempts
    const recentAttempts = await MessageAttempt.find({ userId: userObjectId })
      .sort({ timestamp: -1 })
      .limit(5);

    res.json({
      overall: overallStats[0] || { totalAttempts: 0, totalSuccess: 0, totalFailure: 0 },
      byType: messageTypeStats,
      today: todayStats,
      recent: recentAttempts
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
});
// Set the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
