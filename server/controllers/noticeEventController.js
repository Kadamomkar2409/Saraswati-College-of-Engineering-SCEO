const db = require('../config/db');

// Get all active notices and events
const getNoticeEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ne.id,
        ne.type,
        ne.title,
        ne.description,
        ne.event_date,
        ne.event_time,
        ne.venue,
        ne.created_at,
        a.full_name AS created_by_name
      FROM notices_events ne
      LEFT JOIN admins a ON ne.created_by = a.id
      WHERE ne.is_active = TRUE
      ORDER BY 
        CASE WHEN ne.type = 'Event' THEN ne.event_date END ASC,
        ne.created_at DESC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching notices/events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notices and events'
    });
  }
};

// Add a new notice or event
const createNoticeEvent = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      event_date,
      event_time,
      venue
    } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Type, title and description are required'
      });
    }

    if (!['Notice', 'Event'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be Notice or Event'
      });
    }

    if (type === 'Event' && !event_date) {
      return res.status(400).json({
        success: false,
        message: 'Event date is required for events'
      });
    }

    const createdBy = req.user?.id || null;

    const [result] = await db.query(`
      INSERT INTO notices_events
      (type, title, description, event_date, event_time, venue, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      type,
      title,
      description,
      type === 'Event' ? event_date : null,
      type === 'Event' ? event_time || null : null,
      type === 'Event' ? venue || null : null,
      createdBy
    ]);

    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Error creating notice/event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notice/event'
    });
  }
};

// Delete a notice or event
const deleteNoticeEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`
      UPDATE notices_events
      SET is_active = FALSE
      WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notice/Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Notice/Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notice/event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notice/event'
    });
  }
};

module.exports = {
  getNoticeEvents,
  createNoticeEvent,
  deleteNoticeEvent
};