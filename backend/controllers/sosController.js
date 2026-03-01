const twilio = require('twilio');
const User = require('../models/User');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    const message = `SOS ALERT! ${user.name} needs immediate help! Location: ${locationLink} Please contact them or call emergency services immediately!`;

    if (user.trustedContacts.length === 0) {
      return res.status(400).json({ message: 'No trusted contacts found. Please add trusted contacts first.' });
    }

    const promises = user.trustedContacts.map(contact =>
      client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: `+91${contact.phone}`
      })
    );

    await Promise.all(promises);

    res.json({ message: 'SOS sent successfully to all trusted contacts' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addTrustedContact = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    user.trustedContacts.push({ name, phone });
    await user.save();

    res.json({ message: 'Trusted contact added successfully', contacts: user.trustedContacts });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};