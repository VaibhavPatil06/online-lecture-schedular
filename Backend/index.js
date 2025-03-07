import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import "dotenv/config";
import { setContext } from "./src/modules/middleware/auth.js";
import connectDB, { disconnectDB } from "./src/database/mongoDB.js";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import cors from "cors";
import router from "./src/modules/adminUser/routes/adminUser.route.js";
import courseRouter from "./src/modules/courses/routes/courses.route.js";
import lectureRouter from "./src/modules/lectures/routes/lecture.routes.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(setContext);

app.use(
  cors({
    origin: "http://localhost:5173", // Change this to match your frontend
    credentials: true, //  Required for cookies to work
  })
);

let server;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Check server status
app.get("/", (req, res) => {
  res.status(200).json({ message: "Helthcheck pass !.", success: true });
});

//routes
app.use("/api/v1/admin", router);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/lectures", lectureRouter);

server = app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", () => {
  server.close(async () => {
    console.log("Server closed");
    await disconnectDB();
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(async () => {
    console.log("Server closed");
    await disconnectDB();
    process.exit(0);
  });
});
