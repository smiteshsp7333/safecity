const express = require('express');
const router = express.Router();
const { createReport, getReports, getNearbyReports, updateReportStatus } = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createReport);
router.get('/', getReports);
router.get('/nearby', getNearbyReports);
router.put('/:id/status', auth, updateReportStatus);

module.exports = router;