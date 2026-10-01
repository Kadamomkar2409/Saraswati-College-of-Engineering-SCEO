const express = require('express');

const {
  getNoticeEvents,
  createNoticeEvent,
  deleteNoticeEvent
} = require('../controllers/noticeEventController');

const router = express.Router();

// Get all notices and events
router.get('/', getNoticeEvents);

// Create a notice or event
router.post('/', createNoticeEvent);

// Delete a notice or event
router.delete('/:id', deleteNoticeEvent);

module.exports = router;