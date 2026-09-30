import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  RotateCcw,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen
} from 'lucide-react';

const StudentsPage = ({ onOpenAddStudent, onSelectStudent, onEditStudent, onDeleteStudent, refreshKey }) => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepts();
  }, []);

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: debouncedSearch.trim(),
        department: selectedDept,
        status: selectedStatus,
        year: selectedYear,
        gender: selectedGender,
        sortBy,
        sortOrder
      };

      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.students);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalStudents(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedDept, selectedStatus, selectedYear, selectedGender, sortBy, sortOrder]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, refreshKey]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedStatus('');
    setSelectedYear('');
    setSelectedGender('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-sm">
            Manage student registrations, academic standing, and profiles ({totalStudents} total records)
          </p>
        </div>
        <button
          onClick={onOpenAddStudent}
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/25 transition active:scale-95 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Enrol Student</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Roll No, Name, or Email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Academic Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          {/* Reset Filters */}
          {(search || selectedDept || selectedStatus || selectedYear || selectedGender) && (
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Student List View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Loading student directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No students found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No student records matched your search or filters. Try adjusting your query or enrol a new student.
            </p>
            {(search || selectedDept || selectedStatus || selectedYear) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider bg-slate-50/50">
                    <th 
                      onClick={() => handleSort('roll_number')}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-700 select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Roll Number</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('name')}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-700 select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Student Profile</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('department')}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-700 select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Branch</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold">Year / Sem</th>
                    <th 
                      onClick={() => handleSort('gpa')}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-700 select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>GPA</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-brand-700">
                        {s.roll_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {s.first_name ? s.first_name.charAt(0) : 'S'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{s.first_name} {s.last_name}</span>
                            <span className="text-xs text-slate-400 font-normal">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                          {s.department_code}
                        </span>
                        <span className="text-slate-500 ml-1.5 hidden xl:inline">{s.department_name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        Year {s.academic_year}, Sem {s.semester}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-extrabold text-slate-800">
                        {s.gpa !== null && s.gpa !== undefined ? s.gpa : '-'}
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
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onSelectStudent(s.id)}
                            title="View Full Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditStudent(s)}
                            title="Edit Student"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(s)}
                            title="Delete Student"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="block md:hidden divide-y divide-slate-100">
              {students.map((s) => (
                <div key={s.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                        {s.roll_number}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1">{s.first_name} {s.last_name}</h4>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : s.status === 'Graduated'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
                    <span>{s.department_code} &bull; Year {s.academic_year}, Sem {s.semester}</span>
                    <span>GPA: <strong className="text-slate-800">{s.gpa || '-'}</strong></span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => onSelectStudent(s.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => onEditStudent(s)}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => onDeleteStudent(s)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>records per page (Total {totalStudents})</span>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 font-semibold text-slate-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
