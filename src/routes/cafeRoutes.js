// src/routes/cafeRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCafes,
  getCafeById,
  createCafe,
  deleteCafe
} = require('../controllers/cafeController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');

// Browsing works for guests too, but license status affects result count
router.get('/', optionalAuthenticate, checkLicense, getAllCafes);
router.get('/:id', getCafeById);

// Adding/removing cafes requires login
router.post('/', authenticate, checkLicense, createCafe);
router.delete('/:id', authenticate, deleteCafe);

module.exports = router;