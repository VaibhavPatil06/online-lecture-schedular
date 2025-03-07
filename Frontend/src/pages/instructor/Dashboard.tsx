import React from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock } from 'lucide-react';
import { RootState } from '../../store';

const InstructorDashboard: React.FC = () => {
  const lectures = useSelector((state: RootState) => state.lectures);
  const courses = useSelector((state: RootState) => state.courses);
  const instructors = useSelector((state: RootState) => state.instructors);

  // For demo purposes, we'll use the first instructor
  const currentInstructor = instructors[0];

  const instructorLectures = lectures.filter(
    lecture => lecture.instructorId === currentInstructor.id
  );

  const groupedLectures = instructorLectures.reduce((acc, lecture) => {
    const date = lecture.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(lecture);
    return acc;
  }, {} as Record<string, typeof lectures>);

  const sortedDates = Object.keys(groupedLectures).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentInstructor.name}!</h1>
        <p className="mt-1 text-gray-600">Here's your lecture schedule</p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Lectures Scheduled</h3>
          <p className="mt-2 text-gray-600">You don't have any upcoming lectures.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <div className="space-y-4">
                {groupedLectures[date].map(lecture => {
                  const course = courses.find(c => c.id === lecture.courseId);
                  const batch = course?.batches.find(b => b.id === lecture.batchId);

                  return (
                    <div key={lecture.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">{course?.name}</h3>
                        <p className="text-sm text -gray-600">{batch?.name}</p>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{lecture.startTime} - {lecture.endTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Courses</h2>
          <div className="space-y-4">
            {currentInstructor.courses.map(courseId => {
              const course = courses.find(c => c.id === courseId);
              return course ? (
                <div key={courseId} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.level}</p>
                    <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="text-sm font-medium text-indigo-600">Total Courses</h3>
              <p className="mt-2 text-3xl font-semibold text-indigo-900">
                {currentInstructor.courses.length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600">Upcoming Lectures</h3>
              <p className="mt-2 text-3xl font-semibold text-purple-900">
                {instructorLectures.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;