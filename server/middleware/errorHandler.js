const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  // MySQL Duplicate Entry
  if (err.code === 'ER_DUP_ENTRY') {
    let message = 'A record with this information already exists.';
    if (err.sqlMessage && err.sqlMessage.includes('roll_number')) {
      message = 'A student with this Roll Number already exists.';
    } else if (err.sqlMessage && err.sqlMessage.includes('email')) {
      message = 'A student with this Email address already exists.';
    } else if (err.sqlMessage && err.sqlMessage.includes('username')) {
      message = 'An admin with this Username already exists.';
    }
    return res.status(409).json({ success: false, message });
  }

  // MySQL Foreign Key Constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ success: false, message: 'Invalid reference specified (e.g. invalid Department ID).' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
