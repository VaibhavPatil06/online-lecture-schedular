import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (for instructors)
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

// Ensure no overlapping lectures for the same instructor on the same date
lectureSchema.index({ instructorId: 1, date: 1 }, { unique: true });

const LectureModel = mongoose.model("Lecture", lectureSchema);
export default LectureModel;
