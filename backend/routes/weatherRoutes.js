const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// GET /api/weather?lat=...&lon=...
router.get('/', authMiddleware.authenticate, async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        error: 'Valid latitude and longitude are required'
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'Weather service is not configured'
      });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(apiKey)}&units=metric`
    );

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch weather data'
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      data: { weather: data }
    });
  } catch (error) {
    logger.error('Weather fetch error', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
});

module.exports = router;
