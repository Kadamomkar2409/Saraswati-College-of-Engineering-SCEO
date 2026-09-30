const db = require('../config/db');

exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Overall Metrics
    const [overallRows] = await db.query(`
      SELECT 
        COUNT(*) AS total_students,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_students,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) AS inactive_students,
        SUM(CASE WHEN status = 'Graduated' THEN 1 ELSE 0 END) AS graduated_students,
        SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) AS suspended_students
      FROM students
      WHERE is_deleted = FALSE
    `);

    const stats = overallRows[0];

    // 2. Department Distribution
    const [deptRows] = await db.query(`
      SELECT 
        d.id,
        d.code,
        d.name,
        COUNT(s.id) AS student_count
      FROM departments d
      LEFT JOIN students s ON s.department_id = d.id AND s.is_deleted = FALSE
      GROUP BY d.id
      ORDER BY student_count DESC, d.name ASC
    `);

    // 3. Gender Distribution
    const [genderRows] = await db.query(`
      SELECT 
        gender,
        COUNT(*) AS count
      FROM students
      WHERE is_deleted = FALSE
      GROUP BY gender
    `);

    // 4. Academic Year Distribution
    const [yearRows] = await db.query(`
      SELECT 
        academic_year,
        COUNT(*) AS count
      FROM students
      WHERE is_deleted = FALSE
      GROUP BY academic_year
      ORDER BY academic_year ASC
    `);

    // 5. Recent 5 admissions
    const [recentRows] = await db.query(`
      SELECT 
        s.id,
        s.roll_number,
        s.first_name,
        s.last_name,
        s.email,
        s.status,
        s.academic_year,
        s.semester,
        s.created_at,
        d.name AS department_name,
        d.code AS department_code
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE s.is_deleted = FALSE
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents: Number(stats.total_students || 0),
          activeStudents: Number(stats.active_students || 0),
          inactiveStudents: Number(stats.inactive_students || 0),
          graduatedStudents: Number(stats.graduated_students || 0),
          suspendedStudents: Number(stats.suspended_students || 0),
          totalDepartments: deptRows.length
        },
        departmentDistribution: deptRows,
        genderDistribution: genderRows,
        yearDistribution: yearRows,
        recentStudents: recentRows
      }
    });
  } catch (error) {
    next(error);
  }
};
