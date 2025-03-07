import { configureStore } from '@reduxjs/toolkit';
import instructorsReducer from './instructorsSlice';
import coursesReducer from './coursesSlice';
import lecturesReducer from './lecturesSlice';

export const store = configureStore({
  reducer: {
    instructors: instructorsReducer,
    courses: coursesReducer,
    lectures: lecturesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;