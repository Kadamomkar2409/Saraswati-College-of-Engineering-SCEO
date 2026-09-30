const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password.' });
    }

    const [rows] = await db.query(
      'SELECT id, username, email, password_hash, full_name, role FROM admins WHERE username = ? OR email = ? LIMIT 1',
      [username.trim(), username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        fullName: admin.full_name
      },
      process.env.JWT_SECRET || 'college_sms_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, full_name, role, created_at FROM admins WHERE id = ? LIMIT 1',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    res.status(200).json({
      success: true,
      admin: rows[0]
    });
  } catch (error) {
    next(error);
  }
};
