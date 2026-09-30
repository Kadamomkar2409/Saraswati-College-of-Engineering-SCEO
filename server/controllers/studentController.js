const db = require('../config/db');

// GET /api/students
exports.getAllStudents = async (req, res, next) => {
  try {
    const {
      search = '',
      department = '',
      status = '',
      year = '',
      gender = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Allowed sort columns to prevent SQL injection
    const allowedSortFields = {
      id: 's.id',
      roll_number: 's.roll_number',
      name: 's.first_name',
      email: 's.email',
      department: 'd.name',
      academic_year: 's.academic_year',
      semester: 's.semester',
      status: 's.status',
      gpa: 's.gpa',
      enrollment_date: 's.enrollment_date',
      created_at: 's.created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 's.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build WHERE clauses
    const whereConditions = ['s.is_deleted = FALSE'];
    const queryParams = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      whereConditions.push(
        '(s.roll_number LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR CONCAT(s.first_name, " ", s.last_name) LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)'
      );
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (department && department !== 'all') {
      whereConditions.push('(s.department_id = ? OR d.code = ?)');
      queryParams.push(department, department);
    }

    if (status && status !== 'all') {
      whereConditions.push('s.status = ?');
      queryParams.push(status);
    }

    if (year && year !== 'all') {
      whereConditions.push('s.academic_year = ?');
      queryParams.push(parseInt(year, 10));
    }

    if (gender && gender !== 'all') {
      whereConditions.push('s.gender = ?');
      queryParams.push(gender);
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total query
    const countSql = `
      SELECT COUNT(*) AS total
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE ${whereClause}
    `;

    const [countRows] = await db.query(countSql, queryParams);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limitNum);

    // Data query
    const dataSql = `
      SELECT 
        s.id,
        s.roll_number,
        s.first_name,
        s.last_name,
        CONCAT(s.first_name, ' ', s.last_name) AS full_name,
        s.email,
        s.phone,
        s.dob,
        s.gender,
        s.blood_group,
        s.department_id,
        d.name AS department_name,
        d.code AS department_code,
        s.academic_year,
        s.semester,
        s.enrollment_date,
        s.status,
        s.address,
        s.guardian_name,
        s.guardian_phone,
        s.gpa,
        s.created_at,
        s.updated_at
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${direction}, s.id ${direction}
      LIMIT ? OFFSET ?
    `;

    const [students] = await db.query(dataSql, [...queryParams, limitNum, offset]);

    res.status(200).json({
      success: true,
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/:id
exports.getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        s.id,
        s.roll_number,
        s.first_name,
        s.last_name,
        CONCAT(s.first_name, ' ', s.last_name) AS full_name,
        s.email,
        s.phone,
        s.dob,
        s.gender,
        s.blood_group,
        s.department_id,
        d.name AS department_name,
        d.code AS department_code,
        s.academic_year,
        s.semester,
        s.enrollment_date,
        s.status,
        s.address,
        s.guardian_name,
        s.guardian_phone,
        s.gpa,
        s.created_at,
        s.updated_at
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE s.id = ? AND s.is_deleted = FALSE
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    res.status(200).json({
      success: true,
      student: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/students
exports.createStudent = async (req, res, next) => {
  try {
    const {
      roll_number,
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      blood_group,
      department_id,
      academic_year,
      semester,
      enrollment_date,
      status = 'Active',
      address,
      guardian_name,
      guardian_phone,
      gpa
    } = req.body;

    // Required fields validation
    if (!roll_number || !first_name || !last_name || !email || !department_id || !academic_year || !semester || !enrollment_date || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields (Roll Number, First Name, Last Name, Email, Gender, Department, Academic Year, Semester, and Enrollment Date).'
      });
    }

    // Check unique roll number and email
    const [existing] = await db.query(
      'SELECT roll_number, email FROM students WHERE (roll_number = ? OR email = ?) AND is_deleted = FALSE LIMIT 1',
      [roll_number.trim(), email.trim()]
    );

    if (existing.length > 0) {
      if (existing[0].roll_number.toLowerCase() === roll_number.trim().toLowerCase()) {
        return res.status(409).json({ success: false, message: 'A student with this Roll Number already exists.' });
      }
      return res.status(409).json({ success: false, message: 'A student with this Email already exists.' });
    }

    const insertSql = `
      INSERT INTO students (
        roll_number, first_name, last_name, email, phone, dob,
        gender, blood_group, department_id, academic_year, semester,
        enrollment_date, status, address, guardian_name, guardian_phone, gpa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(insertSql, [
      roll_number.trim().toUpperCase(),
      first_name.trim(),
      last_name.trim(),
      email.trim().toLowerCase(),
      phone ? phone.trim() : null,
      dob || null,
      gender,
      blood_group || null,
      parseInt(department_id, 10),
      parseInt(academic_year, 10),
      parseInt(semester, 10),
      enrollment_date,
      status || 'Active',
      address ? address.trim() : null,
      guardian_name ? guardian_name.trim() : null,
      guardian_phone ? guardian_phone.trim() : null,
      gpa !== undefined && gpa !== '' ? parseFloat(gpa) : null
    ]);

    // Fetch the newly inserted student
    const [newStudent] = await db.query(`
      SELECT s.*, d.name AS department_name, d.code AS department_code
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE s.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully!',
      student: newStudent[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      roll_number,
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      blood_group,
      department_id,
      academic_year,
      semester,
      enrollment_date,
      status,
      address,
      guardian_name,
      guardian_phone,
      gpa
    } = req.body;

    // Check if student exists
    const [existingStudent] = await db.query('SELECT id FROM students WHERE id = ? AND is_deleted = FALSE', [id]);
    if (existingStudent.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Check unique conflict for roll_number or email with other students
    if (roll_number || email) {
      const [conflict] = await db.query(
        'SELECT id, roll_number, email FROM students WHERE (roll_number = ? OR email = ?) AND id != ? AND is_deleted = FALSE LIMIT 1',
        [roll_number?.trim(), email?.trim(), id]
      );

      if (conflict.length > 0) {
        if (roll_number && conflict[0].roll_number.toLowerCase() === roll_number.trim().toLowerCase()) {
          return res.status(409).json({ success: false, message: 'Another student already has this Roll Number.' });
        }
        return res.status(409).json({ success: false, message: 'Another student already has this Email address.' });
      }
    }

    const fields = [];
    const values = [];

    if (roll_number !== undefined && roll_number !== '') { fields.push('roll_number = ?'); values.push(roll_number.trim().toUpperCase()); }
    if (first_name !== undefined && first_name !== '') { fields.push('first_name = ?'); values.push(first_name.trim()); }
    if (last_name !== undefined && last_name !== '') { fields.push('last_name = ?'); values.push(last_name.trim()); }
    if (email !== undefined && email !== '') { fields.push('email = ?'); values.push(email.trim().toLowerCase()); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone && phone.trim() ? phone.trim() : null); }
    if (dob !== undefined) { fields.push('dob = ?'); values.push(dob || null); }
    if (gender !== undefined) { fields.push('gender = ?'); values.push(gender); }
    if (blood_group !== undefined) { fields.push('blood_group = ?'); values.push(blood_group && blood_group.trim() ? blood_group.trim().toUpperCase() : null); }
    if (department_id !== undefined && department_id !== '') { fields.push('department_id = ?'); values.push(parseInt(department_id, 10)); }
    if (academic_year !== undefined && academic_year !== '') { fields.push('academic_year = ?'); values.push(parseInt(academic_year, 10)); }
    if (semester !== undefined && semester !== '') { fields.push('semester = ?'); values.push(parseInt(semester, 10)); }
    if (enrollment_date !== undefined && enrollment_date !== '') { fields.push('enrollment_date = ?'); values.push(enrollment_date); }
    if (status !== undefined && status !== '') { fields.push('status = ?'); values.push(status); }
    if (address !== undefined) { fields.push('address = ?'); values.push(address && address.trim() ? address.trim() : null); }
    if (guardian_name !== undefined) { fields.push('guardian_name = ?'); values.push(guardian_name && guardian_name.trim() ? guardian_name.trim() : null); }
    if (guardian_phone !== undefined) { fields.push('guardian_phone = ?'); values.push(guardian_phone && guardian_phone.trim() ? guardian_phone.trim() : null); }
    if (gpa !== undefined) { fields.push('gpa = ?'); values.push(gpa !== '' && gpa !== null ? parseFloat(gpa) : null); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    values.push(id);
    const updateSql = `UPDATE students SET ${fields.join(', ')} WHERE id = ? AND is_deleted = FALSE`;
    await db.query(updateSql, values);

    const [updatedRow] = await db.query(`
      SELECT s.*, d.name AS department_name, d.code AS department_code
      FROM students s
      JOIN departments d ON s.department_id = d.id
      WHERE s.id = ?
    `, [id]);

    res.status(200).json({
      success: true,
      message: 'Student details updated successfully!',
      student: updatedRow[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const [existing] = await db.query('SELECT id, roll_number, first_name, last_name FROM students WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    if (permanent === 'true') {
      await db.query('DELETE FROM students WHERE id = ?', [id]);
    } else {
      await db.query(
        'UPDATE students SET is_deleted = TRUE, roll_number = CONCAT(roll_number, "_del_", id), email = CONCAT(email, "_del_", id) WHERE id = ?',
        [id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Student record (${existing[0].roll_number} - ${existing[0].first_name} ${existing[0].last_name}) deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};
