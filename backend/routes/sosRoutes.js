const express = require('express');
const router = express.Router();
const { sendSOS, addTrustedContact } = require('../controllers/sosController');
const auth = require('../middleware/authMiddleware');

router.post('/send', auth, sendSOS);
router.post('/add-contact', auth, addTrustedContact);

module.exports = router;