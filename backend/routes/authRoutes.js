const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { register, login, getAllUsers, updateProfile } = require('../controllers/authController');


router.put('/profile', auth, updateProfile);
router.post('/register', register);
router.post('/login', login);
router.get('/users', auth, getAllUsers);

module.exports = router;