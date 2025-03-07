import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import Login from './pages/Login';
import InstructorList from './pages/admin/InstructorList';
import CourseList from './pages/admin/CourseList';
import LectureSchedule from './pages/admin/LectureSchedule';
import InstructorDashboard from './pages/instructor/Dashboard';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="instructors" replace />} />
            <Route path="instructors" element={<InstructorList />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="schedule" element={<LectureSchedule />} />
          </Route>

          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<InstructorDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;