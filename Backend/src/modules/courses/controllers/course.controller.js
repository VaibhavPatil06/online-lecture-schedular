import multer from "multer";
import Course from "../schema/course.schema.js";
import fs from "fs";
import path from "path";

// Helper function to delete an image file
const deleteImageFile = (imagePath) => {
  if (imagePath && fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting image file:", err);
    });
  }
};

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("image");

// Add a new course
export const addCourse = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Error uploading file",
          error: err.message,
        });
      }

      const { name, level, description, batches } = req.body;

      // Validate required fields
      if (!name || !level || !description || !batches) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if an image file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Parse the batches field from a JSON string to an array of objects
      let parsedBatches;
      try {
        parsedBatches = JSON.parse(batches);
      } catch (error) {
        return res.status(400).json({ message: "Invalid batches format" });
      }

      const transformedBatches = parsedBatches.map((batch) => ({
        batchName: batch.name, // Map `name` to `batchName`
        startDate: batch.startDate,
        endDate: batch.endDate,
      }));

      // Create a new course
      const newCourse = await Course.create({
        name,
        level,
        description,
        image: "", // Temporarily set image path to empty
        batches: transformedBatches,
      });

      // Create the course-specific directory
      const courseDir = path.join(
        "uploads",
        "courses",
        newCourse._id.toString(),
        "img"
      );
      fs.mkdirSync(courseDir, { recursive: true });

      // Write the file buffer to the course-specific directory
      const newPath = path.join(courseDir, req.file.originalname);
      fs.writeFileSync(newPath, req.file.buffer);

      // Update the course with the new image path
      newCourse.image = newPath;
      await newCourse.save();

      res
        .status(201)
        .json({ message: "Course added successfully", course: newCourse });
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a course with image upload
export const updateCourse = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Error uploading file",
          error: err.message,
        });
      }

      const { id, name, level, description, batches } = req.body;

      // Validate required fields
      if (!id || !name || !level || !description || !batches) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Parse the batches field from a JSON string to an array of objects
      let parsedBatches;
      try {
        parsedBatches = JSON.parse(batches);
      } catch (error) {
        return res.status(400).json({ message: "Invalid batches format" });
      }

      const transformedBatches = parsedBatches.map((batch) => ({
        batchName: batch.name, // Map `name` to `batchName`
        startDate: batch.startDate,
        endDate: batch.endDate,
      }));

      // Find the course by ID
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // If a new image is uploaded, move it to the course-specific directory
      if (req.file) {
        const courseDir = path.join(
          "uploads",
          "courses",
          course._id.toString(),
          "img"
        );
        fs.mkdirSync(courseDir, { recursive: true });

        // Write the file buffer to the course-specific directory
        const newPath = path.join(courseDir, req.file.originalname);
        fs.writeFileSync(newPath, req.file.buffer);

        // Delete the old image file
        deleteImageFile(course.image);

        // Update the image path
        course.image = newPath;
      }

      // Update the course
      course.name = name;
      course.level = level;
      course.description = description;
      course.batches = transformedBatches;
      await course.save();

      res.status(200).json({ message: "Course updated successfully", course });
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  const { courseId } = req.query; // Course ID

  try {
    // Find the course by ID and delete it
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete the associated image file
    deleteImageFile(deletedCourse.image);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    // Fetch all courses from the database
    const courses = await Course.find();

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
