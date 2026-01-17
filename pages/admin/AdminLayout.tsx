
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import AdminDashboard from './AdminDashboard';
import ManageClasses from './ManageClasses';
import ManageStudents from './ManageStudents';
import ManageLessons from './ManageLessons';
import ManageAssignments from './ManageAssignments';
import GradeSubmissions from './GradeSubmissions';
import Gradebook from './Gradebook';
import ManageAnnouncements from './ManageAnnouncements';
import Reports from './Reports';
import ManageQuestionBank from './ManageQuestionBank';

const AdminLayout: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout allowedRole="teacher" />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="classes" element={<ManageClasses />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="lessons" element={<ManageLessons />} />
        <Route path="question-bank" element={<ManageQuestionBank />} />
        <Route path="assignments" element={<ManageAssignments />} />
        <Route path="assignments/:assignmentId/submissions" element={<GradeSubmissions />} />
        <Route path="announcements" element={<ManageAnnouncements />} />
        <Route path="gradebook" element={<Gradebook />} />
        <Route path="reports" element={<Reports />} />
        <Route path="/" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminLayout;
