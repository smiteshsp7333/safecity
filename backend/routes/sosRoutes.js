const express = require('express');
const router = express.Router();
const { sendSOS, addTrustedContact, getContacts, deleteContact } = require('../controllers/sosController');
const auth = require('../middleware/authMiddleware');

router.post('/send', auth, sendSOS);
router.post('/add-contact', auth, addTrustedContact);
router.get('/contacts', auth, getContacts);
router.delete('/contacts/:id', auth, deleteContact);

module.exports = router;