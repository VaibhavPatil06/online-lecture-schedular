import express from "express";

import {
  deleteScheduledLecture,
  getScheduledLectures,
  scheduleLecture,
  updateScheduledLecture,
} from "../controllers/lectures.controller.js";

const lectureRouter = express.Router();

// Routes
lectureRouter.get("/get-lectures", getScheduledLectures);
lectureRouter.post("/add-lecture", scheduleLecture); // Handle single file upload
lectureRouter.put("/update-lecture", updateScheduledLecture); // Handle single file upload
lectureRouter.delete("/delete-lecture", deleteScheduledLecture);

export default lectureRouter;
