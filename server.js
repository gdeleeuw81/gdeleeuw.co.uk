// server.js
const express = require('express');
const fs      = require('fs');
const path    = require('path');
const fetch   = require('node-fetch');
const app     = express();

const DATA_FILE = path.join(__dirname, 'visitors.json');
const PUBLIC    = path.join(__dirname);

// Ensure visitors.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]');
}

// Serve static assets (CSS, images, JS, etc)
app.use(express.static(PUBLIC));
app.use(express.static(path.join(__dirname, 'assets')));

// — Home page —
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

// — Clean “/visitors” route with logging + serve —
app.get('/visitors', async (req, res) => {
  // User agent & IP
  const ua = req.headers['user-agent'];
  const ip = req.headers['cf-connecting-ip'] || req.ip;
    const excludedIPs = ['127.0.0.1', '194.35.235.40'];
  if (excludedIPs.includes(ip)) {
    return res.sendFile(path.join(PUBLIC, 'visitors.html')); // Skip logging
  }

  // Geo fields
  let city = 'Unknown', country = 'Unknown';
  let latitude = null, longitude = null;

  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const data   = await geoRes.json();
    city        = data.city    || 'Unknown';
    country     = data.country || 'Unknown';
    latitude    = data.latitude  || null;
    longitude   = data.longitude || null;
  } catch (err) {
    console.error('Geo lookup failed:', err.message);
  }

  // OS detection
  const os = /Windows/.test(ua)      ? 'Windows'
           : /Mac/.test(ua)          ? 'MacOS'
           : /Linux/.test(ua)        ? 'Linux'
           : /Android/.test(ua)      ? 'Android'
           : /iPhone|iPad/.test(ua)  ? 'iOS'
           : 'Unknown';

  // Device type
  const device = /Mobi|Android/i.test(ua) ? 'Mobile' : 'Desktop';

  // Timestamp
  const ts = new Date().toISOString();

  // Read, append, and save logs
  const logs = JSON.parse(fs.readFileSync(DATA_FILE));
  logs.push({
    ts,
    ip,
    city,
    country,
    latitude,
    longitude,
    browser: ua,
    os,
    device
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));

  // Serve the visitors page
  res.sendFile(path.join(PUBLIC, 'visitors.html'));
});

// — Redirect legacy .html URL to clean URL —
app.get('/visitors.html', (req, res) => {
  res.redirect(301, '/visitors');
});

// — API endpoint for JSON logs —
app.get('/api/visitors', (req, res) => {
  try {
    const logs = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read log data' });
  }
});

// — Start the server —
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Visitor logging server running on port ${PORT}`);
});
