const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const userRouter = require("./routers/userRouter");
const guestRouter = require("./routers/guestRouter");
const eventRouter = require("./routers/eventRouter");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err);
  });

// routes
app.use("/user", userRouter);
app.use("/guest", guestRouter);
app.use("/events", eventRouter);
