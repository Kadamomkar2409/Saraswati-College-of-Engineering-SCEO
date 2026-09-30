import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight,
  Eye,
  UserX,
  PieChart,
  Calendar
} from 'lucide-react';

const DashboardPage = ({ onOpenAddStudent, onSelectStudent, refreshKey }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    graduatedStudents: 0,
    suspendedStudents: 0,
    totalDepartments: 0
  };

  const statCards = [
    {
      title: 'Total Enrolled',
      value: summary.totalStudents,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'All registered'
    },
    {
      title: 'Active Students',
      value: summary.activeStudents,
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badge: `${Math.round((summary.activeStudents / (summary.totalStudents || 1)) * 100)}% attendance rate`
    },
    {
      title: 'Alumni / Graduated',
      value: summary.graduatedStudents,
      icon: GraduationCap,
      color: 'from-purple-600 to-violet-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: 'Successfully completed'
    },
    {
      title: 'Academic Branches',
      value: summary.totalDepartments,
      icon: Building2,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badge: 'Departments active'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-brand-900/10 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Academic Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Saraswati College of Engineering</h1>
          <p className="text-slate-300 text-sm mt-1">
            Student Academic Dashboard & Enrollment Insights.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-95 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enrol Student</span>
          </button>
          <button
            onClick={() => navigate('/students')}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition active:scale-95 text-sm"
          >
            <span>Directory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.textColor} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">{card.badge}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution Section: Department breakdown and Gender/Year distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department Student Distribution</h3>
              <p className="text-xs text-slate-500">Student enrollment counts by major branch</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              {stats?.departmentDistribution?.length || 0} Departments
            </span>
          </div>

          <div className="space-y-4">
            {stats?.departmentDistribution?.map((dept) => {
              const count = dept.student_count || 0;
              const total = summary.totalStudents || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={dept.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {dept.code} - <span className="font-normal text-slate-500">{dept.name}</span>
                    </span>
                    <span className="font-bold text-slate-700">
                      {count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender & Status Breakdown (Right 1 col) */}
        <div className="space-y-6">
          {/* Gender Ratio */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Gender Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Demographics across all active batches</p>

            <div className="grid grid-cols-2 gap-3">
              {stats?.genderDistribution?.map((g, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase">{g.gender}</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1">{g.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Year Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Year-wise Batch Strength</h3>
            <p className="text-xs text-slate-500 mb-4">Undergraduate cohort size</p>

            <div className="space-y-2">
              {stats?.yearDistribution?.map((y, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                  <span className="font-semibold text-slate-700">Year {y.academic_year}</span>
                  <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
                    {y.count} Students
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admissions Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Enrolments</h3>
            <p className="text-xs text-slate-500">Newly registered students in the system</p>
          </div>
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
          >
            <span>View All Students</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Roll No</th>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Branch</th>
                <th className="py-3 px-4 font-semibold">Year/Sem</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats?.recentStudents?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                    No recent enrollments found.
                  </td>
                </tr>
              ) : (
                stats?.recentStudents?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-brand-700">
                      {s.roll_number}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {s.first_name} {s.last_name}
                      <span className="block text-xs font-normal text-slate-400">{s.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                        {s.department_code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      Year {s.academic_year}, Sem {s.semester}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.status === 'Graduated'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectStudent(s.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
