import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Calendar, Clock, Trash2, Edit } from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import {
  fetchLectures,
  addLecture,
  updateLecture,
  removeLecture,
} from "../../store/lecturesSlice";
import type { Lecture } from "../../types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchCourses } from "../../store/coursesSlice";
import { fetchInstructors } from "../../store/instructorsSlice";

const LectureSchedule: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const lectures = useSelector((state: RootState) => state.lectures.lectures);
  const status = useSelector((state: RootState) => state.lectures.status);
  const error = useSelector((state: RootState) => state.lectures.error);
  const courses = useSelector((state: RootState) => state.courses.courses || []);
  const instructors = useSelector(
    (state: RootState) => state.instructors || []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [formData, setFormData] = useState<Omit<Lecture, "id">>({
    courseId: "",
    instructorId: "",
    batchId: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchLectures());
      dispatch(fetchCourses());
      dispatch(fetchInstructors());
    }
  }, [status, dispatch]);

  const selectedCourse = Array.isArray(courses)
    ? courses.find((c) => c._id === formData.courseId)
    : null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.courseId) newErrors.courseId = "Course is required";
    if (!formData.instructorId)
      newErrors.instructorId = "Instructor is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (formData.startTime >= formData.endTime)
      newErrors.endTime = "End time must be after start time";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingLecture) {
        await dispatch(
          updateLecture({ id: editingLecture.id, ...formData })
        ).unwrap();
        toast.success("Lecture updated successfully!");
      } else {
        await dispatch(addLecture(formData)).unwrap();
        toast.success("Lecture scheduled successfully!");
      }
      setIsModalOpen(false);
      setEditingLecture(null);
      setFormData({
        courseId: "",
        instructorId: "",
        batchId: "",
        date: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      toast.error(
        error.message || "An error occurred while scheduling the lecture."
      );
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        await dispatch(removeLecture(lectureId)).unwrap();
        toast.success("Lecture deleted successfully!");
      } catch (error) {
        toast.error("An error occurred while deleting the lecture.");
      }
    }
  };

  const openEditModal = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormData({
      courseId: lecture.courseId,
      instructorId: lecture.instructorId,
      batchId: lecture.batchId,
      date: lecture.date,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
    });
    setIsModalOpen(true);
  };

  const groupedLectures = (Array.isArray(lectures) ? lectures : []).reduce(
    (acc, lecture) => {
      const date = lecture.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(lecture);
      return acc;
    },
    {} as Record<string, Lecture[]>
  );

  const sortedDates = Object.keys(groupedLectures).sort();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lecture Schedule</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Lecture
        </button>
      </div>

      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <div className="space-y-4">
              {groupedLectures[date].map((lecture) => {
                const course = Array.isArray(courses)
                  ? courses.find((c) => c._id === lecture.courseId)
                  : null;
                const instructor = Array.isArray(instructors)
                  ? instructors.find((i) => i.id === lecture.instructorId)
                  : null;
                const batch = course?.batches.find(
                  (b) => b.id === lecture.batchId
                );

                return (
                  <div
                    key={lecture.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {course?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {instructor?.fullName}
                        </p>
                        <p className="text-sm text-gray-500">{batch?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {lecture.startTime} - {lecture.endTime}
                        </span>
                      </div>
                      <button
                        onClick={() => openEditModal(lecture)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLecture(lecture.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingLecture ? "Edit Lecture" : "Schedule New Lecture"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseId: e.target.value,
                      batchId: "",
                    })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>
                )}
              </div>

              {selectedCourse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    value={formData.batchId}
                    onChange={(e) =>
                      setFormData({ ...formData, batchId: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select Batch</option>
                    {selectedCourse.batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) =>
                    setFormData({ ...formData, instructorId: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.fullName}
                    </option>
                  ))}
                </select>
                {errors.instructorId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.instructorId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="input-field"
                  required
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  {errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingLecture(null);
                    setFormData({
                      courseId: "",
                      instructorId: "",
                      batchId: "",
                      date: "",
                      startTime: "",
                      endTime: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingLecture ? "Update" : "Schedule"} Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureSchedule;