import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Lecture } from "../types";

interface LecturesState {
  lectures: Lecture[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: LecturesState = {
  lectures: [],
  status: "idle",
  error: null,
};

// Fetch all lectures
export const fetchLectures = createAsyncThunk(
  "lectures/fetchLectures",
  async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/lectures/get-lectures`);
    return response.data;
  }
);

// Add a new lecture
export const addLecture = createAsyncThunk(
  "lectures/addLecture",
  async (lecture: Omit<Lecture, "id">) => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/lectures/add-lecture`, lecture);
    return response.data;
  }
);

// Update a lecture
export const updateLecture = createAsyncThunk(
  "lectures/updateLecture",
  async (lecture: Lecture) => {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/lectures/update-lecture`, lecture);
    return response.data;
  }
);

// Delete a lecture
export const removeLecture = createAsyncThunk(
  "lectures/removeLecture",
  async (lectureId: string) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/lectures/delete-lecture`);
    return lectureId;
  }
);

const lecturesSlice = createSlice({
  name: "lectures",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch lectures
      .addCase(fetchLectures.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLectures.fulfilled, (state, action: PayloadAction<Lecture[]>) => {
        state.status = "succeeded";
        state.lectures = action.payload;
      })
      .addCase(fetchLectures.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch lectures";
      })

      // Add lecture
      .addCase(addLecture.fulfilled, (state, action: PayloadAction<Lecture>) => {
        state.lectures.push(action.payload);
      })

      // Update lecture
      .addCase(updateLecture.fulfilled, (state, action: PayloadAction<Lecture>) => {
        const index = state.lectures.findIndex(
          (lecture) => lecture.id === action.payload.id
        );
        if (index !== -1) {
          state.lectures[index] = action.payload;
        }
      })

      // Delete lecture
      .addCase(removeLecture.fulfilled, (state, action: PayloadAction<string>) => {
        state.lectures = state.lectures.filter(
          (lecture) => lecture.id !== action.payload
        );
      });
  },
});

export default lecturesSlice.reducer;