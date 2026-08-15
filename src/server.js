// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const cafeRoutes = require('./routes/cafeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();

// --- Core middleware ---
app.use(cors());
app.use(express.json());

// --- Static frontend (public/) ---
app.use(express.static('public'));

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/cafes/:cafeId/reviews', reviewRoutes); // nested — mergeParams in reviewRoutes picks up :cafeId
app.use('/api/favorites', favoriteRoutes);

// --- Health check (handy for deployment platforms like Render/Railway) ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', demoMode: process.env.NODE_ENV !== 'production' });
});

// --- 404 handler ---
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// --- Global error handler (catches anything thrown/rejected and missed) ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong.' });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`☕ Coffee Shop Finder API running on http://localhost:${PORT}`);
  });
}

start();