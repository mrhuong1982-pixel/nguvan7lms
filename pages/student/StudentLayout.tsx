
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import StudentDashboard from './StudentDashboard';
import MyAssignments from './MyAssignments';
import ViewLessons from './ViewLessons';
import LessonDetail from './LessonDetail';
import SubmitAssignment from './SubmitAssignment';

const StudentLayout: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout allowedRole="student" />}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="assignments" element={<MyAssignments />} />
        <Route path="assignments/:assignmentId" element={<SubmitAssignment />} />
        <Route path="lessons" element={<ViewLessons />} />
        <Route path="lessons/:lessonId" element={<LessonDetail />} />
        <Route path="/" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default StudentLayout;
