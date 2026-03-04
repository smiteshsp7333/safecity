const User = require('../models/User');
const twilio = require('twilio');
const policeStations = require('../data/policeStations');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// find nearest police station
function findNearestStation(latitude, longitude) {
  let nearest = null;
  let minDist = Infinity;
  policeStations.forEach(station => {
    const dist = Math.sqrt(
      Math.pow(station.coordinates[1] - latitude, 2) +
      Math.pow(station.coordinates[0] - longitude, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = station;
    }
  });
  return nearest;
}

exports.sendSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const nearestStation = findNearestStation(latitude, longitude);

    // send SMS to trusted contacts
    const contactPromises = user.trustedContacts.map(contact =>
      client.messages.create({
        body: `🚨 SOS! ${user.name} needs help! Location: ${locationLink} Nearest Station: ${nearestStation.name}`,
        from: process.env.TWILIO_PHONE,
        to: `+91${contact.phone}`
      })
    );

    await Promise.all(contactPromises);

    // emit real time SOS alert to admin
    req.io.emit('sos_alert', {
      userId: user._id,
      userName: user.name,
      userPhone: user.phone,
      latitude,
      longitude,
      locationLink,
      nearestStation: nearestStation.name,
      stationPhone: nearestStation.phone,
      timestamp: new Date()
    });

    res.json({
      message: `SOS sent! Nearest station: ${nearestStation.name}`,
      nearestStation,
      contactsAlerted: user.trustedContacts.length
    });

  } catch (err) {
    res.status(500).json({ message: 'SOS failed', error: err.message });
  }
};

exports.addContact = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    user.trustedContacts.push({ name, phone });
    await user.save();
    res.json({ message: 'Contact added', contacts: user.trustedContacts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ contacts: user.trustedContacts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.trustedContacts = user.trustedContacts.filter(
      contact => contact._id.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: 'Contact deleted', contacts: user.trustedContacts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};