import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Instructor } from '../types';

const API_URL = 'http://localhost:5000/api/instructors';

// Fetch Instructors
export const fetchInstructors = createAsyncThunk('instructors/fetchInstructors', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

// Add Instructor
export const addInstructor = createAsyncThunk('instructors/addInstructor', async (instructor: Instructor) => {
  const response = await axios.post(API_URL, instructor);
  return response.data;
});

// Update Instructor
export const updateInstructor = createAsyncThunk('instructors/updateInstructor', async (instructor: Instructor) => {
  const response = await axios.put(`${API_URL}/${instructor.id}`, instructor);
  return response.data;
});

const instructorsSlice = createSlice({
  name: 'instructors',
  initialState: [] as Instructor[],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(addInstructor.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(updateInstructor.fulfilled, (state, action) => {
        const index = state.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state[index] = action.payload;
        }
      });
  },
});

export default instructorsSlice.reducer;