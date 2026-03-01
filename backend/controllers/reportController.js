const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { address, category, description, severity, anonymous, coordinates } = req.body;

    const report = await Report.create({
      user: anonymous ? null : req.user.id,
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      address,
      category,
      description,
      severity,
      anonymous
    });

    res.status(201).json({ message: 'Report created successfully', report });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getNearbyReports = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};