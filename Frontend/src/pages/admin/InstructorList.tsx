import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Edit2, Mail } from "lucide-react";
import { RootState } from "../../store";
import {
  fetchInstructors,
  addInstructor,
  updateInstructor,
} from "../../store/instructorsSlice";
import type { Instructor } from "../../types";

const InstructorList: React.FC = () => {
  const dispatch = useDispatch();
  const instructors = useSelector((state: RootState) => state.instructors);
  const courses = useSelector((state: RootState) => state.courses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    courses: [] as string[],
  });

  useEffect(() => {
    dispatch(fetchInstructors());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInstructor) {
      await dispatch(
        updateInstructor({
          ...editingInstructor,
          ...formData,
        })
      );
    } else {
      await dispatch(
        addInstructor({
          id: crypto.randomUUID(),
          ...formData,
        })
      );
    }
    setIsModalOpen(false);
    setEditingInstructor(null);
    setFormData({ name: "", email: "", courses: [] });
  };

  const openEditModal = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      courses: instructor.courses,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Instructor
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor) => (
          <div key={instructor.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {instructor.name}
                </h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{instructor.email}</span>
                </div>
              </div>
              <button
                onClick={() => openEditModal(instructor)}
                className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Assigned Courses
              </h4>
              <div className="flex flex-wrap gap-2">
                {instructor.courses.map((courseId) => {
                  const course = courses.find((c) => c.id === courseId);
                  return course ? (
                    <span
                      key={courseId}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm"
                    >
                      {course.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingInstructor ? "Edit Instructor" : "Add New Instructor"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courses
                </label>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <label key={course.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.courses.includes(course.id)}
                        onChange={(e) => {
                          const newCourses = e.target.checked
                            ? [...formData.courses, course.id]
                            : formData.courses.filter((id) => id !== course.id);
                          setFormData({ ...formData, courses: newCourses });
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-gray-700">{course.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingInstructor(null);
                    setFormData({ name: "", email: "", courses: [] });
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingInstructor ? "Update" : "Add"} Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorList;
