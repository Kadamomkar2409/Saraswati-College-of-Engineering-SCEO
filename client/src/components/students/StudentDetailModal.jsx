import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  X, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Heart, 
  ShieldAlert, 
  Edit3, 
  Trash2,
  Award,
  BookOpen
} from 'lucide-react';

const StudentDetailModal = ({ studentId, isOpen, onClose, onEdit, onDelete }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (!studentId || !isOpen) return;

    const fetchDetail = async () => {
      try {
        setStudent(null);
        setLoading(true);
        const res = await api.get(`/students/${studentId}`);
        if (res.data.success) {
          setStudent(res.data.student);
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
        toast.error('Failed to load student details.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [studentId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Loading student profile...</p>
          </div>
        ) : student ? (
          <div>
            {/* Profile Hero Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 p-6 sm:p-8 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 border-2 border-white/20 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-brand-500/30">
                  {student.first_name ? student.first_name.charAt(0) : 'S'}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/15 text-brand-200 border border-white/10">
                      {student.roll_number}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        student.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : student.status === 'Graduated'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {student.first_name} {student.last_name}
                  </h3>
                  <p className="text-slate-300 text-sm flex items-center gap-2 mt-0.5">
                    <BookOpen className="w-4 h-4 text-brand-400" />
                    <span>{student.department_name} ({student.department_code})</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Academic Overview Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Academic Year</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">Year {student.academic_year}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Sem</span>
                  <p className="text-base font-bold text-slate-800 mt-0.5">Semester {student.semester}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">GPA Score</span>
                  <p className="text-base font-extrabold text-brand-600 mt-0.5">
                    {student.gpa !== null && student.gpa !== undefined ? student.gpa : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Enrolled On</span>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gender</span>
                      <span className="text-sm font-semibold text-slate-700">{student.gender || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Birth</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {student.dob ? new Date(student.dob).toLocaleDateString() : 'Not recorded'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                      <span className="text-sm font-semibold text-slate-700">{student.blood_group || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Award className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status Note</span>
                      <span className="text-sm font-semibold text-slate-700">{student.status} Enrollment</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact & Address</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email Address</span>
                      <a href={`mailto:${student.email}`} className="text-sm font-semibold text-brand-600 hover:underline">
                        {student.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone Number</span>
                      <span className="text-sm font-semibold text-slate-700">{student.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Residential Address</span>
                      <span className="text-sm text-slate-700 font-medium">{student.address || 'No address provided.'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Emergency / Guardian Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Guardian Name</span>
                    <span className="text-sm font-semibold text-slate-800">{student.guardian_name || 'Not provided'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Guardian Contact</span>
                    <span className="text-sm font-semibold text-slate-800">{student.guardian_phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  onClose();
                  onDelete(student);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Student</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(student);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StudentDetailModal;
