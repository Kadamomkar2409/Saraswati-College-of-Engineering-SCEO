import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onDeleted, student }) => {
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await api.delete(`/students/${student.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Student deleted successfully.');
        onDeleted();
        onClose();
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900">Delete Student Record?</h3>
          <p className="text-sm text-slate-500 mt-1">
            Are you sure you want to remove this student from the active directory?
          </p>

          <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Roll Number:</span>
              <span className="font-mono font-bold text-slate-800">{student.roll_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Name:</span>
              <span className="font-semibold text-slate-800">{student.first_name} {student.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Department:</span>
              <span className="font-semibold text-slate-800">{student.department_name || student.department_code}</span>
            </div>
          </div>

          <p className="text-xs text-rose-600 font-medium">
            This action will safely archive the student and exclude them from active enrollment counts.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
