const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();

const userRoute = require("./routes/userRoute.js");
const errorHandler = require("./middleware/errorMiddleware.js");

const app = express();

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://shopwatch.netlify.app"],
    credentials: true,
  })
);

//Routes
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  res.send("Home page");
});
//Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(error));
