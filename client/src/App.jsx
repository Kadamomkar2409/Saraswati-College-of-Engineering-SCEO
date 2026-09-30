import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentModal from './components/students/StudentModal';
import StudentDetailModal from './components/students/StudentDetailModal';
import DeleteConfirmModal from './components/students/DeleteConfirmModal';
import api from './services/api';

function AppContent() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load departments globally for modals
  useEffect(() => {
    const fetchDepts = async () => {
      if (!token) return;
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        // Silently fail if not logged in yet
      }
    };
    fetchDepts();
  }, [token, refreshKey]);

  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditStudent = (student) => {
    setStudentToEdit(student);
    setIsFormModalOpen(true);
  };

  const handleOpenStudentDetail = (id) => {
    setSelectedStudentId(id);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteConfirm = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleStudentSavedOrDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout onOpenAddStudent={handleOpenAddStudent} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <DashboardPage
                onOpenAddStudent={handleOpenAddStudent}
                onSelectStudent={handleOpenStudentDetail}
                refreshKey={refreshKey}
              />
            }
          />
          <Route
            path="students"
            element={
              <StudentsPage
                onOpenAddStudent={handleOpenAddStudent}
                onSelectStudent={handleOpenStudentDetail}
                onEditStudent={handleOpenEditStudent}
                onDeleteStudent={handleOpenDeleteConfirm}
                refreshKey={refreshKey}
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Modals */}
      <StudentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={handleStudentSavedOrDeleted}
        studentToEdit={studentToEdit}
        departments={departments}
      />

      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(student) => {
          setIsDetailModalOpen(false);
          handleOpenEditStudent(student);
        }}
        onDelete={(student) => {
          setIsDetailModalOpen(false);
          handleOpenDeleteConfirm(student);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={handleStudentSavedOrDeleted}
        student={studentToDelete}
      />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
