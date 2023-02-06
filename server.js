const path = require("path");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const _ = require("lodash");
const UssdMenu = require("ussd-builder");
const session = require("./utils/sessionHandler");
const { notFound, errorHandler } = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

let menu = new UssdMenu();

// Connect to database
connectDB();

// Route files
const List = require("./menu");

// Initialize express
const app = express();

// Body-parser --responsible for parsing the incoming request bodies in a middleware before you handle it
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set static folder
const publicDirPath = path.join(__dirname, "public");
app.use(express.static(publicDirPath));

// File extensions
app.use(
  express.static(publicDirPath, {
    extensions: ["html", "css", "js", "png", "jpg", "json", "ico"],
  })
);

// Registering USSD handler with Express
_.over([session, List])(menu);

app.post("/", async (req, res, next) => {
  try {
    await menu.run(req.body, (ussdResult) => {
      res.send(ussdResult);
    });

    console.log(req.body.serviceCode, req.body.phoneNumber, req.body.text);
  } catch (error) {
    next(error);
  }
});

// Error management
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process
  .on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`.red.underline.bold);
    // Close server & exit process
    server.close(() => process.exit(1));
  })
  .on("uncaughtException", (err) => {
    console.log(`Uncaught Exception: ${err.message}`.red.bold);
    process.exit(1);
  });
