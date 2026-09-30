const db = require('../config/db');

exports.getDepartments = async (req, res, next) => {
  try {
    const [departments] = await db.query(
      `SELECT d.id, d.code, d.name, d.description,
              COUNT(s.id) AS student_count
       FROM departments d
       LEFT JOIN students s ON s.department_id = d.id AND s.is_deleted = FALSE
       GROUP BY d.id
       ORDER BY d.name ASC`
    );

    res.status(200).json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error) {
    next(error);
  }
};
