import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Edit2, Calendar, Trash2 } from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import {
  fetchCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../../store/coursesSlice";
import type { Course, Batch } from "../../types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CourseList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.courses.courses);
  const status = useSelector((state: RootState) => state.courses.status);
  const error = useSelector((state: RootState) => state.courses.error);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Omit<Course, "_id">>({
    name: "",
    level: "Beginner",
    description: "",
    imageFile: null, // Store the image file instead of URL
    batches: [],
  });
  const [newBatch, setNewBatch] = useState<Omit<Batch, "id">>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [batchError, setBatchError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCourses());
    }
  }, [status, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate batch dates
    if (
      formData.batches.some(
        (batch) => new Date(batch.endDate) < new Date(batch.startDate)
      )
    ) {
      setBatchError("End date cannot be before start date.");
      return;
    }

    // Create FormData object
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("level", formData.level);
    formDataToSend.append("description", formData.description);
    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile); // Append the image file
    }
    formDataToSend.append("batches", JSON.stringify(formData.batches));

    try {
      if (editingCourse) {
        formDataToSend.append("id", editingCourse._id);
        await dispatch(updateCourse({ formData: formDataToSend })).unwrap();
        toast.success("Course updated successfully!");
      } else {
        await dispatch(addCourse(formDataToSend)).unwrap();
        toast.success("Course added successfully!");
      }

      setIsModalOpen(false);
      setEditingCourse(null);
      setFormData({
        name: "",
        level: "Beginner",
        description: "",
        imageFile: null,
        batches: [],
      });
      setBatchError(null);

      // Refresh the course list
      dispatch(fetchCourses());
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const addBatch = () => {
    if (!newBatch.name || !newBatch.startDate || !newBatch.endDate) {
      setBatchError("All batch fields are required.");
      return;
    }

    if (new Date(newBatch.endDate) < new Date(newBatch.startDate)) {
      setBatchError("End date cannot be before start date.");
      return;
    }

    setFormData({
      ...formData,
      batches: [...formData.batches, { ...newBatch, id: crypto.randomUUID() }],
    });
    setNewBatch({ name: "", startDate: "", endDate: "" });
    setBatchError(null);
  };

  const removeBatch = (batchId: string) => {
    setFormData({
      ...formData,
      batches: formData.batches.filter((b) => b.id !== batchId),
    });
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      level: course.level,
      description: course.description,
      imageFile: null, // Reset image file when editing
      batches: course.batches,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        toast.success("Course deleted successfully!");

        // Refresh the course list
        dispatch(fetchCourses());
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "An error occurred while deleting the course."
        );
      }
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  const courseList = Array.isArray(courses?.courses) ? courses?.courses : [];

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courseList.map((course: Course) => (
          <div key={course._id} className="card">
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/${course.imageFile}`}
                alt={course.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {course.name}
                </h3>
                <span className="inline-block px-2 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md mt-1">
                  {course.level}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(course)}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-gray-600">{course.description}</p>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Batches
              </h4>
              <div className="space-y-2">
                {course.batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{batch.name}</span>
                    <span className="text-gray-400">
                      ({new Date(batch.startDate).toLocaleDateString()} -{" "}
                      {new Date(batch.endDate).toLocaleDateString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter course name"
                    required
                  />
                </div>

                {/* Course Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Course Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    rows={4}
                    placeholder="Enter course description"
                    required
                  />
                </div>

                {/* Course Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-all">
                      {formData.imageFile ? (
                        <img
                          src={URL.createObjectURL(formData.imageFile)}
                          alt="Course Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-gray-500">Upload an image</span>
                          <span className="text-xs text-gray-400">
                            (JPEG, PNG, or GIF)
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, imageFile: file });
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Batches Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Batches
                  </h3>
                  {batchError && (
                    <p className="text-sm text-red-600 mb-4">{batchError}</p>
                  )}
                  <div className="space-y-4">
                    {formData.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {batch.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(batch.startDate).toLocaleDateString()} -{" "}
                            {new Date(batch.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBatch(batch.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={newBatch.name}
                        onChange={(e) =>
                          setNewBatch({ ...newBatch, name: e.target.value })
                        }
                        placeholder="Batch Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                      <input
                        type="date"
                        value={newBatch.startDate}
                        onChange={(e) =>
                          setNewBatch({
                            ...newBatch,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                      <input
                        type="date"
                        value={newBatch.endDate}
                        onChange={(e) =>
                          setNewBatch({ ...newBatch, endDate: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addBatch}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add Batch
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingCourse(null);
                      setFormData({
                        name: "",
                        level: "Beginner",
                        description: "",
                        imageFile: null,
                        batches: [],
                      });
                      setBatchError(null);
                    }}
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingCourse ? "Update Course" : "Add Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
