// src/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');
const { checkLicense } = require('../middleware/license');

router.get('/', authenticate, getFavorites);
router.post('/:cafeId', authenticate, checkLicense, addFavorite);
router.delete('/:cafeId', authenticate, removeFavorite);

module.exports = router;