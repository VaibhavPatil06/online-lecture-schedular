import UserModel from "../../adminUser/schema/admin-user.schema.js";
import LectureModel from "../schema/lecture.schema.js";

export const scheduleLecture = async (req, res) => {
  const { courseId, instructorId, date, startTime, endTime } = req.body;

  try {
    // Validate required fields
    if (!courseId || !instructorId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the instructor already has a lecture on the same date
    const existingLecture = await LectureModel.findOne({ instructorId, date });
    if (existingLecture) {
      return res
        .status(400)
        .json({ message: "Instructor already has a lecture on this date" });
    }

    // Create a new lecture
    const newLecture = await LectureModel.create({
      courseId,
      instructorId,
      date,
      startTime,
      endTime,
    });

    // Add the lecture to the instructor's assignedLectures array
    await UserModel.findByIdAndUpdate(instructorId, {
      $push: { assignedLectures: newLecture._id },
    });

    res
      .status(201)
      .json({ message: "Lecture scheduled successfully", lecture: newLecture });
  } catch (error) {
    console.error("Error scheduling lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateScheduledLecture = async (req, res) => {
  const { id } = req.params; // Lecture ID
  const { courseId, instructorId, date, startTime, endTime } = req.body;

  try {
    // Validate required fields
    if (!courseId || !instructorId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the instructor already has a lecture on the same date
    const existingLecture = await LectureModel.findOne({
      instructorId,
      date,
      _id: { $ne: id },
    });
    if (existingLecture) {
      return res
        .status(400)
        .json({ message: "Instructor already has a lecture on this date" });
    }

    // Find the lecture by ID and update it
    const updatedLecture = await LectureModel.findByIdAndUpdate(
      id,
      { courseId, instructorId, date, startTime, endTime },
      { new: true } // Return the updated document
    );

    if (!updatedLecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json({
      message: "Lecture updated successfully",
      lecture: updatedLecture,
    });
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteScheduledLecture = async (req, res) => {
  const { id } = req.params; // Lecture ID

  try {
    // Find the lecture by ID and delete it
    const deletedLecture = await LectureModel.findByIdAndDelete(id);

    if (!deletedLecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Remove the lecture from the instructor's assignedLectures array
    await UserModel.findByIdAndUpdate(deletedLecture.instructorId, {
      $pull: { assignedLectures: id },
    });

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getScheduledLectures = async (req, res) => {
  try {
    // Fetch all lectures from the database
    const lectures = await LectureModel.find().populate(
      "courseId instructorId"
    );

    res.status(200).json({ lectures });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
