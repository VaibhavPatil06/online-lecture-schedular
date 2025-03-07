import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Course } from '../types';

interface CoursesState {
  courses: Course[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  status: 'idle',
  error: null,
};

// Fetch all courses
export const fetchCourses = createAsyncThunk<Course[], void>(
  'courses/fetchCourses',
  async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/courses/get-courses`);
    return response.data;
  }
);

// Add a new course
export const addCourse = createAsyncThunk<Course, FormData>(
  'courses/addCourse',
  async (formData) => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/courses/add-course`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Required for file uploads
      },
    });
    return response.data;
  }
);

// Update a course
export const updateCourse = createAsyncThunk<Course, { formData: FormData }>(
  'courses/updateCourse',
  async ({ formData }) => {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/courses/update-course`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Required for file uploads
      },
    });
    return response.data;
  }
);

// Delete a course
export const deleteCourse = createAsyncThunk<string, string>(
  'courses/deleteCourse',
  async (courseId) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/courses/delete-course?courseId=${courseId}`);
    return courseId;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.status = 'succeeded';
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch courses';
      })

      // Add course
      .addCase(addCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.courses.push(action.payload);
      })

      // Update course
      .addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        const index = state.courses.findIndex((course) => course._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })

      // Delete course
      .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string>) => {
        state.courses = state.courses.filter((course) => course._id !== action.payload);
      });
  },
});

export default coursesSlice.reducer;