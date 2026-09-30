const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function initDatabase() {
  console.log('🚀 Connecting to MySQL server to initialize database...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const dbName = process.env.DB_NAME || 'college_sms_db';
    console.log(`Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('Creating tables...');

    // 1. Admins Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('Admin', 'Staff') DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Departments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Students Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roll_number VARCHAR(50) NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(20),
        dob DATE,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        blood_group VARCHAR(10) DEFAULT NULL,
        department_id INT NOT NULL,
        academic_year INT NOT NULL CHECK (academic_year BETWEEN 1 AND 4),
        semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
        enrollment_date DATE NOT NULL,
        status ENUM('Active', 'Inactive', 'Graduated', 'Suspended') DEFAULT 'Active',
        address TEXT,
        guardian_name VARCHAR(100),
        guardian_phone VARCHAR(20),
        gpa DECIMAL(3, 2) DEFAULT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
        INDEX idx_department (department_id),
        INDEX idx_status (status),
        INDEX idx_academic_year (academic_year),
        INDEX idx_is_deleted (is_deleted),
        INDEX idx_student_name (first_name, last_name)
      ) ENGINE=InnoDB;
    `);

    console.log('Seeding departments...');
    const departments = [
      ['CSE', 'Computer Science & Engineering', 'Software engineering, algorithms, AI, and systems'],
      ['IT', 'Information Technology', 'Network infrastructure, web development, and cloud computing'],
      ['ECE', 'Electronics & Communication', 'Embedded systems, signal processing, and telecommunications'],
      ['MECH', 'Mechanical Engineering', 'Thermodynamics, robotics, and manufacturing engineering'],
      ['CIVIL', 'Civil Engineering', 'Structural design, construction, and environmental engineering'],
      ['AIDS', 'Artificial Intelligence & Data Science', 'Machine learning, big data analytics, and neural networks']
    ];

    for (const [code, name, desc] of departments) {
      await connection.query(`
        INSERT INTO departments (code, name, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
      `, [code, name, desc]);
    }

    console.log('Seeding default admin...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT INTO admins (username, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash)
    `, ['admin', 'admin@college.edu', adminPasswordHash, 'Administrator', 'Admin']);

    // Check student count
    const [existingStudents] = await connection.query('SELECT COUNT(*) as count FROM students');
    if (existingStudents[0].count === 0) {
      console.log('Seeding sample students...');
      
      // Get department IDs
      const [deptRows] = await connection.query('SELECT id, code FROM departments');
      const deptMap = {};
      deptRows.forEach(d => { deptMap[d.code] = d.id; });

      const sampleStudents = [
        ['CS2023001', 'Aarav', 'Sharma', 'aarav.sharma@example.com', '9876543210', '2004-05-14', 'Male', 'O+', deptMap['CSE'], 3, 5, '2023-08-01', 'Active', '124 Park Avenue, Metro City', 'Rajesh Sharma', '9876500001', 8.75],
        ['CS2023002', 'Ananya', 'Patel', 'ananya.patel@example.com', '9876543211', '2004-09-21', 'Female', 'B+', deptMap['CSE'], 3, 5, '2023-08-01', 'Active', '45 Green Meadows, Metro City', 'Suresh Patel', '9876500002', 9.12],
        ['IT2023001', 'Rohan', 'Verma', 'rohan.verma@example.com', '9876543212', '2003-12-10', 'Male', 'A+', deptMap['IT'], 4, 7, '2022-08-01', 'Active', '78 Lake View, North District', 'Manoj Verma', '9876500003', 8.20],
        ['IT2024001', 'Priya', 'Nair', 'priya.nair@example.com', '9876543213', '2005-03-18', 'Female', 'AB+', deptMap['IT'], 2, 3, '2024-08-01', 'Active', '12 Palm Grove, South District', 'Venugopal Nair', '9876500004', 8.95],
        ['EC2023001', 'Kabir', 'Mehta', 'kabir.mehta@example.com', '9876543214', '2004-07-25', 'Male', 'O-', deptMap['ECE'], 3, 6, '2023-08-01', 'Active', '89 Hill Crest, West District', 'Vikram Mehta', '9876500005', 7.85],
        ['EC2024001', 'Sneha', 'Reddy', 'sneha.reddy@example.com', '9876543215', '2005-11-04', 'Female', 'O+', deptMap['ECE'], 2, 3, '2024-08-01', 'Active', '33 Sunrise Enclave, East City', 'K. V. Reddy', '9876500006', 9.40],
        ['ME2022001', 'Aditya', 'Joshi', 'aditya.joshi@example.com', '9876543216', '2002-04-12', 'Male', 'B-', deptMap['MECH'], 4, 8, '2021-08-01', 'Graduated', '56 Industrial Belt, East City', 'Dilip Joshi', '9876500007', 8.10],
        ['ME2024001', 'Diya', 'Deshmukh', 'diya.deshmukh@example.com', '9876543217', '2005-08-30', 'Female', 'A-', deptMap['MECH'], 2, 4, '2024-08-01', 'Active', '92 Orchid Gardens, Metro City', 'Nitin Deshmukh', '9876500008', 7.90],
        ['CV2023001', 'Manish', 'Gupta', 'manish.gupta@example.com', '9876543218', '2004-01-15', 'Male', 'O+', deptMap['CIVIL'], 3, 5, '2023-08-01', 'Inactive', '17 Heritage Square, Metro City', 'Ramesh Gupta', '9876500009', 6.95],
        ['AI2024001', 'Ishita', 'Chatterjee', 'ishita.c@example.com', '9876543219', '2005-06-22', 'Female', 'B+', deptMap['AIDS'], 2, 3, '2024-08-01', 'Active', '63 Riverfront Colony, Metro City', 'Subhash Chatterjee', '9876500010', 9.60],
        ['AI2024002', 'Dev', 'Malhotra', 'dev.malhotra@example.com', '9876543220', '2005-02-14', 'Male', 'AB-', deptMap['AIDS'], 2, 3, '2024-08-01', 'Active', '41 Silicon Towers, Metro City', 'Sunil Malhotra', '9876500011', 8.55],
        ['CS2025001', 'Zoya', 'Khan', 'zoya.khan@example.com', '9876543221', '2006-01-09', 'Female', 'O+', deptMap['CSE'], 1, 1, '2025-08-01', 'Active', '104 Lotus Boulevard, Metro City', 'Farhan Khan', '9876500012', 8.80],
        ['CV2022001', 'Rahul', 'Singh', 'rahul.singh@example.com', '9876543222', '2002-10-05', 'Male', 'A+', deptMap['CIVIL'], 4, 8, '2021-08-01', 'Graduated', '88 Cantonment Road, North City', 'Balwan Singh', '9876500013', 8.35]
      ];

      for (const s of sampleStudents) {
        await connection.query(`
          INSERT INTO students (
            roll_number, first_name, last_name, email, phone, dob,
            gender, blood_group, department_id, academic_year, semester,
            enrollment_date, status, address, guardian_name, guardian_phone, gpa
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, s);
      }
      console.log(`Seeded ${sampleStudents.length} sample students.`);
    }

    console.log('✅ Database initialization and seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during database initialization:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
