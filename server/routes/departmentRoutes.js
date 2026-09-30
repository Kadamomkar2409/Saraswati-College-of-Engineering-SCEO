const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/auth');

// Departments can be accessed with or without auth, but requiring auth is standard admin app practice
router.get('/', authMiddleware, departmentController.getDepartments);

module.exports = router;
