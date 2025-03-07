import express from "express";
import multer from "multer";
import {
  addCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from "../controllers/course.controller.js";

const courseRouter = express.Router();

// Routes
courseRouter.get("/get-courses", getCourses);
courseRouter.post("/add-course", addCourse); // Handle single file upload
courseRouter.put("/update-course", updateCourse); // Handle single file upload
courseRouter.delete("/delete-course", deleteCourse);

export default courseRouter;
