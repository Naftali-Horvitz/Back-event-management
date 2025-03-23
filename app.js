const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const path = require("path"); // הוסף את מודול path להגשת קבצים סטטיים
const userRouter = require("./routers/userRouter");
const guestRouter = require('./routers/guestRouter');
const eventRouter = require('./routers/eventRouter');

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

// הגדרת הקבצים הסטטיים של React
app.use(express.static(path.join(__dirname, 'build')));

// ניתובים קיימים
app.use("/user/", userRouter);
app.use('/guest/', guestRouter);
app.use('/events/', eventRouter);

// Catch-All Route לכל הבקשות האחרות
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
