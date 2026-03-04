const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'ngo', 'admin'], default: 'user' },
  trustedContacts: [{ name: String, phone: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);