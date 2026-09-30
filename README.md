# Saraswati College of Engineering - Student Management System (SMS)

A full-stack Student Management System built for **Saraswati College of Engineering** using **React**, **Node.js**, **Express**, and **MySQL**.

---

## 🌟 Key Features

1. **Administrator Authentication (Login)**: Secure JWT token-based authentication with bcrypt-hashed credentials and session persistence.
2. **Admin Dashboard**: Real-time KPI summary (Total Students, Active Students, Graduated Alumni, Department count), interactive department distribution bars, gender ratio, year-wise batch strength, and recent admissions table.
3. **Add Student**: Multi-section enrollment modal with instant client & server validation (roll number, names, email, phone, DOB, gender, blood group, department, year, semester, GPA, address, and guardian emergency contact).
4. **Edit Student**: Pre-populated update modal allowing full profile modifications with conflict prevention.
5. **Delete Student**: Safe confirmation dialog with soft-delete archiving to preserve academic history.
6. **Search & Multi-Facet Filtering**: Real-time search by Roll Number, Name, Email, or Phone; filter by Department, Status (Active/Inactive/Graduated/Suspended), Academic Year, and Gender; sort by multiple columns with pagination.
7. **Student Profile Details**: Comprehensive modal displaying personal records, academic standing, contact details, and emergency guardian information.
8. **Responsive UI**: Mobile-first architecture built with Tailwind CSS, slide-out mobile drawer, desktop sidebar, and responsive mobile card fallbacks.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons), Axios, React Router DOM
- **Backend**: Node.js, Express.js, `mysql2/promise` (connection pooling), `dotenv`, `cors`, `bcryptjs`, `jsonwebtoken`
- **Database**: MySQL 8.0 (`college_sms_db`)

---

## 🚀 Default Administrator Credentials

| Field | Value |
| :--- | :--- |
| **Username** | `admin` (or `admin@college.edu`) |
| **Password** | `admin123` |
| **Role** | System Administrator |

*(A convenient "Fill Default Admin Credentials" button is also provided on the login page)*

---

## 📂 Project Structure

```
├── database/
│   ├── schema.sql           # MySQL database & table definitions
│   └── seed.sql             # SQL seed queries
├── server/
│   ├── config/db.js         # MySQL2 promise connection pool
│   ├── controllers/         # Auth, Student, Department, Dashboard controllers
│   ├── middleware/          # JWT auth & centralized error handler
│   ├── routes/              # Express REST API routes
│   ├── scripts/initDb.js    # Automated database creation & seed script
│   ├── server.js            # Express server entry point (Port: 5000)
│   └── package.json
└── client/
    ├── src/
    │   ├── components/      # Layout, Sidebar, Navbar, Modals
    │   ├── context/         # AuthContext & ToastContext
    │   ├── pages/           # LoginPage, DashboardPage, StudentsPage
    │   ├── services/api.js  # Configured Axios client with JWT interceptor
    │   ├── App.jsx          # Route orchestration & global modal triggers
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🏃 Running the Application

### 1. Database & Backend Setup
```bash
cd server
npm install
npm run init-db   # Initializes college_sms_db, creates tables, and seeds sample data
npm start         # Runs Express API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev       # Runs Vite dev server on http://localhost:5173
```

Access the web portal in your browser at: **`http://localhost:5173`**
